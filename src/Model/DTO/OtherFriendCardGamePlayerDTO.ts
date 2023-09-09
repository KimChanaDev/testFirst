import { FriendCardPlayer } from "../../GameFlow/FriendCardPlayer.js";

export class OtherFriendCardGamePlayerDTO {
	constructor(private id: string, private username: string, private numCards: number) {}

	public static CreateFromFriendCardGamePlayer(friendCardGamePlayer: FriendCardPlayer): OtherFriendCardGamePlayerDTO {
		return new OtherFriendCardGamePlayerDTO(
			friendCardGamePlayer.id,
			friendCardGamePlayer.username,
			friendCardGamePlayer.handDeck.GetNumOfCardsInDeck()
		);
	}
}
