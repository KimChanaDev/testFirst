import { BaseResponseDTO } from "./Response/BaseResponseDTO.js";
export type AuctionPointDTO = {
    nextPlayerId: string;
    currentAuctionPoint: number;
};

export type AuctionPointResponseDTO = BaseResponseDTO & {}