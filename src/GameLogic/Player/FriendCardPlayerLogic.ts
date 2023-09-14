import { CardId } from "../../Enum/CardConstant.js";
import { DeckLogic } from "../Card/DeckLogic.js";
import { PlayerLogic } from "./PlayerLogic.js";

export class FriendCardPlayerLogic extends PlayerLogic
{
	private handCard: DeckLogic = new DeckLogic();
	private numTurnsToWait: number = 0;
	private requestedCardToPlay: CardId | null = null;
	constructor(id: string, username: string, socketId: string, isOwner: boolean)
    {
		super(id, username, socketId, isOwner);
	}

	public IsActive(): boolean { return !this.GetIsDisconnected() && this.numTurnsToWait <= 0; }
	public SetHandCard(handCardSet: DeckLogic): void { this.handCard = handCardSet; }
	public GetHandCard(): DeckLogic { return this.handCard; }
	public SetNumTurnsToWait(numTurn: number): void { this.numTurnsToWait = numTurn; }
	public IncreaseNumTurnsToWait(): void { this.numTurnsToWait++; }
	public DecreaseNumTurnsToWait(): void { this.numTurnsToWait--; }
	public GetNumTurnsToWait(): number { return this.numTurnsToWait; }
	public SetRequestedCardToPlay(reqCard: CardId): void { this.requestedCardToPlay = reqCard; }
	public GetRequestedCardToPlay(): CardId | null { return this.requestedCardToPlay; }
}