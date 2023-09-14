import { GAME_STATE } from "../../Enum/GameState.js";
import { GAME_TYPE } from "../../Enum/GameType.js";
import { PlayerDTO } from "../../Model/DTO/PlayerDTO.js";
import { GamesStoreLogic } from "./GameStoreLogic.js";
import { PlayerLogic } from "../Player/PlayerLogic.js";

export abstract class GameRoomLogic
{
    private gameState: number = GAME_STATE.NOT_STARTED;
	protected abstract winner?: PlayerLogic;
    protected abstract playersInGame: Map<string, PlayerLogic>;
	private removeFromGameStoreTimeout?: NodeJS.Timeout;
    
    constructor(
        public readonly gameType: GAME_TYPE,
		public readonly owner: { id: string; username: string },
		public readonly maxPlayers: number,
		public readonly roomName: string,
		public readonly isPasswordProtected: boolean,
		public readonly createdAt: Date,
		public readonly id: string,
		public readonly password?: string)
    {
    }
    public AddPlayer(player: PlayerLogic): void
    {
		this.playersInGame.set(player.id, player);
		this.StopRemoveFromGameStoreTimeout();
	}
    public GetPlayerById(id: string): PlayerLogic | undefined { return this.playersInGame.get(id); }
    public GetAllPlayersDTO(): PlayerDTO[] { return Array.from(this.playersInGame.values()).map((player) => PlayerDTO.CreateFromPlayer(player)); }

    public AreAllPlayersReady(): boolean { return Array.from(this.playersInGame.values()).every((player) => player.GetIsReady()); }
    public NumPlayersInGame(): number { return this.playersInGame.size; }
    public NumConnectedPlayersInGame(): number { return Array.from(this.playersInGame.values()).filter((player) => !player.GetIsDisconnected()).length; }
    public IsRoomFull(): boolean { return this.maxPlayers - this.NumPlayersInGame() <= 0; }
    public SetStartState(): void { this.gameState = GAME_STATE.STARTED; }
    public SetFinishState(): void { this.gameState = GAME_STATE.FINISHED; }
    public GetGameRoomState(): number { return this.gameState }
    public DisconnectPlayer(player: PlayerLogic): void
    {
        if (this.gameState === GAME_STATE.NOT_STARTED) this.playersInGame.delete(player.id);
        else player.SetDisconnected(true);
        if (this.NumConnectedPlayersInGame() <= 0) this.StartRemoveFromGameStoreTimeout();
    }
    private StartRemoveFromGameStoreTimeout(): void
    {
        this.removeFromGameStoreTimeout = setTimeout(() => {
            GamesStoreLogic.getInstance.DeleteGameById(this.id);
        }, 3 * 60000);
    }
    private StopRemoveFromGameStoreTimeout(): void 
    {
		if (this.removeFromGameStoreTimeout) 
            clearTimeout(this.removeFromGameStoreTimeout);
	}
}