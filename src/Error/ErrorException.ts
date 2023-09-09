import { HttpError } from "./HttpError.js";

export class InvalidCredentialsError extends HttpError {
	constructor() {
		super(401, 'Invalid username or password');
	}
}
export class UserExistsError extends HttpError
{
	constructor(username: string) {
		super(409, `User with ${username} already exists`);
	}
}
