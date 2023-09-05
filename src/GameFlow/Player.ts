export abstract class Player {
	isReady = false;
	isDisconnected = false;
	constructor(
		public readonly id: string,
		public readonly username: string,
		public readonly socketId: string,
		public readonly isOwner: boolean
	) {}

	public ToggleIsReady(): void {
		this.isReady = !this.isReady;
	}
}
