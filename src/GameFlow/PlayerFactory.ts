import { GAME_TYPE } from "../Enum/GameType.js";
import { FriendCardPlayer } from "./FriendCardPlayer.js";
import { PlayerLogic } from "../GameLogic/PlayerLogic.js";

export class PlayerFactory
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
            return new FriendCardPlayer(id, username, socketId, isOwner);
        //throw new BadRequestError(); 404
        return null!; // remove when throw err
	}
}