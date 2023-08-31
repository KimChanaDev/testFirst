import { ExpressRouter } from "./ExpressRouter.js";

export class UserController extends ExpressRouter
{
    public path: string = '/users';
    constructor() {
        super();
        this.initializeRoutes();
    }
    private initializeRoutes(): void
    {
        //this.router.get('');
    }
}

