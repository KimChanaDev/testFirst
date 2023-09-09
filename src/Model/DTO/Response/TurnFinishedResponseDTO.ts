import { ActionsDTO } from "../ActionsDTO.js";
import { BaseResponseDTO } from "./BaseResponseDTO.js";

export type TurnFinishedResponseDTO = BaseResponseDTO & {
    playerId: string;
    actions: ActionsDTO | null;
};