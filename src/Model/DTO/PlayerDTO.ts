import { PlayerLogic } from "../../GameLogic/Player/PlayerLogic.js";

export class PlayerDTO {
	constructor(
		private id: string,
		private username: string,
		private isReady: boolean,
		private isOwner: boolean
	) {}

	public static CreateFromPlayer(player: PlayerLogic): PlayerDTO {
		return new PlayerDTO(player.id, player.username, player.isReady, player.isOwner);
	}
}