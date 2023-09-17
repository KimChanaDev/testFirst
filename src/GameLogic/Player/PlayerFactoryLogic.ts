import { GAME_TYPE } from "../../Enum/GameType.js";
import { BadRequestError } from "../../Error/ErrorException.js";
import { FriendCardPlayerLogic } from "./FriendCardPlayerLogic.js";
import { PlayerLogic } from "./Player.js";

export class PlayerFactoryLogic
{
	public static CreatePlayerObject(
		gameType: GAME_TYPE,
		id: string,
		username: string,
		socketId: string,
		isOwner: boolean
	): PlayerLogic
    {
        if (gameType === GAME_TYPE.FRIENDCARDGAME) 
            return new FriendCardPlayerLogic(id, username, socketId, isOwner);
        throw new BadRequestError();
	}
}