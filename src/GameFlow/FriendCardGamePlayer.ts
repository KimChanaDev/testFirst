import { CardId } from "../Enum/CardConstant.js";
import { DeckLogic } from "../GameLogic/DeckLogic.js";
import { PlayerLogic } from "../GameLogic/PlayerLogic.js";

export class FriendCardGamePlayer extends PlayerLogic
{
	public deckLogic = new DeckLogic();
	public numCardsToTake = 0;
	public numTurnsToWait = 0;
	public requestedCardToPlay: CardId | null = null;

	constructor(id: string, username: string, socketId: string, isOwner: boolean)
    {
		super(id, username, socketId, isOwner);
	}

	public get isActive(): boolean
    {
		return !this.isDisconnected && this.numTurnsToWait <= 0;
	}
}