import { UserResponseDTO } from "./UserResponseDTO.js";

export class LoginResponseDTO {
	constructor(private user: UserResponseDTO, private token: string) {}
}
