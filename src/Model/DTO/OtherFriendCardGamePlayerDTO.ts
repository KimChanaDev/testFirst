import { FriendCardPlayerLogic } from "../../GameLogic/Player/FriendCardPlayerLogic.js";

export class OtherFriendCardGamePlayerDTO {
	constructor(private id: string, private username: string, private numCards: number) {}

	public static CreateFromFriendCardGamePlayer(friendCardGamePlayer: FriendCardPlayerLogic): OtherFriendCardGamePlayerDTO {
		return new OtherFriendCardGamePlayerDTO(
			friendCardGamePlayer.id,
			friendCardGamePlayer.username,
			friendCardGamePlayer.handDeck.GetNumOfCardsInDeck()
		);
	}
}
