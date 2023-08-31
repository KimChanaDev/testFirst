import express, { json } from 'express';
import { connect } from 'mongoose';
import cors from 'cors';
import { Server } from 'socket.io';
import { ExpressRouter } from './Controller/ExpressRouter.js';

export class App 
{
    app: express.Application;
    constructor(controllers: ExpressRouter[])
    {
        this.app = express();
        this.connectToDatabase();
        this.initializeMiddlewares();
        this.initializeControllers(controllers);
    }
    private connectToDatabase(): void 
    {
        const MONGO_USER = process.env.MONGO_USER;
		const MONGO_PASSWORD = process.env.MONGO_PASSWORD;
		const MONGO_PATH = process.env.MONGO_PATH;
        const mongoURI = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_PATH}?retryWrites=true&w=majority`;
		connect(mongoURI)
			.then(() => console.log('MongoDB connected!'))
			.catch((error: Error) => {
                console.log(`MongoDB connection failed : ${error.message}`);
				process.exit(1);
		});
    }
    private initializeMiddlewares(): void 
    {
		this.app.use(json());
		this.app.use(cors({ origin: process.env.CLIENT_URL }));
	}
    private initializeControllers(controllers: ExpressRouter[]): void {
		controllers.forEach((controller) => {
			this.app.use(controller.path, controller.router);
		});
	}
    listen(): void 
    {
        const listener = this.app.listen(process.env.PORT, () => {
			console.log(`Game server running! with PORT:${process.env.PORT}`);
		});
        const io = new Server(listener, {
			cors: {
				origin: [process.env.CLIENT_URL as string],
			},
		});
        // TODO handler socket
        //new FriendGameHandler(io);
    }
}
