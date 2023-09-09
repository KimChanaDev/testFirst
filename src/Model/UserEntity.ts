import { model, Schema } from 'mongoose';

export interface UserDocument extends Document {
	id: string;
	username: string;
	hash: string;
	salt: string;
	level: number;
	win: number;
	lose: number;
}

const userSchema = new Schema<UserDocument>({
	username: {
		type: String,
		minlength: 6,
		maxlength: 20,
		required: true,
		unique: true,
	},
	hash: {
		type: String,
		required: true,
	},
	salt: {
		type: String,
		required: true,
	},
	level: {
		type: Number
	},
	win: {
		type: Number
	},
	lose: {
		type: Number
	},
});

export const UserModel = model<UserDocument>('User', userSchema);
