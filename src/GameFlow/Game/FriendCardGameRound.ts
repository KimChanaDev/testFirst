import { CardId, ColorType } from "../../Enum/CardConstant.js";
import { GAME_STATE } from "../../Enum/GameState.js";
import { ActionsDTO } from "../../Model/DTO/ActionsDTO.js";
import { AuctionPointDTO } from "../../Model/DTO/AuctionPointDTO.js";
import { TrickCardDetailModel, TrickCardModel } from "../../Model/DTO/TrickCardModel.js";
import { CardLogic } from "../../GameLogic/Card/CardLogic.js";
import { DeckLogic } from "../../GameLogic/Card/DeckLogic.js";
import { FriendCardLogic } from "../../GameLogic/Card/FriendCardLogic.js";
import { FriendCardPlayer } from "../Player/FriendCardPlayer.js";
import { ShuffleArray } from "../../GameLogic/Utils/Tools.js";

export class FriendCardGameRound
{
    private readonly deck = new DeckLogic();
    private readonly discarded = new DeckLogic();
    private roundState: GAME_STATE = GAME_STATE.NOT_STARTED;
    private gameplayState: GAME_STATE = GAME_STATE.NOT_STARTED;
    private trumpColor: ColorType = null!;
    private friendCard: CardId = null!;
    private auctionPoint: number = 50;
    private playersInOrder: FriendCardPlayer[] = [];
    private highestAuctionPlayerNumber: number = null!;
    private winnerAuctionTeam = new Map<string, FriendCardPlayer>();
    private anotherTeam = new Map<string, FriendCardPlayer>();
    private trickCardMap = new Map<number, TrickCardModel>();
    private winnerTeamTotalPoint: number = 0;
    private anotherTeamTotalPoint: number = 0;
    private currentPlayerNumber: number = 0;
    private currentTrickNumber: number = 0;
    private stackPass: number = 0;
    constructor() {};
    public StartRoundProcess(players : FriendCardPlayer[]): void
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
    public AuctionProcess(auctionPass: boolean, newAuctionPoint: number): void
    {
        if (auctionPass)
        {
            this.IncreaseStackPass();
            this.NextPlayer();
            if(this.stackPass === 3) this.SetStartGameplayState();
        }
        else
        {
            this.auctionPoint = newAuctionPoint;
            this.highestAuctionPlayerNumber = this.currentPlayerNumber;
            this.ClearStackPass();
            this.NextPlayer();
            if (this.auctionPoint === 100) this.SetStartGameplayState()
        }
    }
    public SetTrumpAndFriendProcess(trumpColor: ColorType, friendCard: CardId): void
    {
        this.trumpColor = trumpColor;
        this.friendCard = friendCard;
        this.InitializeTeam();
        this.InitializeTrick(13);
    }
    
