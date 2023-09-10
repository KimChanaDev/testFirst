import { CardId } from "../../Enum/CardConstant.js";
import { DeckLogic } from "../Card/DeckLogic.js";
import { GameLogic } from "../Game/GameLogic.js";
import { PlayerLogic } from "./PlayerLogic.js";
import { ShuffleArray } from "../Utils/Tools.js";
import { ActionsDTO } from "../../Model/DTO/ActionsDTO.js";
import { FriendCardPlayerLogic } from "./FriendCardPlayerLogic.js";

export class FriendCardGameLogic extends GameLogic
{
    protected playersInGame = new Map<string, FriendCardPlayerLogic>();
    public winner?: FriendCardPlayerLogic | undefined;
    private readonly deck = new DeckLogic();
	private readonly discarded = new DeckLogic();
    public playersInOrder: FriendCardPlayerLogic[] = [];
    private currentPlayerNumber: number = 0;

	//private isCardPlayedThisTurn: boolean = false;
	//private isCardTakenThisTurn: boolean = false;
    public get currentPlayer(): FriendCardPlayerLogic
    {
        return this.playersInOrder[this.currentPlayerNumber];
    }
    public GetActionsDTOForPlayer(player: FriendCardPlayerLogic): ActionsDTO {
		return {
			canPlayerTakeCard: this.CanPlayerTakeCard(player),
			cardsPlayerCanPlay: this.CardsPlayerCanPlay(player),
			canPlayerFinishTurn: this.CanPlayerFinishTurn(player),
		};
	}
    private CanPlayerTakeCard(player: FriendCardPlayerLogic): boolean
    {
        return !this.IsPlayerTurn(player.id) ? false : true;
    }
    private CardsPlayerCanPlay(player: FriendCardPlayerLogic): CardId[]
    {
        return !this.IsPlayerTurn(player.id) ? [] : player.handDeck.GetInDeck();
    }
    public CanPlayerFinishTurn(player: FriendCardPlayerLogic): boolean
    {
        return !this.IsPlayerTurn(player.id) || player.numCardsToTake > 0 ? false : true;
	}
    public CanPlayerPlayCard(player: FriendCardPlayerLogic, cardId: CardId): boolean
    {
        const playerHand: CardId[] = this.CardsPlayerCanPlay(player);
        return playerHand.indexOf(cardId) >= 0;
    }
    public Start() : void
    {
        super.SetStartState();
        this.playersInOrder = ShuffleArray(Array.from(this.playersInGame.values()));
        this.currentPlayerNumber = 0;
        this.deck.Full();
		this.discarded.Empty();
        this.playersInOrder.forEach((player: FriendCardPlayerLogic) => {
			player.handDeck.Empty();
			player.handDeck.Add(this.deck.PopNumRandomCards(13));
		});
    }
    public DisconnectPlayer(player: FriendCardPlayerLogic) : void
    {

    }
    private NextPlayer() : void
    {
        if (this.currentPlayerNumber >= this.numPlayersInGame - 1) this.currentPlayerNumber = 0;
		else this.currentPlayerNumber++;
    }
    public FinishTurn() : void
    {
        if (this.currentPlayer.numTurnsToWait > 0) this.currentPlayer.numTurnsToWait--;
		this.NextPlayer();
		//while (!this.currentPlayer.isActive) return this.FinishTurn();
    }
    public PlayCard(cardId: CardId) : CardId
    {
        this.discarded.Add(cardId);
        return cardId;
    }
    private IsPlayerTurn(playerId: string) : boolean
    {
        return this.currentPlayer.id === playerId;
    }
    
}