import { Server, Socket } from "socket.io";
import { GAME_TYPE } from "../Enum/GameType.js";
import { SocketHandler } from "./SocketHandler.js";
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

export class FriendCardGameHandler extends SocketHandler
{
    constructor(io: Server) {
		super(io, GAME_TYPE.FRIENDCARDGAME);
	}
    protected OnConnection(socket: Socket, gameRoom: FriendCardGameRoomLogic, player: FriendCardPlayerLogic): void
    {
        if (!(gameRoom instanceof FriendCardGameRoomLogic)) throw new Error('GameType mismatch');
		if (!(player instanceof FriendCardPlayerLogic)) throw new Error('PlayerType mismatch');

        socket.on(SOCKET_GAME_EVENTS.START_GAME, (callback: (messageToLog: string) => void) => {
			if (gameRoom.NumPlayersInGame() < 4) return callback('Minimum 4 players required');
			if (!player.isOwner && !gameRoom.AreAllPlayersReady()) return callback('Not all players ready');
			gameRoom.Start();
			this.EmitToRoomAndSender(socket, SOCKET_GAME_EVENTS.START_GAME, gameRoom.id);
		});
        socket.on(SOCKET_GAME_EVENTS.AUCTION, (auctionPoint: number, callback: (messageToLog: string) => void) => {
            if ( auctionPoint % 5 !== 0 || auctionPoint < 55 || auctionPoint > 100) return callback('Incorrect auction point');
            if ( gameRoom.GetGameRoomState() !== GAME_STATE.STARTED) return callback('Game not started');
            gameRoom.GetCurrentRoundGame()?.CalculateAuction(auctionPoint);
        });
        socket.on(SOCKET_GAME_EVENTS.SELECT_MAIN_CARD, (trumpColor: ColorType, friendCard: CardId, callback: (messageToLog: string) => void) => {
            if ( gameRoom.GetGameRoomState() !== GAME_STATE.STARTED) return callback('Game not started');
            gameRoom.GetCurrentRoundGame()?.SetTrumpAndFriend(trumpColor, friendCard);
        });
        socket.on(SOCKET_GAME_EVENTS.GET_GAME_STATE, (callback: (friendCardGameStateForPlayer: FriendCardGameStateForPlayerDTO) => void) => {
				callback(FriendCardGameStateForPlayerDTO.CreateFromFriendCardGameAndPlayer(gameRoom, player));
			}
		);
        
        socket.on(SOCKET_GAME_EVENTS.CARD_PLAYED,(cardId: CardId, callback: (response: CardPlayedResponseDTO | BaseResponseDTO) => void) => {
                if (!gameRoom.GetCurrentRoundGame()?.CanPlayerPlayCard(player, cardId))
                {
                    callback({
                        success: false,
                        error: 'Cannot play that card' 
                    } as BaseResponseDTO);
                } 
                else
                {
                    player.GetHandCard().Remove(cardId);
                    const playedCard: CardId | undefined = gameRoom.GetCurrentRoundGame()?.PlayCard(cardId);
                    if (playedCard)
                    {
                        const cardPlayedDTO: CardPlayedDTO = {
                            playerId: player.id,
                            cardId: playedCard
                        };
                        socket.to(gameRoom.id).emit(SOCKET_GAME_EVENTS.CARD_PLAYED, cardPlayedDTO);
                        callback({
                            success: true,
                            actions: gameRoom.GetCurrentRoundGame()?.GetActionsDTOForPlayer(player),
                            cardId: playedCard
                        } as CardPlayedResponseDTO);
                    }
                }
                
		    }
        );
        
        socket.on(SOCKET_GAME_EVENTS.TURN_FINISHED,(callback: (response: TurnFinishedResponseDTO | BaseResponseDTO) => void) => {
                if (!gameRoom.GetCurrentRoundGame()?.CanPlayerFinishTurn(player))
                {
                    callback({ 
                        success: false, 
                        error: 'Cannot finish turn' 
                    } as BaseResponseDTO);
                }
                else
                {
                    gameRoom.GetCurrentRoundGame()?.FinishTurn();
                    const currentPlayer: FriendCardPlayerLogic | undefined = gameRoom.GetCurrentRoundGame()?.GetCurrentPlayer();
                    if(currentPlayer){
                        const turnFinishedDTO: TurnFinishedDTO = { playerId: currentPlayer.id };
                        socket.to(gameRoom.id).emit(SOCKET_GAME_EVENTS.TURN_FINISHED, turnFinishedDTO);
                        // if (currentPlayer.id !== player.id)
                        // {
                        //     socket.to(currentPlayer.socketId).emit(SOCKET_GAME_EVENTS.UPDATE_ACTIONS, game.GetActionsDTOForPlayer(currentPlayer));
                        // }
                        callback({
                            success: true,
                            playerId: currentPlayer.id,
                            actions: gameRoom.GetCurrentRoundGame()?.GetActionsDTOForPlayer(player)
                        } as TurnFinishedResponseDTO);
                    }
                }
                
            }
        );
    }
}