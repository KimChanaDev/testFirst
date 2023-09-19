import { Server, Socket } from "socket.io";
import { GAME_TYPE } from "../Enum/GameType.js";
import { SocketHandler } from './SocketHandler.js';
import { FriendCardPlayer } from "../GameFlow/Player/FriendCardPlayer.js";
import { FriendCardGameRoom } from "../GameFlow/Game/FriendCardGameRoom.js";
import { SOCKET_GAME_EVENTS } from "../Enum/SocketEvents.js";
import { FriendCardGameStateForPlayerDTO } from "../Model/DTO/FriendCardGameStateForPlayerDTO.js";
import { CardId, ColorType } from "../Enum/CardConstant.js";
import { CardPlayedDTO } from "../Model/DTO/CardPlayedDTO.js";
import { BaseResponseDTO } from "../Model/DTO/Response/BaseResponseDTO.js";
import { CardPlayedResponseDTO } from "../Model/DTO/Response/CardPlayedResponseDTO.js";
import { AuctionPointDTO, AuctionPointResponseDTO } from "../Model/DTO/AuctionPointDTO.js";
import { TrumpAndFriendDTO } from "../Model/DTO/TrumpAndFriendDTO.js";
import { HandlerValidation } from "./HandlerValidation.js";

export class FriendCardGameHandler extends SocketHandler
{
    constructor(io: Server) {
		super(io, GAME_TYPE.FRIENDCARDGAME);
	}
    protected OnConnection(socket: Socket, gameRoom: FriendCardGameRoom, player: FriendCardPlayer): void
    {
        if (!(gameRoom instanceof FriendCardGameRoom)) throw new Error('GameType mismatch');
		if (!(player instanceof FriendCardPlayer)) throw new Error('PlayerType mismatch');

        socket.on(SOCKET_GAME_EVENTS.START_GAME, (callback: (response: BaseResponseDTO) => void) => {
            try
            {
                HandlerValidation.IsOwnerRoom(gameRoom, player);
                HandlerValidation.PlayerGreaterThanFour(gameRoom);
                HandlerValidation.AreAllPlayersReady(gameRoom);
                gameRoom.StartProcess();
                this.EmitToRoomAndSender(socket, SOCKET_GAME_EVENTS.START_GAME, gameRoom.id);
                callback({ success: true } as BaseResponseDTO);
            }
            catch(ex : any)
            {
                callback({ success: false, error: ex?.message } as BaseResponseDTO);
            }
		});
        socket.on(SOCKET_GAME_EVENTS.AUCTION, (auctionPass: boolean, auctionPoint: number, callback: (response: AuctionPointResponseDTO | BaseResponseDTO) => void) => {
            try
            {
                HandlerValidation.GameAndRoundStarted(gameRoom);
                HandlerValidation.IsPlayerTurn(gameRoom, player);
                HandlerValidation.AcceptableAuctionPoint(auctionPass, auctionPoint);
                HandlerValidation.AuctionPointGreaterThan(auctionPass, auctionPoint, gameRoom.GetCurrentRoundGame().GetAuctionPoint());
                gameRoom.GetCurrentRoundGame().AuctionProcess(auctionPass, auctionPoint);
                const [nextPlayerId, highestAuctionPlayerId, currentAuctionPoint, gameplayState] = gameRoom.GetCurrentRoundGame().GetInfoForAuctionPointResponse();
                const auctionPointDTO: AuctionPointDTO = {
                    nextPlayerId: nextPlayerId,
                    currentHighestAuctionPlayerId: highestAuctionPlayerId ?? '',
                    currentAuctionPoint: currentAuctionPoint,
                    gameplayState: gameplayState
                };
                socket.to(gameRoom.id).emit(SOCKET_GAME_EVENTS.AUCTION, auctionPointDTO);
                callback({
                    success: true,
                    nextPlayerId: nextPlayerId,
                    currentHighestAuctionPlayerId: highestAuctionPlayerId,
                    currentAuctionPoint: currentAuctionPoint,
                    gameplayState: gameplayState
                } as AuctionPointResponseDTO);
            }
            catch(ex: any)
            {
                callback({ success: false, error: ex.message } as BaseResponseDTO);
            }
        });
        socket.on(SOCKET_GAME_EVENTS.SELECT_MAIN_CARD, (trumpColor: ColorType, friendCard: CardId, callback: (response: TrumpAndFriendDTO | BaseResponseDTO) => void) => {
            try
            {
                HandlerValidation.GameAndRoundAndGameplayStarted(gameRoom);
                HandlerValidation.IsWinnerAuction(gameRoom, player);
                HandlerValidation.NotHasCardInHand(gameRoom, friendCard);
                gameRoom.GetCurrentRoundGame().SetTrumpAndFriendProcess(trumpColor, friendCard);
                const trumpAndFriendDTO :TrumpAndFriendDTO = {
                    trumpColor: trumpColor,
                    friendCard: friendCard
                };
                socket.to(gameRoom.id).emit(SOCKET_GAME_EVENTS.SELECT_MAIN_CARD, trumpAndFriendDTO);
                callback({
                    success: true,
                    trumpColor: trumpColor,
                    friendCard: friendCard
                } as TrumpAndFriendDTO);
            }
            catch(error: any)
            {
                callback({ success: false, error: error?.message } as BaseResponseDTO);
            }
        });
        socket.on(SOCKET_GAME_EVENTS.GET_GAME_STATE, (callback: (friendCardGameStateForPlayer: FriendCardGameStateForPlayerDTO) => void) => {
            callback(FriendCardGameStateForPlayerDTO.CreateFromFriendCardGameAndPlayer(gameRoom, player));
		});
        socket.on(SOCKET_GAME_EVENTS.CARD_PLAYED,(cardId: CardId, callback: (response: CardPlayedResponseDTO | BaseResponseDTO) => void) => {
            try
            {
                HandlerValidation.HasCardOnHandAndIsTurn(gameRoom, player, cardId);
                const playedCard: CardId = gameRoom.GetCurrentRoundGame().PlayCardProcess(cardId, player.id);
                if (gameRoom.IsCurrentRoundGameFinished())
                {
                    gameRoom.NextRoundProcess();
                }
                const cardPlayedDTO: CardPlayedDTO = {
                    playerId: player.id,
                    cardId: playedCard
                };
                socket.to(gameRoom.id).emit(SOCKET_GAME_EVENTS.CARD_PLAYED, cardPlayedDTO);
                callback({
                    success: true,
                    actions: gameRoom.GetCurrentRoundGame().GetActionsDTOForPlayer(player),
                    cardId: playedCard
                } as CardPlayedResponseDTO);
            }
            catch (error: any)
            {
                callback({ success: false, error: error?.message } as BaseResponseDTO);
            }
        });
    }
}