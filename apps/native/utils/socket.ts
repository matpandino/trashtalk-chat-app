let ws: any = null;

export const connectWebSocket = (onMessage: any) => {
    ws = new WebSocket('ws://localhost:8080/chat');

    ws.onopen = () => {
        console.log('Connected to WebSocket server');
    };

    ws.onmessage = (event: any) => {
        const data = JSON.parse(event.data);
        onMessage(data);
    };

    ws.onerror = (error: any) => {
        console.error('WebSocket error:', error);
    };

    ws.onclose = () => {
        console.log('WebSocket connection closed');
    };
};

export const sendMessage = (message: any) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    } else {
        console.error('WebSocket is not connected');
    }
};
