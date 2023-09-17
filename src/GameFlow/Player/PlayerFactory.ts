import { GAME_TYPE } from "../../Enum/GameType.js";
import { BadRequestError } from "../../Error/ErrorException.js";
import { FriendCardPlayer } from "./FriendCardPlayer.js";
import { Player } from "./Player.js";

export class PlayerFactory
{
	public static CreatePlayerObject(
		gameType: GAME_TYPE,
		id: string,
		username: string,
		socketId: string,
		isOwner: boolean
	): Player
    {
        if (gameType === GAME_TYPE.FRIENDCARDGAME) 
            return new FriendCardPlayer(id, username, socketId, isOwner);
        throw new BadRequestError();
	}
}