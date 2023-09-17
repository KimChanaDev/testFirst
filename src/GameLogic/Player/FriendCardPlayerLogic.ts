import { CardId } from "../../Enum/CardConstant.js";
import { DeckLogic } from "../Card/DeckLogic.js";
import { PlayerLogic } from "./Player.js";

export class FriendCardPlayerLogic extends PlayerLogic
{
	private handCard: DeckLogic = new DeckLogic();
	private gamePoint: number = 0;
	private roundPoint = new Map<number, number>();
	// private numTurnsToWait: number = 0;
	// private requestedCardToPlay: CardId | null = null;
	constructor(id: string, username: string, socketId: string, isOwner: boolean)
    {
		super(id, username, socketId, isOwner);
	}
	public GetGamepoint(): number { return this.gamePoint; }
	public SetGamePoint(point: number): void { this.gamePoint = point; }
	public ClearGamePoint(): void { this.gamePoint = 0; }

	public SetRoundPoint(round: number, point: number): void { this.roundPoint.set(round, point); }
	public GetRoundPoint(round: number): number | undefined { return this.roundPoint.get(round); }
	public ClearRoundPoint(): void { this.roundPoint.clear() }

	public IsActive(): boolean { return !this.GetIsDisconnected()} // && this.numTurnsToWait <= 0; 
	public SetHandCard(handCardSet: DeckLogic): void { this.handCard = handCardSet; }
	public GetHandCard(): DeckLogic { return this.handCard; }
	// public SetNumTurnsToWait(numTurn: number): void { this.numTurnsToWait = numTurn; }
	// public IncreaseNumTurnsToWait(): void { this.numTurnsToWait++; }
	// public DecreaseNumTurnsToWait(): void { this.numTurnsToWait--; }
	// public GetNumTurnsToWait(): number { return this.numTurnsToWait; }
	// public SetRequestedCardToPlay(reqCard: CardId): void { this.requestedCardToPlay = reqCard; }
	// public GetRequestedCardToPlay(): CardId | null { return this.requestedCardToPlay; }
}