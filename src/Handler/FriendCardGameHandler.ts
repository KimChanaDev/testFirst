import { Server } from "socket.io";
import { GAME_TYPE } from "../Enum/GameType.js";
import { SocketHandler } from "./SocketHandler.js";

export class FriendCardGameHandler extends SocketHandler
{
    constructor(io: Server) {
		super(io, GAME_TYPE.FRIENDCARDGAME);
	}
    protected OnConnection(): void
    {
        
    }
}