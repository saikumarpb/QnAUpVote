import {
    App,
    DEDICATED_COMPRESSOR_3KB,
    SSLApp,
    TemplatedApp,
    WebSocket,
} from 'uWebSockets.js';
import { CERT_FILE_NAME, ENVIORNMENT, KEY_FILE_NAME, PORT } from './loadEnv';
import { v4 } from 'uuid';
import { processMessage } from './message';
import { decoder, getIp } from './utils';
import { MessageType } from './types';

const app: TemplatedApp =
    ENVIORNMENT === 'development'
        ? App()
        : SSLApp({
              key_file_name: KEY_FILE_NAME,
              cert_file_name: CERT_FILE_NAME,
          });

app.ws('/*', {
    idleTimeout: 0,
    maxBackpressure: 1024,
    maxPayloadLength: 16 * 1024 * 1024,
    compression: DEDICATED_COMPRESSOR_3KB,

    open: async (ws: WebSocket<{ id: string }>) => {
        const userData = ws.getUserData();
        userData.id = v4();
        console.log(`Client ${getIp(ws)} opened a connection`);
    },

    message: async (ws, message) => {
        console.log("Client: " + getIp(ws), decoder.decode(message));
        try {
            processMessage(
                ws,
                JSON.parse(decoder.decode(message)) as MessageType
            );
        } catch (e) {
            console.log(e);
        }
    },

    close: async (ws, code, message) => {
        console.log(`Closed conection for client ${ws.getUserData().id}`);
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
