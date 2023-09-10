import { Namespace, Server, Socket} from 'socket.io';
import { ExtendedError } from '../../node_modules/socket.io/dist/namespace.js';
import { GAME_TYPE } from '../Enum/GameType.js';
import { GameLogic } from '../GameLogic/Game/GameLogic.js';
import { PlayerLogic } from '../GameLogic/Player/PlayerLogic.js';
import { GamesStoreLogic } from '../GameLogic/Game/GameStoreLogic.js';
import { GAME_STATE } from '../Enum/GameState.js';
import { PlayerFactoryLogic } from '../GameLogic/Player/PlayerFactoryLogic.js';
import { PlayerDTO } from '../Model/DTO/PlayerDTO.js';
import { BUILD_IN_SOCKET_GAME_EVENTS, SOCKET_EVENT, SOCKET_GAME_EVENTS } from '../Enum/SocketEvents.js';
import { Types } from 'mongoose';
import { GameFinishedDTO } from '../Model/DTO/GameFinishedDTO.js';
import { log } from 'console';
import { UserModel } from '../Model/Entity/UserEntity.js';
import { SocketBadConnectionError, SocketGameAlreadyStartedError, SocketGameNotExistError, SocketRoomFullError, SocketSessionExpiredError, SocketUnauthorizedError, SocketUserAlreadyConnectedError, SocketWrongRoomPasswordError } from '../Error/SocketErrorException.js';
import { IJwtValidation, ValidateJWT } from '../GameLogic/Utils/Authorization/JWT.js';
import { JwtValidationError } from '../Enum/JwtValidationError.js';
import { HttpError } from '../Error/HttpError.js';
import { SocketError } from '../Error/SocketError.js';

export type SocketNextFunction = (err?: ExtendedError | undefined) => void;
export abstract class SocketHandler
{
    protected static connectedUsers: Set<string> = new Set<string>();
	protected static io: Server;
	private static isIoSet: boolean = false;
    protected namespace: Namespace;
	protected abstract OnConnection(socket: Socket, game: GameLogic, player: PlayerLogic): void;

    constructor(io: Server, namespaceName: GAME_TYPE) {
		if (!SocketHandler.isIoSet) {
			SocketHandler.io = io;
			SocketHandler.isIoSet = true;
		}

		const namespace: string = '/' + namespaceName;
		SocketHandler.InitializeIo(namespace);
		this.namespace = SocketHandler.io.of(namespace);
		this.RegisterListeners();
	}
    private RegisterListeners(): void
	{
		type GameAndPlayerType = {game: GameLogic, player: PlayerLogic};
		this.namespace.on(BUILD_IN_SOCKET_GAME_EVENTS.CONNECTION, (socket: Socket) => {
			const gameAndPlayer: GameAndPlayerType | undefined = this.RegisterBaseListeners(socket);
			if (!gameAndPlayer) return;
			this.OnConnection(socket, gameAndPlayer.game, gameAndPlayer.player);
		});
	}

	private RegisterBaseListeners(socket: Socket): { game: GameLogic; player: PlayerLogic } | undefined
	{
		let gameAndPlayerResult: { game: GameLogic; player: PlayerLogic } | undefined;
		if (!socket?.handshake?.query?.gameId || !socket.middlewareData.jwt?.sub)
		{
			console.log("Error connection detail not collect!");
			socket.disconnect();
			gameAndPlayerResult = undefined;
		}
		else
		{
			console.log(`Socket ${socket.id} connected`);
			const gameId: string = socket.handshake.query.gameId as string;
			const userId: string = socket.middlewareData.jwt?.sub as string;

			const game: GameLogic | undefined = GamesStoreLogic.getInstance.GetGame(gameId) as GameLogic;
			const player: PlayerLogic | undefined = game?.GetPlayer(userId) as PlayerLogic;
			if (!game || !player)
			{
				gameAndPlayerResult = undefined;
			}
			else
			{
				socket.on(SOCKET_GAME_EVENTS.PLAYER_TOGGLE_READY, () => {
					player.ToggleIsReady();
					this.EmitToRoomAndSender(socket, SOCKET_GAME_EVENTS.PLAYER_TOGGLE_READY, gameId, PlayerDTO.CreateFromPlayer(player));
				});
				socket.on(BUILD_IN_SOCKET_GAME_EVENTS.DISCONNECT, (disconnectReason: string) => {
					SocketHandler.connectedUsers.delete(userId);
					game.DisconnectPlayer(player);
					if (game.gameState === GAME_STATE.FINISHED) {
						const gameFinishedDTO: GameFinishedDTO = { winnerUsername: (game.winner as PlayerLogic).username };
						this.EmitToRoomAndSender(socket, SOCKET_GAME_EVENTS.GAME_FINISHED, gameId, gameFinishedDTO);
					} else
						this.EmitToRoomAndSender( socket, SOCKET_GAME_EVENTS.PLAYER_DISCONNECTED, gameId, PlayerDTO.CreateFromPlayer(player)
					);
					console.log(`Socket ${socket.id} disconnected - ${disconnectReason}`);
				});
				socket.on(BUILD_IN_SOCKET_GAME_EVENTS.ERROR, (error: Error) => {
					console.log(`Socket Error - ${error.toString()}`);
					socket.disconnect();
				});
				gameAndPlayerResult = {game, player};
			}
		}	
		return gameAndPlayerResult;
	}
	protected EmitToRoomAndSender(socket: Socket, event: SOCKET_EVENT, gameId: string, ...args: any[]): void
	{
		socket.to(gameId).emit(event, ...args);
		socket.emit(event, ...args);
	}

