export const Shapes = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'] as const;
export const Colors = ['C', 'D', 'H', 'S'] as const;
export type ShapeType = typeof Shapes[number];
export type ColorType = typeof Colors[number];
export type CardId = `${typeof Shapes[number]}${typeof Colors[number]}`;