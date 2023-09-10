//import { IsEnum, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';
import { GAME_TYPE } from "../../Enum/GameType.js";

export class CreateGameDTO
{
	//@IsEnum(GAME_TYPE)
	gameType!: GAME_TYPE;

	// @IsInt()
	// @Min(4)
	// @Max(4)
	maxPlayers!: number;

	// @IsString()
	// @MinLength(3)
	// @MaxLength(20)
	roomName!: string;

	// @IsString()
	// @MinLength(3)
	// @MaxLength(20)
	// @IsOptional()
	// @Matches(/^[a-zA-Z0-9!@#$%^&*]+$/)
	password?: string;
}