import { PlayerLogic } from "../../../GameLogic/PlayerLogic.js";
import { UserDocument } from "../../UserEntity.js";
import { Document, ObjectId } from 'mongoose';
export class UserResponseDTO
{
	constructor(private id: string, private username: string) {}

	public static CreateFromUserDocument(
		savedUser: Document<any, any, UserDocument> &
			UserDocument & {
				_id: ObjectId;
			}
	): UserResponseDTO
    {
		return new UserResponseDTO(savedUser.id, savedUser.username);
	}

    public static CreateFromPlayer(player: PlayerLogic): UserResponseDTO
    {
		return new UserResponseDTO(player.id, player.username);
	}
}