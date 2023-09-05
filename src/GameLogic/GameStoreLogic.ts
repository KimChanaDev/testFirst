import { GameLogic } from './GameLogic.js';
import { GAME_STATE } from '../Enum/GameState.js';
export class GamesStore {
	private static instance: GamesStore;
	private activeGames = new Map<string, GameLogic>();

    private constructor() {}

	static get getInstance(): GamesStore {
		return this.instance || (this.instance = new this());
	}

	public AddGame(game: GameLogic): void {
		this.activeGames.set(game.id, game);
	}

	public DeleteGame(id: string): void {
		this.activeGames.delete(id);
	}

	public GetGame(gameId: string): GameLogic | undefined {
		return this.activeGames.get(gameId);
	}

	get allGamesAsArray(): GameLogic[] {
		return Array.from(this.activeGames.values());
	}

	get allNotStartedGamesAsArray(): GameLogic[] {
		return this.allGamesAsArray.filter((game) => game.gameState === GAME_STATE.NOT_STARTED);
	}
}
