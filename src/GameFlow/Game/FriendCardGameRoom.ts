import { CardId, ColorType } from "../../Enum/CardConstant.js";
import { DeckLogic } from "../../GameLogic/Card/DeckLogic.js";
import { GameRoom } from "./GameRoom.js";
import { Player } from "../Player/Player.js";
import { ShuffleArray } from "../../GameLogic/Utils/Tools.js";
import { ActionsDTO } from "../../Model/DTO/ActionsDTO.js";
import { FriendCardPlayer } from "../Player/FriendCardPlayer.js";
import { FriendCardGameRound } from "./FriendCardGameRound.js";
import { GAME_STATE } from "../../Enum/GameState.js";

export class FriendCardGameRoom extends GameRoom
{
    protected winner?: FriendCardPlayer | undefined;
    protected playersInGame = new Map<string, FriendCardPlayer>();
    private roundsInGame: FriendCardGameRound[] = [];
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
        for (let i = 0; i < this.totalNumberRound; i++) { this.roundsInGame.push(new FriendCardGameRound(i)); }
        this.currentRoundNumber = 0;
    }
    public GetCurrentRoundGame(): FriendCardGameRound { return this.roundsInGame[this.currentRoundNumber]; }
    public IsCurrentRoundGameFinished(): boolean { return this.GetCurrentRoundGame().GetRoundState() === GAME_STATE.FINISHED && this.GetCurrentRoundGame().GetGameplayState() === GAME_STATE.FINISHED; }
    public GetAllPlayerAsArray(): FriendCardPlayer[] { return Array.from(this.playersInGame.values()); }
    public NextRoundProcess(): void
    {
        this.currentRoundNumber++;
        if (this.currentRoundNumber >= this.totalNumberRound)
        {
            this.FinishGame();
        }
        this.GetCurrentRoundGame().StartRoundProcess(this.GetAllPlayerAsArray());
    }
    public DisconnectPlayer(player: FriendCardPlayer): void
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
        let winnerPoint: number = -500;
        let winnerPlayer: FriendCardPlayer | undefined;
        this.playersInGame.forEach(player => {
            if(player.GetGamepoint() > winnerPoint)
            {
                winnerPoint = player.GetGamepoint();
                winnerPlayer = player;
            }
        })
        this.winner = winnerPlayer;
        this.SetFinishState();
    }
}