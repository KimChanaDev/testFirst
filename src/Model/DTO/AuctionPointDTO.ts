import { GAME_STATE } from "../../Enum/GameState.js";
import { BaseResponseDTO } from "./Response/BaseResponseDTO.js";
export type AuctionPointDTO = {
    playerId?: string;
    nextPlayerId: string;
    currentHighestAuctionPlayerId: string;
    currentAuctionPoint: number;
    gameplayState: GAME_STATE
};

export type AuctionPointResponseDTO = BaseResponseDTO & AuctionPointDTO;