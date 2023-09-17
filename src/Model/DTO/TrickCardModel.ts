import { CardId } from "../../Enum/CardConstant.js";

export class TrickCardModel
{
    public winnerId?: string;
    public pointInTrick?: number;
    public detail : TrickCardDetailModel[] = [];
    public AddCardDetail(playerId: string, cardId: CardId): void
    {
        this.detail.push(new TrickCardDetailModel(playerId, cardId))
    }
}
export class TrickCardDetailModel
{
    constructor(public playerId: string, public cardId: CardId) {}
}