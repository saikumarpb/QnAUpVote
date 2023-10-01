import { createClient } from 'redis';
import { REDIS_PASSWORD, REDIS_PORT, REDIS_URL } from './loadEnv';

export const connectRedisClient = async (url = REDIS_URL) => {
    const client = createClient({
        password: REDIS_PASSWORD,
        socket: {
            host: REDIS_URL,
            port: REDIS_PORT
        }
    });

    client.on('ready', (err) => {
        if (err) {
            console.log('Redis client failed to get ready');
        }
    });

    await client.connect();
    return client;
};
