import { CardId, ColorType } from "../../Enum/CardConstant.js";
import { BaseResponseDTO } from "./Response/BaseResponseDTO.js";
export type TrumpAndFriendDTO = {
    trumpColor: ColorType;
    friendCard: CardId;
};

export type TrumpAndFriendResponseDTO = BaseResponseDTO & TrumpAndFriendDTO