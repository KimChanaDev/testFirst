import { CardId } from "../../Enum/CardConstant.js";

export class TrickCardModel
{
    public winnerId?: string;
    public pointInTrick?: number;
    public detail : TrickCardDetailModel[] = [];
}
export class TrickCardDetailModel
{
    constructor(public playerId: string, public cardId: CardId) {}
}