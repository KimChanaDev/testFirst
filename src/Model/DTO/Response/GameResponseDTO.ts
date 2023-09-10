import { GAME_TYPE } from "../../../Enum/GameType.js";
import { GameLogic } from "../../../GameLogic/Game/GameLogic.js";
import { UserResponseDTO } from "./UserResponseDTO.js";

export class GameResponseDTO
{
	constructor(
		private gameType: GAME_TYPE,
		private owner: UserResponseDTO,
		private maxPlayers: number,
		private roomName: string,
		private isPasswordProtected: boolean,
		private id: string,
		private numPlayersInGame: number
	) {}

	public static CreateFromGame(game: GameLogic): GameResponseDTO {
		return new GameResponseDTO(
			game.gameType,
			new UserResponseDTO(game.owner.id, game.owner.username),
			game.maxPlayers,
			game.roomName,
			game.isPasswordProtected,
			game.id,
			game.numPlayersInGame
		);
	}
}