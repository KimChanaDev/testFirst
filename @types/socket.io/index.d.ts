import { JwtPayload } from 'jsonwebtoken';

declare module 'socket.io' {
	interface Socket {
		middlewareData: {
			jwt?: string | JwtPayload;
		};
	}
}
