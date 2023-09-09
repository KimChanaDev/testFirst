import { HttpError } from "./HttpError.js";
export class BadRequestError extends HttpError {
	constructor() {
		super(400, 'Bad request');
	}
}