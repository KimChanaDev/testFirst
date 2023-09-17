import { CardId } from "../../Enum/CardConstant.js";
import { FriendCardGameRoom } from "../../GameFlow/Game/FriendCardGameRoom.js";
import { FriendCardPlayer } from "../../GameFlow/Player/FriendCardPlayer.js";
import { ActionsDTO } from "./ActionsDTO.js";
import { OtherFriendCardGamePlayerDTO } from "./OtherFriendCardGamePlayerDTO.js";
import { ThisFriendCardGamePlayerDTO } from "./ThisFriendCardGamePlayerDTO.js";

export class FriendCardGameStateForPlayerDTO{
	private constructor(
		private currentPlayerId: string | undefined,
		private thisFriendCardGame: ThisFriendCardGamePlayerDTO,
		private friendCardGameInOrder: OtherFriendCardGamePlayerDTO[],
		private thisPlayerActions: ActionsDTO,
	) {}

	public static CreateFromFriendCardGameAndPlayer(gameRoom: FriendCardGameRoom, player: FriendCardPlayer): FriendCardGameStateForPlayerDTO
    {
		return new FriendCardGameStateForPlayerDTO(
			gameRoom.GetCurrentRoundGame()?.GetCurrentPlayer().id,
			ThisFriendCardGamePlayerDTO.CreateFromFriendCardGamePlayer(player),
			gameRoom.GetAllPlayerAsArray().filter((p: FriendCardPlayer) => !p.GetIsDisconnected())
				.map((p: FriendCardPlayer) => OtherFriendCardGamePlayerDTO.CreateFromFriendCardGamePlayer(p)),
			gameRoom.GetCurrentRoundGame().GetActionsDTOForPlayer(player),
		);
	}
}