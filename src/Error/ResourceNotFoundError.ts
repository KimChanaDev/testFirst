import { DB_RESOURCES } from "../Enum/DatabaseResource.js";
import { HttpError } from "./HttpError.js";

export class ResourceNotFoundError extends HttpError {
	constructor(resource: DB_RESOURCES, id: string) {
		super(404, `${resource} with ${id} not found`);
	}
}
