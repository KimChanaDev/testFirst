import { Router } from 'express';

export abstract class ExpressRouter {
	router = Router();
	abstract path: string;
}
