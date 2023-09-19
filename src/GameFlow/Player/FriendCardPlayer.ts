import { CardId } from "../../Enum/CardConstant.js";
import { DeckLogic } from "../../GameLogic/Card/DeckLogic.js";
import { Player } from "./Player.js";

export class FriendCardPlayer extends Player
{
	private handCard: DeckLogic = new DeckLogic();
	private gamePoint: number = 0;
	private roundPoint = new Map<number, number>();
	constructor(id: string, username: string, socketId: string, isOwner: boolean)
    {
		super(id, username, socketId, isOwner);
	}
	public GetGamepoint(): number { return this.gamePoint; }
	public SetGamePoint(point: number): void { this.gamePoint = point; }
	public AddGamePoint(point: number): void { this.gamePoint += point; }
	public DecreaseGamePoint(point: number): void { this.gamePoint -= point; }
	public ClearGamePoint(): void { this.gamePoint = 0; }

	public SetRoundPoint(round: number, point: number): void { this.roundPoint.set(round, point); }
	public AddRoundPoint(round: number, addPoint: number): void
	{
		let newPoint: number;
		let previousPoint: number | undefined = this.roundPoint.get(round);
		newPoint = previousPoint ? previousPoint+addPoint : addPoint;
		this.roundPoint.delete(round);
		this.roundPoint.set(round, newPoint);
	}
	public GetRoundPoint(round: number): number | undefined { return this.roundPoint.get(round); }
	public ClearRoundPoint(): void { this.roundPoint.clear() }

	public IsActive(): boolean { return !this.GetIsDisconnected()} // && this.numTurnsToWait <= 0; 
	public SetHandCard(handCardSet: DeckLogic): void { this.handCard = handCardSet; }
	public GetHandCard(): DeckLogic { return this.handCard; }
}