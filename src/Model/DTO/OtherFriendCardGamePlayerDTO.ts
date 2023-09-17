import { FriendCardPlayer } from "../../GameFlow/Player/FriendCardPlayer.js";

export class OtherFriendCardGamePlayerDTO {
	constructor(private id: string, private username: string, private numCards: number) {}

	public static CreateFromFriendCardGamePlayer(friendCardGamePlayer: FriendCardPlayer): OtherFriendCardGamePlayerDTO {
		return new OtherFriendCardGamePlayerDTO(
			friendCardGamePlayer.id,
			friendCardGamePlayer.username,
			friendCardGamePlayer.GetHandCard().GetNumOfCardsInDeck()
		);
	}
}
