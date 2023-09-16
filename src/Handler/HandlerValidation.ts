import { CardId } from "../Enum/CardConstant.js";
import { GAME_STATE } from "../Enum/GameState.js";
import { FriendCardGameRoomLogic } from "../GameLogic/Game/FriendCardGameRoomLogic.js";
import { FriendCardPlayerLogic } from "../GameLogic/Player/FriendCardPlayerLogic.js";

export abstract class HandlerValidation
{
    public static CanPlayerPlayCard(gameRoom: FriendCardGameRoomLogic, player: FriendCardPlayerLogic, cardId: CardId): void
    {
        if (!gameRoom.GetCurrentRoundGame().CanPlayerPlayCard(player, cardId))
        {
            throw new Error("Cannot play that card");
        }
    }
    public static GameAndRoundStarted(gameRoom: FriendCardGameRoomLogic): void
    {
        if(gameRoom.GetGameRoomState() !== GAME_STATE.STARTED || gameRoom.GetCurrentRoundGame().GetRoundState() !== GAME_STATE.STARTED)
        {
            throw new Error("Game not started");
        }
    }
    public static IsWinnerAuction(gameRoom: FriendCardGameRoomLogic, player: FriendCardPlayerLogic): void
    {
        if(gameRoom.GetCurrentRoundGame().GetHighestAuctionPlayer().id !== player.id)
        {
            throw new Error("You are not the winning auction");
        }
    }
    public static IsOwnerRoom(gameRoom: FriendCardGameRoomLogic, player: FriendCardPlayerLogic): void
    {
        if(player.id === gameRoom.owner.id)
        {
            throw new Error("You are not Owner");
        }
    }
}