import { Server, Socket } from "socket.io";
import { GAME_TYPE } from "../Enum/GameType.js";
import { SocketHandler } from "./SocketHandler.js";
import { FriendCardPlayer } from "../GameFlow/FriendCardPlayer.js";
import { FriendCardGame } from "../GameFlow/FriendCardGame.js";
import { SOCKET_GAME_EVENTS } from "../Enum/SocketEvents.js";
import { FriendCardGameStateForPlayerDTO } from "../Model/DTO/FriendCardGameStateForPlayerDTO.js";
import { CardId } from "../Enum/CardConstant.js";
import { CardPlayedDTO } from "../Model/DTO/CardPlayedDTO.js";
import { BaseResponseDTO } from "../Model/DTO/Response/BaseResponseDTO.js";
import { CardPlayedResponseDTO } from "../Model/DTO/Response/CardPlayedResponseDTO.js";

export class FriendCardGameHandler extends SocketHandler
{
    constructor(io: Server) {
		super(io, GAME_TYPE.FRIENDCARDGAME);
	}
    protected OnConnection(socket: Socket, game: FriendCardGame, player: FriendCardPlayer): void
    {
        if (!(game instanceof FriendCardGame)) throw new Error('GameType mismatch');
		if (!(player instanceof FriendCardPlayer)) throw new Error('PlayerType mismatch');

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
				if (!game.CanPlayerPlayCard(player, cardId))
                {
                    callback({ success: false, error: 'Cannot play that card' });
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
                    callback({
                        success: true,
                        actions: game.GetActionsDTOForPlayer(player),
                        cardId: playedCard
                    });
                }
			}
		);
    }
}