import { Document, model, ObjectId, Schema } from 'mongoose';
import { GAME_TYPE } from '../../Enum/GameType.js';

export interface GameDocument extends Document {
	gameType: GAME_TYPE;
	ownerId: ObjectId;
	maxPlayers: number;
	roomName: string;
	createdAt: Date;
	isPasswordProtected: boolean;
	id: string;
}

const gameSchema = new Schema<GameDocument>({
	gameType: {
		type: String,
		enum: Object.values(GAME_TYPE),
		required: true,
	},
	ownerId: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	maxPlayers: {
		type: Number,
		required: true,
	},
	roomName: {
		type: String,
		minlength: 3,
		maxlength: 20,
		required: true,
	},
	createdAt: {
		type: Date,
		required: true,
	},
	isPasswordProtected: {
		type: Boolean,
		required: true,
	},
});

export const GameModel = model<GameDocument>('Game', gameSchema);
