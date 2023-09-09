export class HttpError extends Error {
	status: number;

	constructor(status?: number, message?: string) {
		super(message ? `Http - ${message}` : 'Http - Something went wrong');
		this.status = status || 500;
	}
}