    private static InitializeIo(namespace: string): void
    {
		SocketHandler.io
			.of(namespace)
			.use(this.AddMiddlewareDataProperty)
			.use(this.VerifyJwt)
			.use(this.ConnectToGameRoom);
    }
	private static AddMiddlewareDataProperty(socket: Socket, next: SocketNextFunction): void
	{
		socket.middlewareData = {};
	}
	private static VerifyJwt(socket: Socket, next: SocketNextFunction): void
	{
		if (!socket.handshake.query.token) 
			return next(new SocketUnauthorizedError());
		const validationResult: IJwtValidation = ValidateJWT(socket.handshake.query.token as string);
		if (validationResult.success)
		{
			socket.middlewareData.jwt = validationResult.payload;
			return next();
		}
		else if (validationResult.error === JwtValidationError.EXPIRED)
		{
			console.log(validationResult.error);
			return next(new SocketSessionExpiredError());
		}
		else
		{
			return next(new SocketUnauthorizedError());
		}
	}
	private static async ConnectToGameRoom(socket: Socket, next: SocketNextFunction): Promise<void>
	{
		const gameId = socket.handshake.query.gameId as string;
		const userId = socket.middlewareData.jwt?.sub as string;
		let nextFunction: void;
		if (!socket.handshake.query.gameId || !socket.middlewareData.jwt)
		{
			nextFunction = next(new SocketBadConnectionError());
		}
		else if(SocketHandler.connectedUsers.has(userId)) 
		{
			nextFunction = next(new SocketUserAlreadyConnectedError());
		}
		else
		{
			try 
			{
				const user = await UserModel.findById(userId);
				const game = GamesStoreLogic.getInstance.GetGame(gameId);
 
				if (!user)
					nextFunction = next(new SocketBadConnectionError());
				else if (!game)
					nextFunction = next(new SocketGameNotExistError());
				else if (game.gameState !== GAME_STATE.NOT_STARTED)
					nextFunction = next(new SocketGameAlreadyStartedError());
				else if (game.isPasswordProtected)
				{
					const password = socket.handshake.query.password;
					if (!password)
						nextFunction = next(new SocketWrongRoomPasswordError());
					else if (game.password != password)
						nextFunction = next(new SocketWrongRoomPasswordError());
				}
				else if (game.IsRoomFull())
					nextFunction = next(new SocketRoomFullError());
				else
				{
					SocketHandler.connectedUsers.add(userId);
					const newPlayer = PlayerFactoryLogic.CreatePlayerObject(
						game.gameType,
						user.id,
						user.username,
						socket.id,
						game.owner.id === user.id
					);
					game.AddPlayer(newPlayer);
					socket.join(gameId);
					socket.to(gameId).emit(SOCKET_GAME_EVENTS.PLAYER_CONNECTED, PlayerDTO.CreateFromPlayer(newPlayer));
					socket.emit(SOCKET_GAME_EVENTS.PLAYERS_IN_GAME, {
					 	players: game.GetAllPlayersDTO(),
						thisPlayer: PlayerDTO.CreateFromPlayer(newPlayer),
					});
					nextFunction = next();
				}

			} 
			catch (error) 
			{
				console.log(error);
				nextFunction = next(new SocketError());
			}
		}
		return nextFunction;
	}
}