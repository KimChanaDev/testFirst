import { CardId } from "../Enum/CardConstant.js";
import { DeckLogic } from "../GameLogic/DeckLogic.js";
import { GameLogic } from "../GameLogic/GameLogic.js";
import { PlayerLogic } from "../GameLogic/PlayerLogic.js";
import { FriendCardPlayer } from "./FriendCardPlayer.js";

export class FriendCardGame extends GameLogic
{
    protected playersInGame = new Map<string, FriendCardPlayer>();
    public winner?: FriendCardPlayer | undefined;
    private readonly deck = new DeckLogic();
	private readonly discarded = new DeckLogic();
    public playersInOrder: FriendCardPlayer[] = [];
    private currentPlayerNumber: number = 0;

	private isCardPlayedThisTurn: boolean = false;
	private isCardTakenThisTurn: boolean = false;
    public get currentTurnPlayer(): FriendCardPlayer
    {
        
    }
    public Start() : void
    {

    }
    public DisconnectPlayer(player: FriendCardPlayer) : void
    {

    }
    private NextPlayer() : void
    {

    }
    public FinishTurn() : void
    {

    }
    public PlayCard(card: CardId) : CardId
    {

    }
    private IsPlayerTurn(playerId: number) : boolean
    {

    }
    private CanPlayerTakeCard(player: FriendCardPlayer): boolean
    {
        
    }
}