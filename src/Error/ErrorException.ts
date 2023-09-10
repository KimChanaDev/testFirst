import { DB_RESOURCES } from "../Enum/DatabaseResource.js";
import { HttpError } from "./HttpError.js";

export class BadRequestError extends HttpError {
	constructor() {
		super(400, 'Bad request');
	}
}
export class InvalidCredentialsError extends HttpError {
	constructor() {
		super(401, 'Invalid username or password');
	}
}
export class UnauthorizedError extends HttpError {
	constructor() {
		super(401, 'Unauthorized');
	}
}
export class ResourceNotFoundError extends HttpError {
	constructor(resource: DB_RESOURCES, id: string) {
		super(404, `${resource} with ${id} not found`);
	}
}
export class UserExistsError extends HttpError
{
	constructor(username: string) {
		super(409, `User with ${username} already exists`);
	}
}
export class SessionExpiredError extends HttpError {
	constructor() {
		super(440, 'Session expired');
	}
}