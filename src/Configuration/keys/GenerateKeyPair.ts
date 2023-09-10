import { KeyPairSyncResult, generateKeyPairSync } from 'crypto';
import { existsSync, writeFileSync } from 'fs';
import { PRIVATE_KEY_PATH, PUBLIC_KEY_PATH } from '../GameConfiguration.js';

function generateKeyPair(): void
{
	if (existsSync(PUBLIC_KEY_PATH) && existsSync(PRIVATE_KEY_PATH))
	{
		console.log("Already exist key");
		return;
	}

	const keyPair: KeyPairSyncResult<string, string> = generateKeyPairSync('rsa', {
		modulusLength: 4096,
		publicKeyEncoding:{
			type: 'pkcs1',
			format: 'pem',
		},
		privateKeyEncoding: {
			type: 'pkcs1',
			format: 'pem',
		},
	});

	writeFileSync(PUBLIC_KEY_PATH, keyPair.publicKey);
	writeFileSync(PRIVATE_KEY_PATH, keyPair.privateKey);
	console.log("GenerateKeyPair success!");
	
}

generateKeyPair();