import { createClient } from 'redis';
import { REDIS_PASSWORD, REDIS_PORT, REDIS_URL } from './loadEnv';

export const connectRedisClient = async (url = REDIS_URL) => {
    console.log(REDIS_URL, REDIS_PORT, REDIS_PASSWORD)
    // const client = createClient({
    //     password: REDIS_PASSWORD,
    //     socket: {
    //         host: REDIS_URL,
    //         port: REDIS_PORT
    //     }
    // });

    const client = createClient({
        password: 'AEyOWhJDmpgDuNxfl3UEsb2H1Choc9Tu',
        socket: {
            host: 'redis-14972.c301.ap-south-1-1.ec2.cloud.redislabs.com',
            port: 14972
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
