import { CardId, ColorType } from "../../Enum/CardConstant.js";
import { GAME_STATE } from "../../Enum/GameState.js";
import { ActionsDTO } from "../../Model/DTO/ActionsDTO.js";
import { TrickCardModel } from "../../Model/DTO/TrickCardModel.js";
import { CardLogic } from "../../GameLogic/Card/CardLogic.js";
import { DeckLogic } from "../../GameLogic/Card/DeckLogic.js";
import { FriendCardPlayer } from "../Player/FriendCardPlayer.js";
import { ShuffleArray } from "../../GameLogic/Utils/Tools.js";
import { FriendCardGameRoundLogic } from "../../GameLogic/Game/FriendCardGameRoundLogic.js";

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
    private highestAuctionId: string = '';
    private auctionWinnerTeamIds: string[] = [];
    private anotherTeamIds: string[] = [];
    private trickCardMap = new Map<number, TrickCardModel>();
    private winnerAuctionTeamTotalPoint: number = 0;
    private anotherTeamTotalPoint: number = 0;
    private currentPlayerNumber: number = 0;
    private currentTrickNumber: number = 0;
    private stackPass: number = 0;
    private roundNumber: number;
    constructor(roundNumber: number) { this.roundNumber = roundNumber; };
    public StartRoundProcess(initialPlayers : FriendCardPlayer[]): void
    {
        if (initialPlayers.length !== 4) throw new Error("Players are not equal to 4");
        this.playersInOrder = ShuffleArray(Array.from(initialPlayers.values()));
        this.currentPlayerNumber = 0;
        FriendCardGameRoundLogic.PrepareCard(this.deck, this.discarded, this.playersInOrder);
        this.roundState = GAME_STATE.STARTED
    }
    public AuctionProcess(auctionPass: boolean, newAuctionPoint: number): void
    {
        if (auctionPass)
        {
            this.stackPass++; 
            if(this.stackPass > 3) this.stackPass = 0
            this.currentPlayerNumber = FriendCardGameRoundLogic.NextPlayer(this.currentPlayerNumber, this.playersInOrder.length);
            if(this.stackPass === 3) this.gameplayState = GAME_STATE.STARTED;
        }
        else
        {
            this.auctionPoint = newAuctionPoint;
            this.highestAuctionId = this.GetCurrentPlayer().id;
            this.stackPass = 0;
            this.currentPlayerNumber = FriendCardGameRoundLogic.NextPlayer(this.currentPlayerNumber, this.playersInOrder.length);
            if (this.auctionPoint === 100) this.gameplayState = GAME_STATE.STARTED;
        }
    }
    public SetTrumpAndFriendProcess(trumpColor: ColorType, friendCard: CardId): void
    {
        this.trumpColor = trumpColor;
        this.friendCard = friendCard;
        const highestAuctionPlayer : FriendCardPlayer | undefined= this.GetHighestAuctionPlayer();
        const friendPlayer: FriendCardPlayer | undefined  = this.GetFriendPlayer();
        
        FriendCardGameRoundLogic.InitializeTeam(highestAuctionPlayer, friendPlayer, this.playersInOrder, this.auctionWinnerTeamIds, this.anotherTeamIds);
        this.currentPlayerNumber = 0;
        FriendCardGameRoundLogic.InitializeTrick(13, this.trickCardMap);
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
        const carrentTrickCardModel: TrickCardModel | undefined = FriendCardGameRoundLogic.GetCarrentTrickCardModel(this.currentTrickNumber, this.trickCardMap);
        carrentTrickCardModel?.AddCardDetail(playerId, removeCard);
        this.currentPlayerNumber = FriendCardGameRoundLogic.NextPlayer(this.currentPlayerNumber, this.playersInOrder.length);
        const isFinishedTrick: boolean | undefined = leaderColor && carrentTrickCardModel?.detail.length === 4;
        if(isFinishedTrick)
        {
            this.currentPlayerNumber =  FriendCardGameRoundLogic.CalculateWinnerTrickSetNextLeader(
                                        this.trumpColor, 
                                        leaderColor!, 
                                        carrentTrickCardModel!, 
                                        this.playersInOrder,
                                        this.roundNumber);
            this.currentTrickNumber = FriendCardGameRoundLogic.NextTrict(this.currentTrickNumber);
            if(this.currentTrickNumber >= 13) { this.FinishRound() }
        }
        return removeCard;
    }
    
    public FinishRound(): void
    {
        const [winnerTeamPoint, anotherTeamPoint] = FriendCardGameRoundLogic.CalculateTotalTeamPoint(this.auctionWinnerTeamIds, this.anotherTeamIds, this.playersInOrder, this.roundNumber);
        this.winnerAuctionTeamTotalPoint = winnerTeamPoint;
        this.anotherTeamTotalPoint = anotherTeamPoint;
        FriendCardGameRoundLogic.CalculatePlayerGamePoint(
            this.roundNumber, 
            this.playersInOrder, 
            this.highestAuctionId, 
            this.auctionWinnerTeamIds, 
            this.anotherTeamIds,
            this.winnerAuctionTeamTotalPoint,
            this.anotherTeamTotalPoint,
            this.auctionPoint
        );
        this.gameplayState = GAME_STATE.FINISHED;
        this.roundState = GAME_STATE.FINISHED;
    }
    
    public GetFriendPlayer(): FriendCardPlayer | undefined { return this.playersInOrder.find(p => {p.GetHandCard().HasCard(this.friendCard)})}
    public GetCurrentPlayer(): FriendCardPlayer { return this.playersInOrder[this.currentPlayerNumber]; }
    public GetHighestAuctionPlayer(): FriendCardPlayer | undefined { return this.playersInOrder.find(a => a.id === this.highestAuctionId); }
    public IsPlayerTurn(playerId: string) : boolean { return this.GetCurrentPlayer()?.id === playerId; }
    
    public GetGameplayState(): GAME_STATE { return this.gameplayState; }
    public GetAuctionPoint() : number { return this.auctionPoint; }
    public GetInfoForAuctionPointResponse(): [string, string | undefined, number, number] { return [this.GetCurrentPlayer().id, this.GetHighestAuctionPlayer()?.id, this.auctionPoint, this.gameplayState]; }
    public GetRoundState(): GAME_STATE { return this.roundState; }
    
    public GetActionsDTOForPlayer(player: FriendCardPlayer): ActionsDTO {
        return {
			canPlayerTakeCard: this.IsPlayerTurn(player.id),
			cardsPlayerCanPlay: player.GetHandCard().GetInDeck(),
		};
	}
    public CanPlayerPlaySpecificCard(player: FriendCardPlayer, cardId: CardId): boolean
    {
        const playerHand: CardId[] = player.GetHandCard().GetInDeck();
        return playerHand.indexOf(cardId) >= 0;
    }
}