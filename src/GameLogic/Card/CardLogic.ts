import { CardId, ColorType, ShapeType, Shapes } from "../../Enum/CardConstant.js";

export abstract class CardLogic
{
	public static IsColorSameAs(card1: CardId, card2: CardId): boolean { return (card1[1] as ColorType) === (card2[1] as ColorType); }
	public static IsShapeSameAs(card1: CardId, card2: CardId): boolean { return (card1[0] as ShapeType) === (card2[0] as ShapeType) }
	public static IsShapeGreaterThan(card1: CardId, card2: CardId): boolean { return Shapes.indexOf(card1[0] as ShapeType) > Shapes.indexOf(card2[0] as ShapeType); }
	public static IsShapeGreaterOrSameAs(card1: CardId, card2: CardId): boolean { return this.IsShapeSameAs(card1, card2) || this.IsShapeGreaterThan(card1, card2); }
	public static IsColor(card: CardId, color: ColorType): boolean { return card[1] === color; }
	public static IsShape(card: CardId, shape: ShapeType): boolean { return card[0] === shape; }
}