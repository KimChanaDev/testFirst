import { CardId, ColorType } from "../../Enum/CardConstant.js";
import { GAME_STATE } from "../../Enum/GameState.js";
import { ActionsDTO } from "../../Model/DTO/ActionsDTO.js";
import { AuctionPointDTO } from "../../Model/DTO/AuctionPointDTO.js";
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
    private highestAuctionPlayerNumber: number = null!;
    private playersInOrder: FriendCardPlayerLogic[] = [];
    private currentPlayerNumber: number = 0;
    private leaderPlayerNumber: number = 0;
    private playersTeamOne = new Map<string, FriendCardPlayerLogic>();
    private playersTeamTwo = new Map<string, FriendCardPlayerLogic>();
    private stackPass: number = 0;
    private gameplayState: GAME_STATE = GAME_STATE.NOT_STARTED;
    constructor() {};
    public PlayCard(cardId: CardId): CardId
    {
        return cardId;
    }
    public GetCurrentPlayer(): FriendCardPlayerLogic { return this.playersInOrder[this.currentPlayerNumber]; }
    public GetHighestAuctionPlayer(): FriendCardPlayerLogic { return this.playersInOrder[this.highestAuctionPlayerNumber]; }
    public IsPlayerTurn(playerId: string) : boolean { return this.GetCurrentPlayer()?.id === playerId; }
    public StartPlayGame(): void
    {
        this.gameplayState = GAME_STATE.STARTED;

    }
    public StartRound(players : FriendCardPlayerLogic[]): void
    {
        if (players.length === 4)
        {
            this.playersInOrder = ShuffleArray(Array.from(players.values()));
            this.currentPlayerNumber = 0;
            this.PrepareCard();
            this.SetStartRoundState();
        }
        else
        {
            throw new Error("Players are not equal to 4");
        }
    }
    public FinishRound(): void
    {

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
    public Auction(auctionPass: boolean, newAuctionPoint: number): void
    {
        if (this.GetRoundState() !== GAME_STATE.STARTED) throw new Error('Game not started');
        if (auctionPass)
        {
            this.IncreaseStackPass();
            this.NextPlayer();
            if(this.stackPass === 3) this.StartPlayGame();
        }
        else
        {
            if (newAuctionPoint % 5 !== 0 || newAuctionPoint < 55 || newAuctionPoint > 100) throw new Error("Incorrect auction point");
            if (this.auctionPoint < newAuctionPoint)
            {
                this.auctionPoint = newAuctionPoint;
                this.highestAuctionPlayerNumber = this.currentPlayerNumber;
                this.ClearStackPass();
                this.NextPlayer();
                if (this.auctionPoint === 100) this.StartPlayGame()
            }
            else
            {
                throw new Error("New auction point less that othor player");
            }
        }
    }
    public GetInfoForAuctionPointResponse(): [string, string, number, number] { return [this.GetCurrentPlayer().id, this.GetHighestAuctionPlayer().id, this.auctionPoint, this.gameplayState]; }
    public SetTrumpAndFriend(trumpColor: ColorType, friendCard: CardId): void
    {
        if (this.GetCurrentPlayer().id === this.GetHighestAuctionPlayer().id)
        {
            if (!this.GetCurrentPlayer().GetHandCard().HasCard(friendCard))
            {
                this.trumpColor = trumpColor
                this.friendCard = friendCard;
            }
            else
            {
                throw new Error("You have this card in your hand");
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
    public CanPlayerFinishTurn(player: FriendCardPlayerLogic): boolean { return !this.IsPlayerTurn(player.id) || player.GetRequestedCardToPlay() != null ? false : true; }
    public CanPlayerPlayCard(player: FriendCardPlayerLogic, cardId: CardId): boolean
    {
        const playerHand: CardId[] = this.CardsPlayerCanPlay(player);
        return playerHand.indexOf(cardId) >= 0;
    }
    private CanPlayerTakeCard(player: FriendCardPlayerLogic): boolean { return this.IsPlayerTurn(player.id) ? true : false; }
    private CardsPlayerCanPlay(player: FriendCardPlayerLogic): CardId[] { return this.IsPlayerTurn(player.id) ? player.GetHandCard().GetInDeck() : []; }
    private IncreaseStackPass(): void { this.stackPass++; if(this.stackPass > 3) this.stackPass = 0 }
    private ClearStackPass(): void { this.stackPass = 0; }
}