import { CardId, ColorType } from "../../Enum/CardConstant.js";
import { DeckLogic } from "../Card/DeckLogic.js";
import { GameRoomLogic } from "./GameRoomLogic.js";
import { PlayerLogic } from "../Player/PlayerLogic.js";
import { ShuffleArray } from "../Utils/Tools.js";
import { ActionsDTO } from "../../Model/DTO/ActionsDTO.js";
import { FriendCardPlayerLogic } from "../Player/FriendCardPlayerLogic.js";
import { FriendCardGameRoundLogic } from "./FriendCardGameRoundLogic.js";

export class FriendCardGameRoomLogic extends GameRoomLogic
{
    protected winner?: FriendCardPlayerLogic | undefined;
    protected playersInGame = new Map<string, FriendCardPlayerLogic>();
    private roundsInGame : FriendCardGameRoundLogic[] = [];
    private currentRoundNumber: number = 0;
    private readonly totalNumRound = 4;
    public Start() : void
    {
        this.InitRoundInGame();
        super.SetStartState();
        this.GetCurrentRoundGame()?.StartRound(this.GetAllPlayerAsArray());
    }
    private InitRoundInGame(): void
    {
        for (let i = 0; i < 4; i++) { this.roundsInGame.push(new FriendCardGameRoundLogic()); }
        this.currentRoundNumber = 0;
    }
    public GetCurrentRoundGame(): FriendCardGameRoundLogic { return this.roundsInGame[this.currentRoundNumber]; }
    public GetAllPlayerAsArray(): FriendCardPlayerLogic[] { return Array.from(this.playersInGame.values()); }
    public NextRound() : void
    {
        this.currentRoundNumber++;
        if (this.currentRoundNumber >= this.totalNumRound) this.currentRoundNumber = 0;
    }
    public DisconnectPlayer(player: FriendCardPlayerLogic) : void
    {

    }
}