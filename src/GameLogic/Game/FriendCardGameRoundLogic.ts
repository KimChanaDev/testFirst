import { CardId, ColorType } from "../../Enum/CardConstant.js";
import { GAME_STATE } from "../../Enum/GameState.js";
import { ActionsDTO } from "../../Model/DTO/ActionsDTO.js";
import { DeckLogic } from "../Card/DeckLogic.js";
import { FriendCardPlayerLogic } from "../Player/FriendCardPlayerLogic.js";
import { ShuffleArray } from "../Utils/Tools.js";

export class FriendCardGameRoundLogic
{
    private readonly deck = new DeckLogic();
    private readonly discarded = new DeckLogic();
    private roundState: GAME_STATE = GAME_STATE.NOT_STARTED;
    private trumpColor: ColorType = null!;
    private friendCard: CardId = null!;
    private auctionPoint: number = 50;
    private highestAuctionPlayer: FriendCardPlayerLogic = null!;
    private playersInOrder: FriendCardPlayerLogic[] = [];
    private playersTeamOne = new Map<string, FriendCardPlayerLogic>();
    private playersTeamTwo = new Map<string, FriendCardPlayerLogic>();
    private currentPlayerNumber: number = 0;
    constructor() {};
    public PlayCard(cardId: CardId): CardId
    {
        return cardId;
    }
    public GetCurrentPlayer(): FriendCardPlayerLogic { return this.playersInOrder[this.currentPlayerNumber]; }
    public IsPlayerTurn(playerId: string) : boolean { return this.GetCurrentPlayer()?.id === playerId; }
    public StartRound(players : FriendCardPlayerLogic[]): void
    {
        if (players.length === 4)
        {
            this.SetStartRoundState();
            this.playersInOrder = ShuffleArray(Array.from(players.values()));
            this.currentPlayerNumber = 0;
            this.PrepareCard();
        }
        else
        {
            this.SetFinishRoundState();
        }
    }
    private PrepareCard(): void
    {
        this.deck.Full();
        this.discarded.Empty();
        this.playersInOrder.forEach((player: FriendCardPlayerLogic) => {
            player.GetHandCard().Empty();
            player.GetHandCard().Add(this.deck.PopNumRandomCards(13));
        });
    }
    private NextPlayer() : void
    {
        this.currentPlayerNumber++;
        if (this.currentPlayerNumber >= this.playersInOrder.length) this.currentPlayerNumber = 0;
    }
    public FinishTurn() : void
    {
        if (this.GetCurrentPlayer().GetNumTurnsToWait() > 0) this.GetCurrentPlayer().DecreaseNumTurnsToWait();
		this.NextPlayer();
		while (!this.GetCurrentPlayer().IsActive()) return this.FinishTurn();
    }
    public CalculateAuction(newAuctionPoint: number): void
    {
        if (this.auctionPoint < newAuctionPoint)
        {
            this.auctionPoint = newAuctionPoint;
            this.highestAuctionPlayer = this.GetCurrentPlayer();
        }
        if (this.auctionPoint === 100)
        {
            this.SetFinishRoundState();
        }
    }
    public SetTrumpAndFriend(trumpColor: ColorType, friendCard: CardId): void
    {
        if (this.GetCurrentPlayer().id === this.highestAuctionPlayer.id)
        {
            if (!this.GetCurrentPlayer().GetHandCard().HasCard(friendCard))
            {
                this.trumpColor = trumpColor
                this.friendCard = friendCard;
            }
        }
    }
    public SetStartRoundState(): void { this.roundState = GAME_STATE.STARTED }
    public SetFinishRoundState(): void { this.roundState = GAME_STATE.FINISHED }
    public GetRoundState(): GAME_STATE { return this.roundState; }
    public GetActionsDTOForPlayer(player: FriendCardPlayerLogic): ActionsDTO {
		return {
			canPlayerTakeCard: this.CanPlayerTakeCard(player),
			cardsPlayerCanPlay: this.CardsPlayerCanPlay(player),
			canPlayerFinishTurn: this.CanPlayerFinishTurn(player),
		};
	}
    private CanPlayerTakeCard(player: FriendCardPlayerLogic): boolean { return this.IsPlayerTurn(player.id) ? true : false; }
    private CardsPlayerCanPlay(player: FriendCardPlayerLogic): CardId[] { return this.IsPlayerTurn(player.id) ? player.GetHandCard().GetInDeck() : []; }
    public CanPlayerFinishTurn(player: FriendCardPlayerLogic): boolean { return !this.IsPlayerTurn(player.id) || player.GetRequestedCardToPlay() != null ? false : true; }
    public CanPlayerPlayCard(player: FriendCardPlayerLogic, cardId: CardId): boolean
    {
        const playerHand: CardId[] = this.CardsPlayerCanPlay(player);
        return playerHand.indexOf(cardId) >= 0;
    }
}