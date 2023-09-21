import { CardId } from "../../Enum/CardConstant.js";
import { FriendCardGameRoom } from "../../GameFlow/Game/FriendCardGameRoom.js";
import { FriendCardPlayer } from "../../GameFlow/Player/FriendCardPlayer.js";
import { ActionsDTO } from "./ActionsDTO.js";
import { OtherFriendCardGamePlayerDTO } from "./OtherFriendCardGamePlayerDTO.js";
import { ThisFriendCardGamePlayerDTO } from "./ThisFriendCardGamePlayerDTO.js";
import {GAME_STATE} from "../../Enum/GameState.js";

export class FriendCardGameStateForPlayerDTO{
	private constructor(
		private currentPlayerId: string | undefined,
		private thisFriendCardGame: ThisFriendCardGamePlayerDTO,
		private otherFriendCardGame: OtherFriendCardGamePlayerDTO[],
		private thisPlayerActions: ActionsDTO,
		private playerInOrderIds: string[],
		private gameState: GAME_STATE,
		private roundState: GAME_STATE,
		private gameplayState: GAME_STATE,
		private isFriendAppeared : boolean,
		private auctionWinnerTeamIds?: string[],
		private anotherTeamIds?: string[]
	) {}

	public static CreateFromFriendCardGameAndPlayer(gameRoom: FriendCardGameRoom, player: FriendCardPlayer): FriendCardGameStateForPlayerDTO
    {
		return new FriendCardGameStateForPlayerDTO(
			gameRoom.GetCurrentRoundGame()?.GetCurrentPlayer().id,
			ThisFriendCardGamePlayerDTO.CreateFromFriendCardGamePlayer(player),
			gameRoom.GetAllPlayerAsArray().filter((p: FriendCardPlayer) => !p.GetIsDisconnected()).map((p: FriendCardPlayer) => OtherFriendCardGamePlayerDTO.CreateFromFriendCardGamePlayer(p)),
			gameRoom.GetCurrentRoundGame().GetActionsDTOForPlayer(player),
			gameRoom.GetAllPlayerIdAsArray(),
			gameRoom.GetGameRoomState(),
			gameRoom.GetCurrentRoundGame().GetRoundState(),
			gameRoom.GetCurrentRoundGame().GetGameplayState(),
			gameRoom.GetCurrentRoundGame().IsFriendAppeared(),
			gameRoom.GetCurrentRoundGame().IsFriendAppeared() ? gameRoom.GetCurrentRoundGame().GetAuctionWinnerTeamIds() : undefined,
			gameRoom.GetCurrentRoundGame().IsFriendAppeared() ? gameRoom.GetCurrentRoundGame().GetAnotherTeamIds() : undefined
		);
	}
}