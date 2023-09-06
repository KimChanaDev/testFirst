export abstract class PlayerLogic
{
	public isReady: boolean = false;
	public isDisconnected: boolean = false;
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
