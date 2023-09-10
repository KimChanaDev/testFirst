import { join } from 'path';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PUBLIC_KEY_PATH = join(__dirname, 'keys', 'rsa_public.pem');
export const PRIVATE_KEY_PATH = join(__dirname, 'keys', 'rsa_private.pem');