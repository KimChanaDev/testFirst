import { Router } from 'express';

export abstract class ExpressRouter {
	public router = Router();
	public abstract path: string;
}
