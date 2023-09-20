import { ClassConstructor, plainToClass } from 'class-transformer';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { BadRequestError } from '../Error/ErrorException.js';

export function ValidationMiddleware(type: ClassConstructor<object>): RequestHandler {
	return (req: Request, res: Response, next: NextFunction): void => {
		try
		{
			plainToClass(type, req.body);
			next();
		}
		catch (error: any)
		{
			console.log(`Validation error on ${error.message}`);
			next(new BadRequestError());
		}
	};
}
