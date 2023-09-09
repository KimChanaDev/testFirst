import { CardId } from "../../Enum/CardConstant.js";
import { FriendCardPlayer } from "../../GameFlow/FriendCardPlayer.js";

export class ThisFriendCardGamePlayerDTO {
	constructor(private id: string, private username: string, private cardIds: CardId[]) {}

	public static CreateFromFriendCardGamePlayer(friendCardGamePlayer: FriendCardPlayer): ThisFriendCardGamePlayerDTO {
		return new ThisFriendCardGamePlayerDTO(friendCardGamePlayer.id, friendCardGamePlayer.username, friendCardGamePlayer.deckLogic.GetInDeck());
	}
}
