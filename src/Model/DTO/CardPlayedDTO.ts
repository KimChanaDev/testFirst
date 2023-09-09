import { CardId } from "../../Enum/CardConstant.js";

export type CardPlayedDTO = {
	playerId: string;
	cardId: CardId;
};