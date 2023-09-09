import { Request, Response, NextFunction } from "express";
import { ValidationMiddleware } from "../Middleware/ValidationMiddleware.js";
import { UserDTO } from "../Model/DTO/UserDTO.js";
import { ExpressRouter } from "./ExpressRouter.js";
import { UserModel } from "../Model/Entity/UserEntity.js";
import { InvalidCredentialsError, UserExistsError } from "../Error/ErrorException.js";
import { GenerateNewSaltAndHash, ValidatePassword } from "../GameLogic/Utils/Authorization/Password.js";
import { IssueJWT } from "../GameLogic/Utils/Authorization/JWT.js";
import { LoginResponseDTO } from "../Model/DTO/Response/LoginResponseDTO.js";
import { UserResponseDTO } from "../Model/DTO/Response/UserResponseDTO.js";

export class UserController extends ExpressRouter
{
    public path: string = '/users';
    constructor() {
        super();
        this.InitializeRoutes();
    }
    private InitializeRoutes(): void
    {
        this.router.post('/register', ValidationMiddleware(UserDTO), this.RegisterUser);
		this.router.post('/login', ValidationMiddleware(UserDTO), this.LoginUser);
    }
    private async RegisterUser(req: Request, res: Response, next: NextFunction): Promise<void>
    {
        const newUserData: UserDTO = req.body;
		const user = await UserModel.findOne({ username: newUserData.username });
		if (user) return next(new UserExistsError(newUserData.username));

		const { salt, hash } = GenerateNewSaltAndHash(newUserData.password);
		const createdUser = new UserModel({
			username: newUserData.username,
			hash: hash,
			salt: salt,
		});
		const savedUser = await createdUser.save();
		const token: string = IssueJWT(savedUser);
		res.json(new LoginResponseDTO(UserResponseDTO.CreateFromUserDocument(savedUser), token));
    }
    private async LoginUser(req: Request, res: Response, next: NextFunction): Promise<void>
    {
        const newUserData: UserDTO = req.body;
		const user = await UserModel.findOne({
			username: newUserData.username,
		});
		if (!user) return next(new InvalidCredentialsError());
		if (!ValidatePassword(newUserData.password, user.hash, user.salt)) return next(new InvalidCredentialsError());

		const token: string = IssueJWT(user);
		res.json(new LoginResponseDTO(UserResponseDTO.CreateFromUserDocument(user), token));
    }
}

