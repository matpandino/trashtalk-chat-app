import { ServerEvent } from "../../api/src/types";

let ws: any = null;
let reconnectTimeout: NodeJS.Timeout | null = null; // To store the timeout for reconnection attempts
const RECONNECT_DELAY = 5000; // Initial delay for reconnection in milliseconds

const reconnectWebSocket = (token: string, onMessage: (event: ServerEvent) => void) => {
  console.log("Attempting to reconnect...");
  reconnectTimeout = setTimeout(() => {
    connectWebSocket(token, onMessage);
  }, RECONNECT_DELAY);
};

export const connectWebSocket = (token: string, onMessage: (event: ServerEvent) => void) => {
    ws = new WebSocket('ws://localhost:8080/chat?token=' + token);

    ws.onopen = () => {
        console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event: any) => {
        try {
            const data = JSON.parse(event.data);
            console.log("received data",data)
            if (data?.error) {
                throw new Error(data.error);
            }
            onMessage(data);
        } catch (error) {
            console.error("error", error)
        }
    };

    ws.onerror = (error: any) => {
        console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
        console.log('WebSocket connection closed');
        reconnectWebSocket(token, onMessage); 
    };
};

export const sendSocketMessage = (message: any) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    } else {
        console.error('WebSocket is not connected');
    }
};
