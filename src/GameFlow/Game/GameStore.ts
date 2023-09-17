import { GameRoom } from './GameRoom.js';
import { GAME_STATE } from '../../Enum/GameState.js';
export class GamesStore
{
	private static instance: GamesStore;
	public static get getInstance(): GamesStore { return this.instance || (this.instance = new this()); }
	private activeGames = new Map<string, GameRoom>();
    private constructor() {}

	public AddGame(game: GameRoom): void { this.activeGames.set(game.id, game); }
	public GetGameById(gameId: string): GameRoom | undefined { return this.activeGames.get(gameId); }
	public DeleteGameById(id: string): void { this.activeGames.delete(id); }
	public GetAllGamesAsArray(): GameRoom[] { return Array.from(this.activeGames.values()); }
	public GetAllNotStartedGamesAsArray(): GameRoom[] { return this.GetAllGamesAsArray().filter((game) => game.GetGameRoomState() === GAME_STATE.NOT_STARTED); }
}
