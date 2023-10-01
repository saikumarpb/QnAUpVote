import {
    App,
    DEDICATED_COMPRESSOR_3KB,
    SSLApp,
    TemplatedApp,
    WebSocket,
} from 'uWebSockets.js';
import { CERT_FILE_NAME, ENVIORNMENT, KEY_FILE_NAME, PORT } from './loadEnv';
import { v4 } from 'uuid';
import { connectRedisClient } from './redis';

const app: TemplatedApp =
    ENVIORNMENT === 'development'
        ? App()
        : SSLApp({
              key_file_name: KEY_FILE_NAME,
              cert_file_name: CERT_FILE_NAME,
          });

const redisClient = connectRedisClient();

app.ws('/*', {
    idleTimeout: 0,
    maxBackpressure: 1024,
    maxPayloadLength: 16 * 1024 * 1024,
    compression: DEDICATED_COMPRESSOR_3KB,

    open: async (ws: WebSocket<{ id: string }>) => {
        const userData = ws.getUserData();
        userData.id = v4();
        console.log(`Client ${userData.id} opened a connection`);

        (await redisClient).set(userData.id, 0);
    },

    message: async (ws, message) => {
        const decoder = new TextDecoder();
        console.log(ws.getUserData().id, decoder.decode(message));
        const socketId = ws.getUserData().id;
        const messageNumber = await (await redisClient).get(socketId);
        ws.send(`socket: ${socketId}, message count :${messageNumber}`);
        (await redisClient).set(socketId, parseInt(messageNumber!) + 1);
    },

    close: async (ws, code, message) => {
        console.log(`Closed conection for client ${ws.getUserData().id}`);
        (await redisClient).del(ws.getUserData().id);
    },
})
    .get('/*', (res, _req) => {
        const message = `Websocket server running on port: ${PORT}`;
        res.writeStatus('200 OK').end(message);
    })
    .listen(PORT, (listenSocket) => {
        if (listenSocket) {
            console.log(`Websocket server listening on port: ${PORT}`);
        }
    });
