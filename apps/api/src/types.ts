import { WebSocket } from "@fastify/websocket";

export interface Message {
    id: string;
    sentBy: {
        id: string;
        username: string;
    } | null;
    message: string;
    createdAt: string;
}

export interface ChatClient {
    id: string;
    username: string;
    socket: WebSocket;
}

export interface ChatRoom {
    id: string;
    clients: ChatClient[];
    messages: Message[]
}