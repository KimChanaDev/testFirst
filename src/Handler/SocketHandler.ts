import { Namespace, Server, Socket} from 'socket.io';
import { ExtendedError } from '../../node_modules/socket.io/dist/namespace.js';
import { GAME_TYPE } from '../Enum/GameType.js';
import { GameLogic } from '../GameLogic/GameLogic.js';
import { PlayerLogic } from '../GameLogic//PlayerLogic.js';
import { UserModel } from '../Model/UserEntity.js';
import { GamesStore } from '../GameLogic/GameStoreLogic.js';
import { GAME_STATE } from '../Enum/GameState.js';
import { PlayerFactory } from '../GameFlow/PlayerFactory.js';
import { PlayerDTO } from '../Model/DTO/PlayerDTO.js';
import { SOCKET_GAME_EVENTS } from '../Enum/SocketEvents.js';

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
    private RegisterListeners(): void {
		// TODO on socket for recieve connection
	}
    private static InitializeIo(namespace: string): void
    {
		SocketHandler.io
			.of(namespace)
			.use(this.AddMiddlewareDataProperty)
			.use(this.VerifyJwt)
			.use(this.ConnectToGameRoom);
    }
	private static AddMiddlewareDataProperty(socket: Socket, Next: SocketNextFunction): void
	{
		socket.middlewareData = {};
	}
	private static VerifyJwt(socket: Socket, Next: SocketNextFunction): void
	{
		// if( success )
		// {
		// 	socket.middlewareData.jwt = payload
		// }
		// else
		// {
		// 	next(new SomeError());
		// }
	}
	private static async ConnectToGameRoom(socket: Socket, Next: SocketNextFunction): Promise<void>
	{
		const gameId = socket.handshake.query.gameId as string;
		const userId = socket.middlewareData.jwt?.sub as string;
		let nextFunction: void;
		if (!socket.handshake.query.gameId || !socket.middlewareData.jwt)
		{
			nextFunction = Next(); //throw error
		}
		else if(SocketHandler.connectedUsers.has(userId)) 
		{
			nextFunction = Next(); //throw error
		}
		else
		{
			try 
			{
				const user = await UserModel.findById(userId);
				const game = GamesStore.getInstance.GetGame(gameId);

				if (!user)
					nextFunction = Next(); //TODO throw error
				else if (!game)
					nextFunction = Next(); //TODO throw error
				else if (game.gameState !== GAME_STATE.NOT_STARTED)
					nextFunction = Next(); //TODO throw error
				else if (game.isPasswordProtected)
				{
					const password = socket.handshake.query.password;
					if (!password)
						nextFunction = Next(); //TODO throw error
					else if (game.password != password)
						nextFunction = Next(); //TODO throw error
				}
				else if (game.IsRoomFull())
					nextFunction = Next(); //TODO throw error
				else
				{
					SocketHandler.connectedUsers.add(userId);
					const newPlayer = PlayerFactory.CreatePlayerObject(
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
					nextFunction = Next(); // OK! Correct!
				}

			} 
			catch (error) 
			{
				console.log(error);
				nextFunction = Next(); //TODO throw error
			}
		}
		return nextFunction;
	}
}