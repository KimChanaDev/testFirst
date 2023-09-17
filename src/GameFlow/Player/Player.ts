export abstract class Player
{
	private isReady: boolean = false;
	private isDisconnected: boolean = false;
	constructor(
		public readonly id: string,
		public readonly username: string,
		public readonly socketId: string,
		public readonly isOwner: boolean
	)
	{
		if(isOwner) this.isReady = true;
	}

	public ToggleIsReady(): void { this.isReady = !this.isReady; }
	public SetIsReady(bool : boolean): void { this.isReady = bool }
	public GetIsReady(): boolean { return this.isReady; }
	public SetDisconnected(bool : boolean): void { this.isDisconnected = bool }
	public GetIsDisconnected(): boolean { return this.isDisconnected; }
}
