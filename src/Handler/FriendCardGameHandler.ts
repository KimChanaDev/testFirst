import { Server, Socket } from "socket.io";
import { GAME_TYPE } from "../Enum/GameType.js";
import { SocketHandler } from "./SocketHandler.js";
import { FriendCardPlayerLogic } from "../GameLogic/Player/FriendCardPlayerLogic.js";
import { FriendCardGameLogic } from "../GameLogic/Player/FriendCardGameLogic.js";
import { SOCKET_GAME_EVENTS } from "../Enum/SocketEvents.js";
import { FriendCardGameStateForPlayerDTO } from "../Model/DTO/FriendCardGameStateForPlayerDTO.js";
import { CardId } from "../Enum/CardConstant.js";
import { CardPlayedDTO } from "../Model/DTO/CardPlayedDTO.js";
import { BaseResponseDTO } from "../Model/DTO/Response/BaseResponseDTO.js";
import { CardPlayedResponseDTO } from "../Model/DTO/Response/CardPlayedResponseDTO.js";
import { TurnFinishedDTO } from "../Model/DTO/TurnFinishedDTO.js";
import { TurnFinishedResponseDTO } from "../Model/DTO/Response/TurnFinishedResponseDTO.js";

export class FriendCardGameHandler extends SocketHandler
{
    constructor(io: Server) {
		super(io, GAME_TYPE.FRIENDCARDGAME);
	}
    protected OnConnection(socket: Socket, game: FriendCardGameLogic, player: FriendCardPlayerLogic): void
    {
        if (!(game instanceof FriendCardGameLogic)) throw new Error('GameType mismatch');
		if (!(player instanceof FriendCardPlayerLogic)) throw new Error('PlayerType mismatch');

        socket.on(SOCKET_GAME_EVENTS.START_GAME, (callback: (messageToLog: string) => void) => {
			if (game.numPlayersInGame < 4) return callback('Minimum 4 players required');
			if (!player.isOwner && !game.AreAllPlayersReady()) return callback('Not all players ready');
			game.Start();
			this.EmitToRoomAndSender(socket, SOCKET_GAME_EVENTS.START_GAME, game.id);
		});

        socket.on(SOCKET_GAME_EVENTS.GET_GAME_STATE, (callback: (friendCardGameStateForPlayer: FriendCardGameStateForPlayerDTO) => void) => {
				callback(FriendCardGameStateForPlayerDTO.CreateFromFriendCardGameAndPlayer(game, player));
			}
		);
        
        socket.on(SOCKET_GAME_EVENTS.CARD_PLAYED,(cardId: CardId, callback: (response: CardPlayedResponseDTO | BaseResponseDTO) => void) => {
                let response: CardPlayedResponseDTO | BaseResponseDTO;
                if (!game.CanPlayerPlayCard(player, cardId))
                {
                    response = {
                        success: false,
                        error: 'Cannot play that card' 
                    } as BaseResponseDTO;
                } 
                else
                {
                    player.handDeck.Remove(cardId);
                    const playedCard: CardId = game.PlayCard(cardId);
                    const cardPlayedDTO: CardPlayedDTO = {
                        playerId: player.id,
                        cardId: playedCard
                    };
                    socket.to(game.id).emit(SOCKET_GAME_EVENTS.CARD_PLAYED, cardPlayedDTO);
                    response = {
                        success: true,
                        actions: game.GetActionsDTOForPlayer(player),
                        cardId: playedCard
                    } as CardPlayedResponseDTO
                }
                callback(response);
		    }
        );
        
        socket.on(SOCKET_GAME_EVENTS.TURN_FINISHED,(callback: (response: TurnFinishedResponseDTO | BaseResponseDTO) => void) => {
                let response: TurnFinishedResponseDTO | BaseResponseDTO;
                if (!game.CanPlayerFinishTurn(player))
                {
                    response = {
                        success: false,
                        error: 'Cannot finish turn'
                    } as BaseResponseDTO;
                }
                else
                {
                    game.FinishTurn();
                    const currentPlayer: FriendCardPlayerLogic = game.currentPlayer;
                    const turnFinishedDTO: TurnFinishedDTO = { playerId: currentPlayer.id };
                    socket.to(game.id).emit(SOCKET_GAME_EVENTS.TURN_FINISHED, turnFinishedDTO);
                    // if (currentPlayer.id !== player.id)
                    // {
                    //     socket.to(currentPlayer.socketId).emit(SOCKET_GAME_EVENTS.UPDATE_ACTIONS, game.GetActionsDTOForPlayer(currentPlayer));
                    // }
                    response = {
                        success: true,
                        playerId: currentPlayer.id,
                        actions: game.GetActionsDTOForPlayer(player)
                    } as TurnFinishedResponseDTO;
                }
                callback(response);
            }
        );
    }
}