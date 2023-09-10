import { NextFunction, Request, Response } from 'express';
import { SessionExpiredError, UnauthorizedError } from '../Error/ErrorException.js';
import { IJwtValidation, ValidateJWT } from '../GameLogic/Utils/Authorization/JWT.js';
import { JwtValidationError } from '../Enum/JwtValidationError.js';

export function JwtAuthMiddleware(req: Request, res: Response, next: NextFunction): void
{
	if (!req.headers.authorization) return next(new UnauthorizedError());
	const validationResult: IJwtValidation = ValidateJWT(req.headers.authorization);
	if (validationResult.success) {
		req.jwt = validationResult.payload;
		return next();
	} else if (validationResult.error === JwtValidationError.EXPIRED) {
		console.log(validationResult.error);
		return next(new SessionExpiredError());
	} else {
		return next(new UnauthorizedError());
	}
}
