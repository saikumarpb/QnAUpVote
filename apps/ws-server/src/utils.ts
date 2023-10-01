import { WebSocket } from "uWebSockets.js";

export const decoder = new TextDecoder()

export function getIp(ws: WebSocket<any>){
    return decoder.decode(ws.getRemoteAddressAsText())
}