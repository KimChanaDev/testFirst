import { CardId } from "../../Enum/CardConstant.js";
import { FriendCardGamePlayer } from "../../GameFlow/FriendCardGamePlayer.js";

export class ThisFriendCardGamePlayerDTO {
	constructor(private id: string, private username: string, private cardIds: CardId[]) {}

	public static CreateFromFriendCardGamePlayer(friendCardGamePlayer: FriendCardGamePlayer): ThisFriendCardGamePlayerDTO {
		return new ThisFriendCardGamePlayerDTO(friendCardGamePlayer.id, friendCardGamePlayer.username, friendCardGamePlayer.deckLogic.GetInDeck());
	}
}
