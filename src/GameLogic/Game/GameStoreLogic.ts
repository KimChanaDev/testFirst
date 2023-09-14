import { GameRoomLogic } from './GameRoomLogic.js';
import { GAME_STATE } from '../../Enum/GameState.js';
export class GamesStoreLogic
{
	private static instance: GamesStoreLogic;
	public static get getInstance(): GamesStoreLogic { return this.instance || (this.instance = new this()); }
	private activeGames = new Map<string, GameRoomLogic>();
    private constructor() {}

	public AddGame(game: GameRoomLogic): void { this.activeGames.set(game.id, game); }
	public GetGameById(gameId: string): GameRoomLogic | undefined { return this.activeGames.get(gameId); }
	public DeleteGameById(id: string): void { this.activeGames.delete(id); }
	public GetAllGamesAsArray(): GameRoomLogic[] { return Array.from(this.activeGames.values()); }
	public GetAllNotStartedGamesAsArray(): GameRoomLogic[] { return this.GetAllGamesAsArray().filter((game) => game.GetGameRoomState() === GAME_STATE.NOT_STARTED); }
}
