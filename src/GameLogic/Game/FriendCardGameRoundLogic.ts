import {CardId, ColorType} from "../../Enum/CardConstant.js";
import {FriendCardPlayer} from "../../GameFlow/Player/FriendCardPlayer.js";
import {TrickCardDetailModel, TrickCardModel} from "../../Model/DTO/TrickCardModel.js";
import {DeckLogic} from "../Card/DeckLogic.js";
import {FriendCardLogic} from "../Card/FriendCardLogic.js";

export class FriendCardGameRoundLogic
{
    public static CalculateWinnerTrickSetNextLeader(
        trumpColor: ColorType, 
        leaderColor: ColorType, 
        trickCardModel: TrickCardModel, 
        playersInOrder: FriendCardPlayer[],
        roundNumber: number): number
    {
        const trickCardDetailModelArray: TrickCardDetailModel[] = trickCardModel.detail;
        const winnerCard: CardId = FriendCardLogic.TrickWinnerCard(trumpColor, leaderColor, trickCardDetailModelArray);
        const pointInTrick: number = FriendCardLogic.FindPointInCards(trickCardDetailModelArray);
        const winnerId: string | undefined = trickCardDetailModelArray.find(a => a.cardId === winnerCard)?.playerId
        trickCardModel.winnerId = winnerId;
        trickCardModel.pointInTrick = pointInTrick;
        playersInOrder.find(a => a.id === winnerId)?.AddRoundPoint(roundNumber, pointInTrick);
        return playersInOrder.findIndex(a => a.id === winnerId);
    }
    public static NextTrick(currentTrickNumber: number): number
    {
        return currentTrickNumber++;
    }
    public static InitializeTeam(
        highestAuctionPlayer: FriendCardPlayer | undefined, 
        friendPlayer: FriendCardPlayer | undefined, 
        playersInOrder: FriendCardPlayer[], 
        winnerAuctionTeamIds: string[],
        anotherTeamIds: string[]): void
    {
        if(!highestAuctionPlayer || !friendPlayer) throw new Error("Initialize team error");
        winnerAuctionTeamIds.push(highestAuctionPlayer.id);
        winnerAuctionTeamIds.push(friendPlayer.id);
        playersInOrder.filter(p => p.id !== highestAuctionPlayer.id && p.id !== friendPlayer.id).forEach(player => anotherTeamIds.push(player.id));
    }
    public static InitializeTrick(number: number, trickCardMap: Map<number, TrickCardModel>): void 
    {
        for (let i = 0; i < number; i++) 
            trickCardMap.set(i, new TrickCardModel());
    }
    public static NextPlayer(currentPlayerNumber: number, maxPlayer: number) : number
    {
        let result = ++currentPlayerNumber;
        if (result >= maxPlayer) result = 0;
        return result;
    }
    public static PrepareCard(deck: DeckLogic, discarded: DeckLogic, playersInOrder: FriendCardPlayer[]): void
    {
        deck.Full();
        discarded.Empty();
        playersInOrder.forEach((player: FriendCardPlayer) => {
            player.GetHandCard().Empty();
            player.GetHandCard().Add(deck.PopNumRandomCards(13));
        });
    }
    public static CalculateTotalTeamPoint(
        winnerAuctionTeamIds: string[],
        anotherTeamIds: string[],
        playersInOrder: FriendCardPlayer[],
        roundNumber: number): [number, number]
    {
        let winnerAuctionTeamTotalPoint: number = 0;
        let anotherTeamTotalPoint: number = 0;
        playersInOrder.filter(p => winnerAuctionTeamIds.some(a => a === p.id)).forEach(p => {
            winnerAuctionTeamTotalPoint += p.GetRoundPoint(roundNumber) ?? 0;
        })
        playersInOrder.filter(p => anotherTeamIds.some(a => a === p.id)).forEach(p => {
            anotherTeamTotalPoint += p.GetRoundPoint(roundNumber) ?? 0;
        })
        return [winnerAuctionTeamTotalPoint, anotherTeamTotalPoint]
    }
    public static CalculatePlayerGamePoint(
        roundNumber: number,
        playersInOrder: FriendCardPlayer[],
        auctionWinnerPlayerId: string,
        auctionWinnerTeamIds: string[],
        anotherTeamIds: string[],
        winnerAuctionTeamTotalPoint: number,
        anotherTeamTotalPoint: number,
        auctionPoint: number): void
    {
        const isWinnerAuctionTeamWinnerGame: boolean = winnerAuctionTeamTotalPoint > anotherTeamTotalPoint;
        if (isWinnerAuctionTeamWinnerGame)
        {
            playersInOrder.filter(player => auctionWinnerTeamIds.some(id => id === player.id)).forEach(player => {
                let gamePoint: number;
                if(player.id === auctionWinnerPlayerId)
                    gamePoint = auctionPoint + (player.GetRoundPoint(roundNumber) ?? 0);
                else
                    gamePoint = (auctionPoint / 2) + (player.GetRoundPoint(roundNumber) ?? 0);
                player.AddGamePoint(gamePoint);
            });
            playersInOrder.filter(player => anotherTeamIds.some(id => id === player.id)).forEach(player => {
                player.DecreaseGamePoint(100 - auctionPoint);
            });
        }
        else
        {
            playersInOrder.filter(player => auctionWinnerTeamIds.some(id => id === player.id)).forEach(player => {
                if(player.id === auctionWinnerPlayerId)
                {
                    player.DecreaseGamePoint(auctionPoint);
                }
                else
                {
                    let gamePoint: number = (auctionPoint / 2) - (player.GetRoundPoint(roundNumber) ?? 0);
                    player.DecreaseGamePoint( gamePoint >= 0 ? gamePoint : 0 );
                }
            });

            let sumPlayerPoint: number;
            playersInOrder.filter(player => anotherTeamIds.some(id => id === player.id)).forEach(player => sumPlayerPoint += player.GetRoundPoint(roundNumber) ?? 0 );
            playersInOrder.filter(player => anotherTeamIds.some(id => id === player.id)).forEach(player => player.AddGamePoint(sumPlayerPoint / 2) );
        }
    }
}