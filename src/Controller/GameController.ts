import { NextFunction, Request, Response } from "express";
import { JwtAuthMiddleware } from "../Middleware/JwtAuthMiddleware.js";
import { ExpressRouter } from "./ExpressRouter.js";
import { GamesStore } from "../GameFlow/Game/GameStore.js";
import { GameResponseDTO } from "../Model/DTO/Response/GameResponseDTO.js";
import { GameRoom } from "../GameFlow/Game/GameRoom.js";
import { ValidationMiddleware } from "../Middleware/ValidationMiddleware.js";
import { CreateGameDTO } from "../Model/DTO/CreateGameDTO.js";
import { DB_RESOURCES } from "../Enum/DatabaseResource.js";
import { GameModel } from "../Model/Entity/GameEntity.js";
import { GameFactory } from "../GameFlow/Game/GameFactory.js";
import { UserModel } from "../Model/Entity/UserEntity.js";
import { BadRequestError, ResourceNotFoundError } from "../Error/ErrorException.js";

export class GameController extends ExpressRouter
{
    public path: string = "/games";
    constructor()
	{
        super();
        this.InitializeRoutes();
    }
    private InitializeRoutes(): void
    {
		this.router.get('', JwtAuthMiddleware, this.GetAllGames);
        this.router.get('/:gameId', JwtAuthMiddleware, this.GetGame);
        this.router.post('', JwtAuthMiddleware, ValidationMiddleware(CreateGameDTO), this.AddGame);
    }
    private GetAllGames(req: Request, res: Response, _next: NextFunction): void
    {
        const response: GameResponseDTO[] = GamesStore.getInstance.GetAllNotStartedGamesAsArray().map(gameRoom => GameResponseDTO.CreateFromGame(gameRoom));
		res.json(response);
	}
    private async GetGame(req: Request, res: Response, next: NextFunction): Promise<void>
    {
		const gameId: string = req.params.gameId;
		const gameRoom: GameRoom | undefined = GamesStore.getInstance.GetGameById(gameId);
		if (!gameRoom) return next(new ResourceNotFoundError(DB_RESOURCES.GAME, gameId));
        const response: GameResponseDTO = GameResponseDTO.CreateFromGame(gameRoom);
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
		const gameRoom: GameRoom = GameFactory.CreateGame(
			savedGame.gameType,
			{ id: owner.id, username: owner.username },
			savedGame.maxPlayers,
			savedGame.roomName,
			savedGame.isPasswordProtected,
			savedGame.createdAt,
			savedGame.id,
			newGameData.password
		);
		GamesStore.getInstance.AddGame(gameRoom);
		res.json(GameResponseDTO.CreateFromGame(gameRoom));
    }
}