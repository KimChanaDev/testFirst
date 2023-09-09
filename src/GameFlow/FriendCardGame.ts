import { CardId } from "../Enum/CardConstant.js";
import { DeckLogic } from "../GameLogic/DeckLogic.js";
import { GameLogic } from "../GameLogic/GameLogic.js";
import { PlayerLogic } from "../GameLogic/PlayerLogic.js";
import { ShuffleArray } from "../GameLogic/Utils/Tools.js";
import { ActionsDTO } from "../Model/DTO/ActionsDTO.js";
import { FriendCardPlayer } from "./FriendCardPlayer.js";

export class FriendCardGame extends GameLogic
{
    protected playersInGame = new Map<string, FriendCardPlayer>();
    public winner?: FriendCardPlayer | undefined;
    private readonly deck = new DeckLogic();
	private readonly discarded = new DeckLogic();
    public playersInOrder: FriendCardPlayer[] = [];
    private currentPlayerNumber: number = 0;

	//private isCardPlayedThisTurn: boolean = false;
	//private isCardTakenThisTurn: boolean = false;
    public get currentPlayer(): FriendCardPlayer
    {
        return this.playersInOrder[this.currentPlayerNumber];
    }
    public GetActionsDTOForPlayer(player: FriendCardPlayer): ActionsDTO {
		return {
			canPlayerTakeCard: this.CanPlayerTakeCard(player),
			cardsPlayerCanPlay: this.CardsPlayerCanPlay(player),
			canPlayerFinishTurn: this.CanPlayerFinishTurn(player),
		};
	}
    private CanPlayerTakeCard(player: FriendCardPlayer): boolean
    {
        return !this.IsPlayerTurn(player.id) ? false : true;
    }
    private CardsPlayerCanPlay(player: FriendCardPlayer): CardId[]
    {
        return !this.IsPlayerTurn(player.id) ? [] : player.handDeck.GetInDeck();
    }
    public CanPlayerFinishTurn(player: FriendCardPlayer): boolean
    {
        return !this.IsPlayerTurn(player.id) || player.numCardsToTake > 0 ? false : true;
	}
    public CanPlayerPlayCard(player: FriendCardPlayer, cardId: CardId): boolean
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
        this.playersInOrder.forEach((player: FriendCardPlayer) => {
			player.handDeck.Empty();
			player.handDeck.Add(this.deck.PopNumRandomCards(13));
		});
    }
    public DisconnectPlayer(player: FriendCardPlayer) : void
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