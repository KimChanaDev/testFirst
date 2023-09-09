import { CardId } from "../../Enum/CardConstant.js";

export type ActionsDTO = {
	canPlayerTakeCard: boolean;
	cardsPlayerCanPlay: CardId[];
	canPlayerFinishTurn: boolean;
};