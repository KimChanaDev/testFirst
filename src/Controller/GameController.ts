import { NextFunction, Request, Response } from "express";
import { JwtAuthMiddleware } from "../Middleware/JwtAuthMiddleware.js";
import { ExpressRouter } from "./ExpressRouter.js";
import { GamesStoreLogic } from "../GameLogic/GameStoreLogic.js";
import { GameResponseDTO } from "../Model/DTO/Response/GameResponseDTO.js";
import { GameLogic } from "../GameLogic/GameLogic.js";
import { HttpError } from "../Error/HttpError.js";
import { ValidationMiddleware } from "../Middleware/ValidationMiddleware.js";
import { CreateGameDTO } from "../Model/DTO/CreateGameDTO.js";
import { BadRequestError } from "../Error/BadRequestError.js";
import { DB_RESOURCES } from "../Enum/DatabaseResource.js";
import { ResourceNotFoundError } from "../Error/ResourceNotFoundError.js";
import { UserModel } from "../Model/UserEntity.js";
import { GameModel } from "../Model/GameEntity.js";
import { GameFactory } from "../GameFlow/GameFactory.js";

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
		if (!game) return next(new ResourceNotFoundError(DB_RESOURCES.GAME, gameId));
        const response: GameResponseDTO = GameResponseDTO.CreateFromGame(game);
		res.json(response);
	}
    private async AddGame(req: Request, res: Response, next: NextFunction): Promise<void>
    {
        const newGameData: CreateGameDTO = req.body;
		if (!req.jwt) return next(new BadRequestError());
		const userId = req.jwt.sub as string;
		const owner = await UserModel.findById(userId);
		if (!owner) return next(new ResourceNotFoundError(DB_RESOURCES.USER, userId));
		const createdGame = new GameModel({
			gameType: newGameData.gameType,
			ownerId: owner._id,
			maxPlayers: newGameData.maxPlayers,
			roomName: newGameData.roomName,
			createdAt: new Date(Date.now()),
			isPasswordProtected: !!newGameData.password,
		});
		const savedGame = await createdGame.save();
		const game = GameFactory.CreateGame(
			savedGame.gameType,
			{ id: owner.id, username: owner.username },
			savedGame.maxPlayers,
			savedGame.roomName,
			savedGame.isPasswordProtected,
			savedGame.createdAt,
			savedGame.id,
			newGameData.password
		);
		GamesStoreLogic.getInstance.AddGame(game);
		res.json(GameResponseDTO.CreateFromGame(game));
    }
}