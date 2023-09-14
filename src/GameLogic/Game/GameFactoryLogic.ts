import { GAME_TYPE } from "../../Enum/GameType.js";
import { BadRequestError } from "../../Error/ErrorException.js";
import { GameRoomLogic } from "./GameRoomLogic.js";
import { FriendCardGameRoomLogic } from "./FriendCardGameRoomLogic.js";

export class GameFactoryLogic
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
	): GameRoomLogic {
		if (gameType === GAME_TYPE.FRIENDCARDGAME)
        {
			return new FriendCardGameRoomLogic(
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