import { CardId, ColorType } from "../../Enum/CardConstant.js";
import { DeckLogic } from "../Card/DeckLogic.js";
import { GameRoomLogic } from "./GameRoomLogic.js";
import { PlayerLogic } from "../Player/PlayerLogic.js";
import { ShuffleArray } from "../Utils/Tools.js";
import { ActionsDTO } from "../../Model/DTO/ActionsDTO.js";
import { FriendCardPlayerLogic } from "../Player/FriendCardPlayerLogic.js";
import { FriendCardGameRoundLogic } from "./FriendCardGameRoundLogic.js";
import { GAME_STATE } from "../../Enum/GameState.js";

export class FriendCardGameRoomLogic extends GameRoomLogic
{
    protected winner?: FriendCardPlayerLogic | undefined;
    protected playersInGame = new Map<string, FriendCardPlayerLogic>();
    private roundsInGame: FriendCardGameRoundLogic[] = [];
    private currentRoundNumber: number = 0;
    private readonly totalNumberRound: number = 4;
    public Start(): void
    {
        if (this.NumPlayersInGame() < 4) throw Error("Minimum 4 players required");
        if (!this.AreAllPlayersReady()) throw Error('Not all players ready');
        this.InitRoundInGame();
        super.SetStartState();
        this.GetCurrentRoundGame().StartRound(this.GetAllPlayerAsArray());
    }
    private InitRoundInGame(): void
    {
        for (let i = 0; i < 4; i++) { this.roundsInGame.push(new FriendCardGameRoundLogic()); }
        this.currentRoundNumber = 0;
    }
    public GetCurrentRoundGame(): FriendCardGameRoundLogic { return this.roundsInGame[this.currentRoundNumber]; }
    public GetAllPlayerAsArray(): FriendCardPlayerLogic[] { return Array.from(this.playersInGame.values()); }
    public NextRound(): void
    {
        this.currentRoundNumber++;
        if (this.currentRoundNumber >= this.totalNumberRound) this.currentRoundNumber = 0;
    }
    public DisconnectPlayer(player: FriendCardPlayerLogic): void
    {
        super.DisconnectPlayer(player);

		if (this.GetGameRoomState() === GAME_STATE.STARTED)
        {
			if (this.NumConnectedPlayersInGame() === 1)
            {
				this.winner = Array.from(this.playersInGame.values()).find((player) => !player.GetIsDisconnected());
				return this.GetCurrentRoundGame().FinishRound();
			}
            else
            {
                // TODO add bot player
                // if (this.GetCurrentRoundGame().GetCurrentPlayer().id === player.id)  // TODO bot play
                //     console.log('Bot play!');
            }
		}
    }
    public FinishGame(): void
    {

    }
}