    public PlayCardProcess(cardId: CardId, playerId: string): CardId
    {
        let removeCard: CardId;
        const leaderCardId: CardId | undefined  = this.trickCardMap.get(this.currentTrickNumber)?.detail.at(0)?.cardId;
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
        const carrentTrickCardModel: TrickCardModel | undefined = this.GetCarrentTrickCardModel();
        carrentTrickCardModel?.AddCardDetail(playerId, removeCard);
        this.NextPlayer();
        if(leaderColor && carrentTrickCardModel?.detail.length === 4)
        {
            this.CalculateWinnerTrickSetNextLeader(this.trumpColor, leaderColor, carrentTrickCardModel!);
            this.NextTrict();
        }
        return removeCard;
    }
    private InitializeTrick(number: number): void { for (let i = 0; i < number; i++) this.trickCardMap.set(i, new TrickCardModel()); }
    private CalculateWinnerTrickSetNextLeader(trumpColor: ColorType, leaderColor: ColorType, trickCardModel: TrickCardModel): void
    {
        const trickCardDetailModelArray: TrickCardDetailModel[] = trickCardModel.detail;
        const winnerCard: CardId = FriendCardLogic.TrickWinnerCard(trumpColor, leaderColor, trickCardDetailModelArray);
        const pointInTrick: number = FriendCardLogic.FindPointInCards(trickCardDetailModelArray);
        const winnerId: string | undefined = trickCardDetailModelArray.find(a => a.cardId === winnerCard)?.playerId
        trickCardModel.winnerId = winnerId;
        trickCardModel.pointInTrick = pointInTrick;
        this.currentPlayerNumber = this.ChangeLeaderById(winnerId);
    }
    private GetCarrentTrickCardModel(): TrickCardModel | undefined { return this.trickCardMap.get(this.currentTrickNumber);}
    private ChangeLeaderById(leaderId?: string): number { return this.playersInOrder.findIndex(a => a.id === leaderId); }
    public NextTrict(): void
    {
        this.currentTrickNumber++;
        if(this.currentTrickNumber >= 13) { this.FinishRound() }
    }
    public GetFriendPlayer(): FriendCardPlayer | undefined { return this.playersInOrder.find(p => {p.GetHandCard().HasCard(this.friendCard)})}
    public GetCurrentPlayer(): FriendCardPlayer { return this.playersInOrder[this.currentPlayerNumber]; }
    public GetHighestAuctionPlayer(): FriendCardPlayer { return this.playersInOrder[this.highestAuctionPlayerNumber]; }
    public IsPlayerTurn(playerId: string) : boolean { return this.GetCurrentPlayer()?.id === playerId; }
    public GetGameplayState(): GAME_STATE { return this.gameplayState; }
    public SetStartGameplayState(): void { this.gameplayState = GAME_STATE.STARTED; }
    public SetFinishGameplayState(): void { this.gameplayState = GAME_STATE.FINISHED; }
    private InitializeTeam(): void
    {
        const highestAuctionPlayer: FriendCardPlayer = this.GetHighestAuctionPlayer();
        const friendPlayer: FriendCardPlayer | undefined  = this.GetFriendPlayer();
        if(!highestAuctionPlayer || !friendPlayer) throw new Error("Initialize team error");
        this.winnerAuctionTeam.set(highestAuctionPlayer.id,  highestAuctionPlayer);
        this.winnerAuctionTeam.set(friendPlayer.id,  friendPlayer);
        this.playersInOrder
            .filter(player => player.id !== highestAuctionPlayer.id && player.id !== friendPlayer.id)
            .forEach(player => this.anotherTeam.set(player.id, player));
        const winnerAuctionTeamArray = Array.from(this.winnerAuctionTeam.values());
        const anotherTeamArray = Array.from(this.anotherTeam.values());
        this.playersInOrder = [winnerAuctionTeamArray[0], anotherTeamArray[0], winnerAuctionTeamArray[1], anotherTeamArray[1]]
        this.currentPlayerNumber = 0;
    }
    public FinishRound(): void // not finish
    {
        this.CalculateTotalTeamPoint();
        this.SetFinishGameplayState();
        this.SetFinishRoundState();
    }
    private CalculateTotalTeamPoint(): void
    {
        const winnerAuctionTeamIds: string[] = Array.from(this.winnerAuctionTeam.keys());
        const anotherTeamIds: string[] =  Array.from(this.anotherTeam.keys());
        const trickCardModels: TrickCardModel[] =  Array.from(this.trickCardMap.values());
        trickCardModels.filter(trick => winnerAuctionTeamIds.some(id => id === trick.winnerId)).forEach(trick => this.winnerTeamTotalPoint += trick.pointInTrick ? trick.pointInTrick : 0);
        trickCardModels.filter(trick => anotherTeamIds.some(id => id === trick.winnerId)).forEach(trick => this.anotherTeamTotalPoint += trick.pointInTrick ? trick.pointInTrick : 0);
    }
    private PrepareCard(): void
    {
        this.deck.Full();
        this.discarded.Empty();
        this.playersInOrder.forEach((player: FriendCardPlayer) => {
            player.GetHandCard().Empty();
            player.GetHandCard().Add(this.deck.PopNumRandomCards(13));
        });
    }
    private NextPlayer() : void
    {
        this.currentPlayerNumber++;
        if (this.currentPlayerNumber >= this.playersInOrder.length) this.currentPlayerNumber = 0;
    }
    public GetAuctionPoint() : number { return this.auctionPoint; }
    public GetInfoForAuctionPointResponse(): [string, string, number, number] { return [this.GetCurrentPlayer().id, this.GetHighestAuctionPlayer().id, this.auctionPoint, this.gameplayState]; }
    
    public SetStartRoundState(): void { this.roundState = GAME_STATE.STARTED }
    public SetFinishRoundState(): void { this.roundState = GAME_STATE.FINISHED }
    public GetRoundState(): GAME_STATE { return this.roundState; }
    public GetActionsDTOForPlayer(player: FriendCardPlayer): ActionsDTO {
        return {
			canPlayerTakeCard: this.CanPlayerTakeCard(player),
			cardsPlayerCanPlay: this.CardsPlayerCanPlay(player),
			canPlayerFinishTurn: this.CanPlayerFinishTurn(player),
		};
	}
    public CanPlayerFinishTurn(player: FriendCardPlayer): boolean { return !this.IsPlayerTurn(player.id) /*|| player.GetRequestedCardToPlay() != null ? false : true */; }
    public CanPlayerPlayCard(player: FriendCardPlayer, cardId: CardId): boolean
    {
        const playerHand: CardId[] = this.CardsPlayerCanPlay(player);
        return playerHand.indexOf(cardId) >= 0;
    }
    private CanPlayerTakeCard(player: FriendCardPlayer): boolean { return this.IsPlayerTurn(player.id) ? true : false; }
    private CardsPlayerCanPlay(player: FriendCardPlayer): CardId[] { return this.IsPlayerTurn(player.id) ? player.GetHandCard().GetInDeck() : []; }
    private IncreaseStackPass(): void { this.stackPass++; if(this.stackPass > 3) this.stackPass = 0 }
    private ClearStackPass(): void { this.stackPass = 0; }
}