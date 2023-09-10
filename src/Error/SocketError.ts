export class SocketError extends Error {
	data: { status: number; message: string };
	constructor(status = 500, message = 'Something went wrong') {
		super(message);
		this.data = { status: status, message: message };
        console.log(`Error Status: ${status} Message: ${message}`);
	}
}
