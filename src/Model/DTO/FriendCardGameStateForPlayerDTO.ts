import { CardId } from "../../Enum/CardConstant.js";
import { FriendCardGameLogic } from "../../GameLogic/Game/FriendCardGameLogic.js";
import { FriendCardPlayerLogic } from "../../GameLogic/Player/FriendCardPlayerLogic.js";
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

	public static CreateFromFriendCardGameAndPlayer(friendCardGame: FriendCardGameLogic, friendCardPlayer: FriendCardPlayerLogic): FriendCardGameStateForPlayerDTO
    {
		return new FriendCardGameStateForPlayerDTO(
			friendCardGame.currentPlayer.id,
			ThisFriendCardGamePlayerDTO.CreateFromFriendCardGamePlayer(friendCardPlayer),
			friendCardGame.playersInOrder
				.filter((player) => !player.isDisconnected)
				.map((friendCardPlayer: FriendCardPlayerLogic) => OtherFriendCardGamePlayerDTO.CreateFromFriendCardGamePlayer(friendCardPlayer)),
			friendCardGame.GetActionsDTOForPlayer(friendCardPlayer),
		);
	}
}