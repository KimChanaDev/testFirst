import { GAME_TYPE } from "../../Enum/GameType.js";
import { BadRequestError } from "../../Error/ErrorException.js";
import { GameRoom } from "./GameRoom.js";
import { FriendCardGameRoom } from "./FriendCardGameRoom.js";

export class GameFactory
{
	public static CreateGame(
		gameType: GAME_TYPE,
		owner: { id: string; username: string },
		maxPlayers: number,
		roomName: string,
		isPasswordProtected: boolean,
		createdAt: Date,
		id: string,
		password?: string
	): GameRoom {
		if (gameType === GAME_TYPE.FRIENDCARDGAME)
        {
			return new FriendCardGameRoom(
				gameType,
				owner,
				maxPlayers,
				roomName,
				isPasswordProtected,
				createdAt,
				id,
				password
			);
        }
        else
        {
            throw new BadRequestError();
        }

	}
}