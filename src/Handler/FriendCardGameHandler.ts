import { Server, Socket } from "socket.io";
import { GAME_TYPE } from "../Enum/GameType.js";
import { SocketHandler } from './SocketHandler.js';
import { FriendCardPlayerLogic } from "../GameLogic/Player/FriendCardPlayerLogic.js";
import { FriendCardGameRoomLogic } from "../GameLogic/Game/FriendCardGameRoomLogic.js";
import { SOCKET_GAME_EVENTS } from "../Enum/SocketEvents.js";
import { FriendCardGameStateForPlayerDTO } from "../Model/DTO/FriendCardGameStateForPlayerDTO.js";
import { CardId, ColorType } from "../Enum/CardConstant.js";
import { CardPlayedDTO } from "../Model/DTO/CardPlayedDTO.js";
import { BaseResponseDTO } from "../Model/DTO/Response/BaseResponseDTO.js";
import { CardPlayedResponseDTO } from "../Model/DTO/Response/CardPlayedResponseDTO.js";
import { TurnFinishedDTO } from "../Model/DTO/TurnFinishedDTO.js";
import { TurnFinishedResponseDTO } from "../Model/DTO/Response/TurnFinishedResponseDTO.js";
import { GAME_STATE } from "../Enum/GameState.js";
import { AuctionPointDTO, AuctionPointResponseDTO } from "../Model/DTO/AuctionPointDTO.js";
import { TrumpAndFriendDTO } from "../Model/DTO/TrumpAndFriendDTO.js";

export class FriendCardGameHandler extends SocketHandler
{
    constructor(io: Server) {
		super(io, GAME_TYPE.FRIENDCARDGAME);
	}
    protected OnConnection(socket: Socket, gameRoom: FriendCardGameRoomLogic, player: FriendCardPlayerLogic): void
    {
        if (!(gameRoom instanceof FriendCardGameRoomLogic)) throw new Error('GameType mismatch');
		if (!(player instanceof FriendCardPlayerLogic)) throw new Error('PlayerType mismatch');

        socket.on(SOCKET_GAME_EVENTS.START_GAME, (callback: (response: BaseResponseDTO) => void) => {
			if (player.id === gameRoom.owner.id)
            {
                try
                {
                    gameRoom.Start();
                    this.EmitToRoomAndSender(socket, SOCKET_GAME_EVENTS.START_GAME, gameRoom.id);
                    callback({ success: true } as BaseResponseDTO);
                }
                catch(ex : any)
                {
                    callback({ success: false, error: ex?.message } as BaseResponseDTO);
                }
            }
            else
            {
                callback({ success: false, error: "You are not Host" } as BaseResponseDTO);
            }
		});
        socket.on(SOCKET_GAME_EVENTS.AUCTION, (auctionPass: boolean, auctionPoint: number, callback: (response: AuctionPointResponseDTO | BaseResponseDTO) => void) => {
            if(gameRoom.GetGameRoomState() === GAME_STATE.STARTED && gameRoom.GetCurrentRoundGame().GetRoundState() === GAME_STATE.STARTED)
            {
                try
                {
                    gameRoom.GetCurrentRoundGame().Auction(auctionPass, auctionPoint);
                    const [nextPlayerId, highestAuctionPlayerId, currentAuctionPoint, gameplayState] = gameRoom.GetCurrentRoundGame().GetInfoForAuctionPointResponse();
                    const auctionPointDTO: AuctionPointDTO = {
                        nextPlayerId: nextPlayerId,
                        currentHighestAuctionPlayerId: highestAuctionPlayerId,
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
            }
            else
            {
                callback({ success: false, error: "Game not started" } as BaseResponseDTO);
            }
        });
        socket.on(SOCKET_GAME_EVENTS.SELECT_MAIN_CARD, (trumpColor: ColorType, friendCard: CardId, callback: (response: TrumpAndFriendDTO | BaseResponseDTO) => void) => {
            let errorMessage: string = "";
            if(gameRoom.GetGameRoomState() !== GAME_STATE.STARTED || gameRoom.GetCurrentRoundGame().GetRoundState() !== GAME_STATE.STARTED)
                errorMessage = "Game not started";
            else if(gameRoom.GetCurrentRoundGame().GetHighestAuctionPlayer().id !== player.id)
                errorMessage = "You are not the winning bidder";   
            else
            {
                try
                {
                    gameRoom.GetCurrentRoundGame().SetTrumpAndFriend(trumpColor, friendCard);
                    const trumpAndFriendDTO :TrumpAndFriendDTO = {
                        trumpColor: trumpColor,
                        friendCard: friendCard
                    };
                    socket.to(gameRoom.id).emit(SOCKET_GAME_EVENTS.SELECT_MAIN_CARD, trumpAndFriendDTO);
                    return callback({
                        success: true,
                        trumpColor: trumpColor,
                        friendCard: friendCard
                    } as TrumpAndFriendDTO);
                }
                catch(error: any)
                {
                    errorMessage = error?.message
                }
            }
            if(errorMessage !== "")
                return callback({ success: false, error: errorMessage } as BaseResponseDTO);
        });
        socket.on(SOCKET_GAME_EVENTS.GET_GAME_STATE, (callback: (friendCardGameStateForPlayer: FriendCardGameStateForPlayerDTO) => void) => {
            callback(FriendCardGameStateForPlayerDTO.CreateFromFriendCardGameAndPlayer(gameRoom, player));
		});
        socket.on(SOCKET_GAME_EVENTS.CARD_PLAYED,(cardId: CardId, callback: (response: CardPlayedResponseDTO | BaseResponseDTO) => void) => {
            if (!gameRoom.GetCurrentRoundGame().CanPlayerPlayCard(player, cardId))
            {
                callback({
                    success: false,
                    error: 'Cannot play that card' 
                } as BaseResponseDTO);
            }
            else
            {
                try
                {
                    player.GetHandCard().Remove(cardId);
                    const playedCard: CardId = gameRoom.GetCurrentRoundGame().PlayCard(cardId, player.id);
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
                catch(error: any)
                {
                    callback({
                        success: false,
                        error: error?.message 
                    } as BaseResponseDTO);
                }
            }
        });
    }
}