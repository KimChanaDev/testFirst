import { CardId } from "../../Enum/CardConstant.js";

export type ActionsDTO = {
	isPlayerTurn: boolean;
	cardsPlayerCanPlay: CardId[];
};