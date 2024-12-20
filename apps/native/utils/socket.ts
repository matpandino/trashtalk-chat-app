import { ServerEvent } from "../../api/src/types";
import { Toast } from 'toastify-react-native';

let ws: any = null;

export const connectWebSocket = (token: string, statusChange: (newStatus: 'online' | 'offline') => void, onError: (error?: any) => void, onMessage: (event: ServerEvent) => void) => {
    ws = new WebSocket('ws://localhost:8080/chat?token=' + token);

    ws.onopen = () => {
        statusChange('online')
        console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event: any) => {
        try {
            const data = JSON.parse(event.data);
            if (data?.error) {
                throw new Error(data.error);
            }
            onMessage(data);
        } catch (error: any) {
            const errorMessage = error?.message || error;
            onError(errorMessage)
        }
    };

    ws.onerror = (error: any) => {
        const errorMessage = error?.message || error;
        onError(errorMessage)
        console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
        statusChange('offline')
        console.log('WebSocket connection closed');
    };
};

export const closeWebSocket = () => {
    ws?.close?.();
    ws = null;
    console.log('WebSocket connection closed');
};

export const sendSocketMessage = (message: any) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    } else {
        Toast.error('Error: Connection not established', 'top');
        console.error('WebSocket is not connected');
    }
};
