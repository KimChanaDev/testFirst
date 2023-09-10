import { CardId } from "../../Enum/CardConstant.js";
import { FriendCardPlayerLogic } from "../../GameLogic/Player/FriendCardPlayerLogic.js";

export class ThisFriendCardGamePlayerDTO {
	constructor(private id: string, private username: string, private cardIds: CardId[]) {}

	public static CreateFromFriendCardGamePlayer(friendCardGamePlayer: FriendCardPlayerLogic): ThisFriendCardGamePlayerDTO {
		return new ThisFriendCardGamePlayerDTO(friendCardGamePlayer.id, friendCardGamePlayer.username, friendCardGamePlayer.handDeck.GetInDeck());
	}
}
