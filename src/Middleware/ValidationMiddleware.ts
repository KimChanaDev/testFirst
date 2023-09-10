import { ClassConstructor, plainToClass } from 'class-transformer';
//import { validate, ValidationError } from 'class-validator';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { BadRequestError } from '../Error/ErrorException.js';

export function ValidationMiddleware(type: ClassConstructor<object>): RequestHandler {
	return (req: Request, res: Response, next: NextFunction): void => {
		// validate(plainToClass(type, req.body)).then((errors: ValidationError[]) => {
		// 	if (errors.length > 0) {
        //         console.log(`Validation error on ${type.name}`, errors);
		// 		next(new BadRequestError());
		// 	} else {
		// 		next();
		// 	}
		// });
		try
		{
			plainToClass(type, req.body);
			next();
		}
		catch (error)
		{
			console.log(`Validation error on ${error}`);
			next(new BadRequestError());
		}
	};
}
