import { SocketError } from "./SocketError.js";

export class SocketBadConnectionError extends SocketError {
	constructor() {
		super(400, 'Bad connection');
	}
}
export class SocketUnauthorizedError extends SocketError {
	constructor() {
		super(401, 'Unauthorized');
	}
}
export class SocketUserAlreadyConnectedError extends SocketError {
	constructor() {
		super(403, `You are already connected to game room`);
	}
}
export class SocketGameNotExistError extends SocketError {
	constructor() {
		super(404, 'Game no longer exists');
	}
}
export class SocketGameAlreadyStartedError extends SocketError {
	constructor() {
		super(410, `Game has already started`);
	}
}
export class SocketRoomFullError extends SocketError {
	constructor() {
		super(423, `Room full`);
	}
}
export class SocketSessionExpiredError extends SocketError {
	constructor() {
		super(440, 'Session expired');
	}
}
export class SocketWrongRoomPasswordError extends SocketError {
	constructor() {
		super(499, 'Wrong room password');
	}
}
