import { FriendCardGamePlayer } from "../../GameFlow/FriendCardGamePlayer.js";

export class OtherFriendCardGamePlayerDTO {
	constructor(private id: string, private username: string, private numCards: number) {}

	public static CreateFromFriendCardGamePlayer(friendCardGamePlayer: FriendCardGamePlayer): OtherFriendCardGamePlayerDTO {
		return new OtherFriendCardGamePlayerDTO(
			friendCardGamePlayer.id,
			friendCardGamePlayer.username,
			friendCardGamePlayer.deckLogic.GetNumOfCardsInDeck()
		);
	}
}
