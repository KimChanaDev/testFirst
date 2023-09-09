import { NextFunction, Request, Response } from "express";
import { JwtAuthMiddleware } from "../Middleware/JwtAuthMiddleware.js";
import { ExpressRouter } from "./ExpressRouter.js";
import { GamesStoreLogic } from "../GameLogic/GameStoreLogic.js";
import { GameResponseDTO } from "../Model/DTO/Response/GameResponseDTO.js";
import { GameLogic } from "../GameLogic/GameLogic.js";
import { HttpError } from "../Error/HttpError.js";
import { ValidationMiddleware } from "../Middleware/ValidationMiddleware.js";
import { CreateGameDTO } from "../Model/CreateGameDTO.js";

export class GameController extends ExpressRouter
{
    public path: string = "/games";
    constructor() {
        super();
        this.initializeRoutes();
    }
    private initializeRoutes(): void
    {
		this.router.get('', JwtAuthMiddleware, this.GetAllGames);
        this.router.get('/:gameId', JwtAuthMiddleware, this.GetGame);
        this.router.post('', JwtAuthMiddleware, ValidationMiddleware(CreateGameDTO), this.AddGame);
    }
    private GetAllGames(req: Request, res: Response, _next: NextFunction): void
    {
        const response: GameResponseDTO[] = GamesStoreLogic.getInstance.allNotStartedGamesAsArray.map(game => GameResponseDTO.CreateFromGame(game));
		res.json(response);
	}
    private async GetGame(req: Request, res: Response, next: NextFunction): Promise<void>
    {
		const gameId: string = req.params.gameId;
		const game: GameLogic | undefined = GamesStoreLogic.getInstance.GetGame(gameId);
		if (!game) 
            return next(new HttpError(404, `Game with ${gameId} not found`));
        const response: GameResponseDTO = GameResponseDTO.CreateFromGame(game);
		res.json(response);
	}
    private AddGame(req: Request, res: Response, _next: NextFunction): void
    {
        // TODO
    }
}