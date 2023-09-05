import { GAME_STATE } from "../Enum/GameState.js";
import { GAME_TYPE } from "../Enum/GameType.js";
import { PlayerDTO } from "../Model/DTO/PlayerDTO.js";
import { GamesStore } from "./GameStoreLogic.js";
import { PlayerLogic } from "./PlayerLogic.js";

export abstract class GameLogic
{
    public gameState: number = GAME_STATE.NOT_STARTED;
    protected abstract playersInGame: Map<string, PlayerLogic>;
	public abstract winner?: PlayerLogic;
	private removeFromGameStoreTimeout?: NodeJS.Timeout;
    
    constructor(
        public readonly gameType: GAME_TYPE,
		public readonly owner: { id: string; username: string },
		public readonly maxPlayers: number,
		public readonly roomName: string,
		public readonly isPasswordProtected: boolean,
		public readonly created: number,
		public readonly id: string,
		public readonly password?: string)
    {
    }

    public get numPlayersInGame(): number 
    {
		return this.playersInGame.size;
	}

    public get numConnectedPlayersInGame(): number 
    {
		return Array.from(this.playersInGame.values()).filter((player) => !player.isDisconnected).length;
	}

    public IsRoomFull(): boolean 
    {
		return this.maxPlayers - this.numPlayersInGame <= 0;
	}

    public Start(): void 
    {
		this.gameState = GAME_STATE.STARTED;
	}

    public Finish(): void 
    {
		this.gameState = GAME_STATE.FINISHED;
	}
    
    public GetAllPlayersDTO(): PlayerDTO[] 
    {
        return Array.from(this.playersInGame.values()).map((player) => PlayerDTO.CreateFromPlayer(player));
    }
        
    public GetPlayer(id: string): PlayerLogic | undefined
    {
        return this.playersInGame.get(id);
    }

    public AreAllPlayersReady(): boolean
    {
        return Array.from(this.playersInGame.values()).every((player) => player.isReady);
    }

    public DisconnectPlayer(player: PlayerLogic): void
    {
        if (this.gameState === GAME_STATE.NOT_STARTED) this.playersInGame.delete(player.id);
        else player.isDisconnected = true;
        if (this.numConnectedPlayersInGame <= 0) this.StartRemoveFromGameStoreTimeout();
    }
    protected StartRemoveFromGameStoreTimeout(): void {
        this.removeFromGameStoreTimeout = setTimeout(() => {
            GamesStore.getInstance.DeleteGame(this.id);
        }, 3 * 60000);
    }

    public AddPlayer(player: PlayerLogic): void
    {
		this.playersInGame.set(player.id, player);
		this.StopRemoveFromGameStoreTimeout();
	}
    protected StopRemoveFromGameStoreTimeout(): void 
    {
		if (this.removeFromGameStoreTimeout) 
            clearTimeout(this.removeFromGameStoreTimeout);
	}

}