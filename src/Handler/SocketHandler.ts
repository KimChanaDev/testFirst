import { Namespace, Server, Socket } from 'socket.io';
import { GAME_TYPE } from '../Enum/GameType.js';
import { Game } from '../GameFlow/Game.js';
import { Player } from '../GameFlow/Player.js';

export abstract class SocketHandler
{
    protected static connectedUsers: Set<string> = new Set<string>();
	protected static io: Server;
	private static isIoSet: boolean = false;

    protected namespace: Namespace;
	protected abstract onConnection(socket: Socket, game: Game, player: Player): void;

    constructor(io: Server, namespaceName: GAME_TYPE) {
		if (!SocketHandler.isIoSet) {
			SocketHandler.io = io;
			SocketHandler.isIoSet = true;
		}

		const namespace: string = '/' + namespaceName;
		SocketHandler.initializeIo(namespace);
		this.namespace = SocketHandler.io.of(namespace);
		this.registerListeners();
	}
    private registerListeners(): void {
		// TODO on socket for recieve connection
	}
    private static initializeIo(namespace: string): void
    {
        // TODO Use Verify user and connect to game room

    }
}