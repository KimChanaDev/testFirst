import { pbkdf2Sync, randomBytes } from 'crypto';

export function GenerateNewSaltAndHash(password: string): { salt: string; hash: string; }
{
	const salt: string = randomBytes(64).toString('hex');
	const hash: string = HashFunction(password, salt);
	return { salt, hash };
}

export function ValidatePassword(password: string, hash: string, salt: string): boolean {
	return hash === HashFunction(password, salt);
}

function HashFunction(password: string, salt: string): string {
	return pbkdf2Sync(password, salt, 310000, 64, 'sha512').toString('hex');
}
