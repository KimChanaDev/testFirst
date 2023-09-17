import { CardId, ColorType } from "../../Enum/CardConstant.js";
import { DeckLogic } from "../Card/DeckLogic.js";
import { GameRoomLogic } from "./GameRoomLogic.js";
import { PlayerLogic } from "../Player/Player.js";
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
    public StartProcess(): void
    {
        this.InitFourRoundInGame();
        super.SetStartState();
        this.GetCurrentRoundGame().StartRoundProcess(this.GetAllPlayerAsArray());
    }
    private InitFourRoundInGame(): void
    {
        for (let i = 0; i < 4; i++) { this.roundsInGame.push(new FriendCardGameRoundLogic()); }
        this.currentRoundNumber = 0;
    }
    public GetCurrentRoundGame(): FriendCardGameRoundLogic { return this.roundsInGame[this.currentRoundNumber]; }
    public IsCurrentRoundGameFinish(): boolean { return this.GetCurrentRoundGame().GetRoundState() === GAME_STATE.FINISHED && this.GetCurrentRoundGame().GetGameplayState() === GAME_STATE.FINISHED; }
    public GetAllPlayerAsArray(): FriendCardPlayerLogic[] { return Array.from(this.playersInGame.values()); }
    public NextRoundProcess(): void
    {
        this.currentRoundNumber++;
        if (this.currentRoundNumber >= this.totalNumberRound)
        {
            this.currentRoundNumber = 0;
            this.CalculateGameWinner();
        } 
    }
    private CalculateGameWinner(): void
    {
        this.roundsInGame.forEach(a => {
            
        })
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