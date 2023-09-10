import { GAME_TYPE } from "../../Enum/GameType.js";
import { BadRequestError } from "../../Error/ErrorException.js";
import { GameLogic } from "./GameLogic.js";
import { FriendCardGameLogic } from "../Player/FriendCardGameLogic.js";

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
	): GameLogic {
		if (gameType === GAME_TYPE.FRIENDCARDGAME)
        {
			return new FriendCardGameLogic(
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