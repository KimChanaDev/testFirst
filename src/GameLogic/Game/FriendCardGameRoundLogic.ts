import { CardId, ColorType } from "../../Enum/CardConstant.js";
import { GAME_STATE } from "../../Enum/GameState.js";
import { ActionsDTO } from "../../Model/DTO/ActionsDTO.js";
import { AuctionPointDTO } from "../../Model/DTO/AuctionPointDTO.js";
import { TrickCardDetailModel, TrickCardModel } from "../../Model/DTO/TrickCardModel.js";
import { CardLogic } from "../Card/CardLogic.js";
import { DeckLogic } from "../Card/DeckLogic.js";
import { FriendCardLogic } from "../Card/FriendCardLogic.js";
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
    private winnerAuctionTeam = new Map<string, FriendCardPlayerLogic>();
    private anotherTeam = new Map<string, FriendCardPlayerLogic>();
    private trickNumber: number = 1;
    private trickCardMap = new Map<number, TrickCardModel>();
    private stackPass: number = 0;
    private gameplayState: GAME_STATE = GAME_STATE.NOT_STARTED;
    constructor() {};
    public PlayCard(cardId: CardId, playerId: string): CardId
    {
        if(this.IsPlayerTurn(playerId))
        {
            let removeCard: CardId;
            const leaderCardId: CardId | undefined  = this.trickCardMap.get(this.trickNumber)?.detail.at(0)?.cardId;
            const leaderColor: ColorType | undefined = leaderCardId ? CardLogic.GetColor(leaderCardId) : undefined;
            if(leaderColor && this.GetCurrentPlayer().GetHandCard().HasColor(leaderColor))
            {
                if(leaderCardId && (CardLogic.IsColorSameAs(cardId, leaderCardId) || CardLogic.IsColor(cardId, this.trumpColor)))
                {
                    removeCard = cardId;
                }
                else
                {
                    throw new Error("Your card are not follow leader or trump card");
                }
            }
            else
            {
                removeCard = cardId;
            }
            this.GetCurrentPlayer().GetHandCard().Remove(removeCard);
            this.GetCarrentTrickCardModel()?.detail.push(new TrickCardDetailModel(playerId, removeCard));
            if(leaderColor && this.GetCarrentTrickCardModel()?.detail.length === 4) 
            {
                this.CalculateWinnerTrick(this.trumpColor, leaderColor, this.GetCarrentTrickCardModel()!);
                this.NextTrict();
            }
            return cardId;
        }
        throw new Error("Not your turn");
    }
    private CalculateWinnerTrick(trumpColor: ColorType, leaderColor: ColorType, trickCardModel: TrickCardModel): void
    {
        const trickCardDetailModel: TrickCardDetailModel[] = trickCardModel.detail;
        const winnerCard: CardId = FriendCardLogic.TrickWinnerCard(trumpColor, leaderColor, trickCardDetailModel);
        const pointInTrick: number = FriendCardLogic.FindPointInCards(trickCardDetailModel);
        const winnerId: string | undefined = trickCardDetailModel.find(a => a.cardId === winnerCard)?.playerId
        trickCardModel.winnerId = winnerId;
        trickCardModel.pointInTrick = pointInTrick;
        this.leaderPlayerNumber = this.ChangeLeaderById(winnerId);
    }
    private GetCarrentTrickCardModel(): TrickCardModel | undefined { return this.trickCardMap.get(this.trickNumber);}
    private ChangeLeaderById(leaderId?: string): number { return this.playersInOrder.findIndex(a => a.id === leaderId); }
    public NextTrict(): void
    {
        this.trickNumber++;
        if(this.trickNumber > 13) { this.FinishRound() }  // TODO add Logic when finish round
    }
    public GetFriendPlayer(): FriendCardPlayerLogic | undefined { return this.playersInOrder.find(p => {p.GetHandCard().HasCard(this.friendCard)})}
    public GetCurrentPlayer(): FriendCardPlayerLogic { return this.playersInOrder[this.currentPlayerNumber]; }
    public GetHighestAuctionPlayer(): FriendCardPlayerLogic { return this.playersInOrder[this.highestAuctionPlayerNumber]; }
    public IsPlayerTurn(playerId: string) : boolean { return this.GetCurrentPlayer()?.id === playerId; }
    public StartPlayGame(): void
    {
        this.gameplayState = GAME_STATE.STARTED;
        this.InitializeTeam();
    }
    private InitializeTeam(): void
    {
        const highestAuctionPlayer: FriendCardPlayerLogic = this.GetHighestAuctionPlayer()
        const friendPlayer: FriendCardPlayerLogic | undefined  = this.GetFriendPlayer();
        if(highestAuctionPlayer && friendPlayer)
        {
            this.winnerAuctionTeam.set(highestAuctionPlayer.id,  highestAuctionPlayer);
            this.winnerAuctionTeam.set(friendPlayer.id,  friendPlayer);
            this.playersInOrder.filter(a => a.id !== highestAuctionPlayer.id && a.id !== friendPlayer.id).forEach(a => this.anotherTeam.set(a.id, a));
            const winnerAuctionTeamArray = Array.from(this.winnerAuctionTeam.values());
            const anotherTeamArray = Array.from(this.anotherTeam.values());
            this.playersInOrder = [winnerAuctionTeamArray[0], anotherTeamArray[0], winnerAuctionTeamArray[1], anotherTeamArray[1]]
            this.leaderPlayerNumber = 0;
        }
        else
        {
            throw new Error("Initialize team error");
        }
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
    public FinishRound(): void // not finish
    {
        this.SetFinishRoundState();
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
                throw new Error("New auction point less than othor player");
            }
        }
    }
    public GetInfoForAuctionPointResponse(): [string, string, number, number] { return [this.GetCurrentPlayer().id, this.GetHighestAuctionPlayer().id, this.auctionPoint, this.gameplayState]; }
    public SetTrumpAndFriend(trumpColor: ColorType, friendCard: CardId): void
    {
        if (!this.GetCurrentPlayer().GetHandCard().HasCard(friendCard) && this.GetCurrentPlayer().id === this.GetHighestAuctionPlayer().id)
        {
            this.trumpColor = trumpColor
            this.friendCard = friendCard;
        }
        else
        {
            throw new Error("You have this card in your hand");
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