import { UserDocument } from "../../../Model/Entity/UserEntity.js";
import { JwtPayload } from 'jsonwebtoken';
import pkg from 'jsonwebtoken';
const { sign, verify } = pkg;
import { readFileSync } from 'fs';
import { PRIVATE_KEY_PATH, PUBLIC_KEY_PATH } from "../../../Configuration/GameConfiguration.js";
import { JwtValidationError } from "../../../Enum/JwtValidationError.js";

let PRIVATE_KEY: string;
let PUBLIC_KEY: string;
try {
	PRIVATE_KEY = readFileSync(PRIVATE_KEY_PATH, 'utf8');
	PUBLIC_KEY = readFileSync(PUBLIC_KEY_PATH, 'utf8');
} catch (error) {
	console.log(error);
	process.exit(1);
}
export function IssueJWT(user: UserDocument): string {
	const expiresInSec: number = 86400; //24h
	const issuedAtInSec: number = Math.round(Date.now() / 1000);
	const expiresOn: number = issuedAtInSec + expiresInSec;
	const payload = {
		sub: user.id,
		iat: issuedAtInSec,
		exp: expiresOn,
	};
	const signedToken = sign(payload, PRIVATE_KEY, {
		algorithm: 'RS256',
	});
	return signedToken;
}
export function ValidateJWT(jwt: string): IJwtValidation
{
	try
	{
		const jwtPayload: string | JwtPayload = verify(jwt, PUBLIC_KEY, { algorithms: ['RS256'] });
		console.log("jwtPayload: "+jwtPayload);
		
		return { success: true, payload: jwtPayload as JwtPayload };
	}
	catch (error: any)
	{
		if (error?.message === JwtValidationError.EXPIRED)
			return { success: false, error: JwtValidationError.EXPIRED };
		else if (error?.message === JwtValidationError.INVALID)
			return { success: false, error: JwtValidationError.INVALID };
		else
			return { success: false, error: JwtValidationError.UNKNOWN };
	}
}

export interface IJwtValidation {
	success: boolean;
	payload?: JwtPayload;
	error?: JwtValidationError;
}