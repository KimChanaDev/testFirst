import { IsString, Matches, MaxLength, MinLength } from 'class-validator';
export class UserDTO {
	@IsString()
	@MinLength(6)
	@MaxLength(20)
	@Matches(/^[a-zA-Z0-9_]+$/)
	username!: string;

	@IsString()
	@MinLength(6)
	@MaxLength(20)
	@Matches(/^[a-zA-Z0-9!@#$%^&*]+$/)
	password!: string;
}