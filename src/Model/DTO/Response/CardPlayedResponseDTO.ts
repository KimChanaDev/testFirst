import { CardId } from "../../../Enum/CardConstant.js";
import { ActionsDTO } from "../ActionsDTO.js";
import { BaseResponseDTO } from "./BaseResponseDTO.js";

export type CardPlayedResponseDTO = BaseResponseDTO & {
    cardId: CardId;
    actions: ActionsDTO | null;
};