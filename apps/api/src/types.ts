import { WebSocket } from "@fastify/websocket";

export enum Event {
    JOIN_ROOM = 'join_room',
    LEAVE_ROOM = 'leave_room',
    MESSAGE = 'message',
}

export interface MessageDTO {
    event: Event;
    message: string;
    roomId: string;
    user: {
        id: string;
        name: string;
    } | null;
}

export interface UserSockets {
    userId: string;
    sockets: WebSocket[];
}