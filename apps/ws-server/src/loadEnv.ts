import { config } from 'dotenv';

config();

export const ENVIORNMENT = process.env.NODE_ENV || 'development';
export const KEY_FILE_NAME = process.env.KEY_FILE_NAME;
export const CERT_FILE_NAME = process.env.CERT_FILE_NAME;
export const PORT = parseInt(process.env.PORT || '9000');
export const REDIS_URL = process.env.REDIS_URL;
export const REDIS_PORT = parseInt(process.env.REDIS_PORT || '14972');
export const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
