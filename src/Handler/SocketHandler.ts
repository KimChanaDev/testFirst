import { Namespace, Server, Socket} from 'socket.io';
import { ExtendedError } from '../../node_modules/socket.io/dist/namespace.js';
import { GAME_TYPE } from '../Enum/GameType.js';
import { GameRoom } from '../GameFlow/Game/GameRoom.js';
import { Player } from '../GameFlow/Player/Player.js';
import { GamesStore } from '../GameFlow/Game/GameStore.js';
import { GAME_STATE } from '../Enum/GameState.js';
import { PlayerFactory } from '../GameFlow/Player/PlayerFactory.js';
import { PlayerDTO } from '../Model/DTO/PlayerDTO.js';
import { BUILD_IN_SOCKET_GAME_EVENTS, SOCKET_EVENT, SOCKET_GAME_EVENTS } from '../Enum/SocketEvents.js';
import { GameFinishedDTO } from '../Model/DTO/GameFinishedDTO.js';
import { UserModel } from '../Model/Entity/UserEntity.js';
import { SocketBadConnectionError, SocketGameAlreadyStartedError, SocketGameNotExistError, SocketRoomFullError, SocketSessionExpiredError, SocketUnauthorizedError, SocketUserAlreadyConnectedError, SocketWrongRoomPasswordError } from '../Error/SocketErrorException.js';
import { IJwtValidation, ValidateJWT } from '../GameLogic/Utils/Authorization/JWT.js';
import { HandlerValidation } from './HandlerValidation.js';

export type SocketNextFunction = (err?: ExtendedError | undefined) => void;
export abstract class SocketHandler
{
    protected static connectedUsers: Set<string> = new Set<string>();
	protected static io: Server;
	private static isIoSet: boolean = false;
    protected namespace: Namespace;
	protected abstract OnConnection(socket: Socket, game: GameRoom, player: Player): void;

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
		try
		{
			HandlerValidation.HandshakeHasToken(socket);
			const validateResult: IJwtValidation = ValidateJWT(socket.handshake.query.token as string);
			HandlerValidation.ValidateJWTSuccess(socket, validateResult);
			socket.middlewareData.jwt = validateResult.payload;
			return next();
		}
		catch (ex : any)
		{
			if(ex instanceof SocketUnauthorizedError) return next(ex);
			if(ex instanceof SocketSessionExpiredError) return next(ex);
		}
	}
	private static async ConnectToGameRoom(socket: Socket, next: SocketNextFunction): Promise<void>
	{
		try {
			HandlerValidation.HandshakeHasGameIdAndMiddlewareHasJWT(socket);
			const gameId = socket.handshake.query.gameId as string;
			const userId = socket.middlewareData.jwt?.sub as string;
			HandlerValidation.SocketHandlerNotHasUser(userId);

			const userDoc = await UserModel.findById(userId);
			const gameRoom: GameRoom | undefined = GamesStore.getInstance.GetGameById(gameId);
			HandlerValidation.HasUserDocument(userDoc);
			HandlerValidation.HasGameRoom(gameRoom);
			HandlerValidation.GameRoomNotStarted(gameRoom!);
			HandlerValidation.CorrectGameRoomPasswordIfExist(socket, gameRoom!);
			HandlerValidation.GameRoomFull(gameRoom!);

			SocketHandler.connectedUsers.add(userId);
			const newPlayer: Player = PlayerFactory.CreatePlayerObject(
				gameRoom!.gameType,
				userDoc!.id,
				userDoc!.username,
				socket.id,
				gameRoom!.owner.id === userDoc!.id
			);
			gameRoom!.AddPlayer(newPlayer);
			socket.join(gameId);
			socket.to(gameId).emit(SOCKET_GAME_EVENTS.PLAYER_CONNECTED, PlayerDTO.CreateFromPlayer(newPlayer));
			socket.emit(SOCKET_GAME_EVENTS.PLAYERS_IN_GAME, {
				players: gameRoom!.GetAllPlayersDTO(),
				thisPlayer: PlayerDTO.CreateFromPlayer(newPlayer),
			});
			return next();
		}
		catch(ex: any)
		{
			if(ex instanceof SocketBadConnectionError) return next(ex);
			if(ex instanceof SocketGameNotExistError) return next(ex);
			if(ex instanceof SocketGameAlreadyStartedError) return next(ex);
			if(ex instanceof SocketWrongRoomPasswordError) return next(ex);
			if(ex instanceof SocketRoomFullError) return next(ex);
		}
	}
	private RegisterListeners(): void
	{
		this.namespace.on(BUILD_IN_SOCKET_GAME_EVENTS.CONNECTION, (socket: Socket) => {
			const gameAndPlayer: {gameRoom: GameRoom, player: Player} | undefined = this.RegisterBaseListeners(socket);
			if (!gameAndPlayer) return;
			this.OnConnection(socket, gameAndPlayer.gameRoom, gameAndPlayer.player);
		});
	}
	private RegisterBaseListeners(socket: Socket): { gameRoom: GameRoom; player: Player } | undefined
	{
		try
		{
			HandlerValidation.HandshakeHasGameIdAndMiddlewareHasJWT(socket);
			console.log(`Socket ${socket.id} connected`);
			const gameId: string = socket.handshake.query.gameId as string;
			const userId: string = socket.middlewareData.jwt?.sub as string;
			const gameRoom: GameRoom | undefined = GamesStore.getInstance.GetGameById(gameId) as GameRoom;
			HandlerValidation.HasGameRoom(gameRoom);
			const player: Player | undefined = gameRoom.GetPlayerById(userId) as Player;
			HandlerValidation.HasPlayerInGameRoom(player);
			
			socket.on(BUILD_IN_SOCKET_GAME_EVENTS.DISCONNECT, (disconnectReason: string) => {
				SocketHandler.connectedUsers.delete(userId);
				gameRoom.DisconnectPlayer(player);
				if (gameRoom.GetGameRoomState() === GAME_STATE.FINISHED) {
					const gameFinishedDTO: GameFinishedDTO = { winnerUsername: (gameRoom.GetWinner() as Player).username };
					this.EmitToRoomAndSender(socket, SOCKET_GAME_EVENTS.GAME_FINISHED, gameId, gameFinishedDTO);
				} else
					this.EmitToRoomAndSender(socket, SOCKET_GAME_EVENTS.PLAYER_DISCONNECTED, gameId, PlayerDTO.CreateFromPlayer(player));
				console.log(`Socket ${socket.id} disconnected - ${disconnectReason}`);
			});
			socket.on(BUILD_IN_SOCKET_GAME_EVENTS.ERROR, (error: Error) => {
				console.log(`Socket Error - ${error.toString()}`);
				socket.disconnect();
			});
			return {gameRoom, player};
		}
		catch (ex: any)
		{
			if(ex instanceof SocketBadConnectionError) { socket.disconnect(); return undefined;} 
			if(ex instanceof SocketGameNotExistError) { return undefined; } 
			if(ex instanceof Error) { return undefined; } 
		}
	}
}