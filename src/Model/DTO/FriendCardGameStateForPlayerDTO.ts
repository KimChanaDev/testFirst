import { CardId } from "../../Enum/CardConstant.js";
import { FriendCardGame } from "../../GameFlow/FriendCardGame.js";
import { FriendCardPlayer } from "../../GameFlow/FriendCardPlayer.js";
import { ActionsDTO } from "./ActionsDTO.js";
import { OtherFriendCardGamePlayerDTO } from "./OtherFriendCardGamePlayerDTO.js";
import { ThisFriendCardGamePlayerDTO } from "./ThisFriendCardGamePlayerDTO.js";

export class FriendCardGameStateForPlayerDTO{
	private constructor(
		private currentPlayerId: string,
		private thisFriendCardGame: ThisFriendCardGamePlayerDTO,
		private friendCardGameInOrder: OtherFriendCardGamePlayerDTO[],
		private thisPlayerActions: ActionsDTO,
	) {}

	public static CreateFromFriendCardGameAndPlayer(friendCardGame: FriendCardGame, friendCardPlayer: FriendCardPlayer): FriendCardGameStateForPlayerDTO
    {
		return new FriendCardGameStateForPlayerDTO(
			friendCardGame.currentPlayer.id,
			ThisFriendCardGamePlayerDTO.CreateFromFriendCardGamePlayer(friendCardPlayer),
			friendCardGame.playersInOrder
				.filter((player) => !player.isDisconnected)
				.map((friendCardPlayer: FriendCardPlayer) => OtherFriendCardGamePlayerDTO.CreateFromFriendCardGamePlayer(friendCardPlayer)),
			friendCardGame.GetActionsDTOForPlayer(friendCardPlayer),
		);
	}
}