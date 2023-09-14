import { CardId } from "../../Enum/CardConstant.js";
import { FriendCardGameRoomLogic } from "../../GameLogic/Game/FriendCardGameRoomLogic.js";
import { FriendCardPlayerLogic } from "../../GameLogic/Player/FriendCardPlayerLogic.js";
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

	public static CreateFromFriendCardGameAndPlayer(gameRoom: FriendCardGameRoomLogic, player: FriendCardPlayerLogic): FriendCardGameStateForPlayerDTO
    {
		return new FriendCardGameStateForPlayerDTO(
			gameRoom.GetCurrentRoundGame()?.GetCurrentPlayer().id,
			ThisFriendCardGamePlayerDTO.CreateFromFriendCardGamePlayer(player),
			gameRoom.GetAllPlayerAsArray().filter((p: FriendCardPlayerLogic) => !p.GetIsDisconnected())
				.map((p: FriendCardPlayerLogic) => OtherFriendCardGamePlayerDTO.CreateFromFriendCardGamePlayer(p)),
			gameRoom.GetCurrentRoundGame().GetActionsDTOForPlayer(player),
		);
	}
}