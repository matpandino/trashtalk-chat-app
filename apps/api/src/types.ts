import { WebSocket } from "@fastify/websocket";
import { Message } from '@prisma/client';

// Client to server events
export enum ClientEventType {
    NEW_MESSAGE = 'new_message',
}

export interface ClientEventSentMessage {
    event: ClientEventType.NEW_MESSAGE;
    data: string;
    userId: string;
}

// Server to client events
export enum EventType {
    USER_ONLINE = 'user_online',
    USER_OFFLINE = 'user_offline',
    USER_LIST = 'user_list',
    MESSAGE = 'message',
}

export interface UserOnlineEvent {
    event: EventType.USER_ONLINE;
    user: {
        id: string;
        name: string;
    };
}

export interface UserOfflineEvent {
    event: EventType.USER_OFFLINE;
    user: {
        id: string;
        name: string;
    };
}

export interface MessageEvent {
    event: EventType.MESSAGE;
    message: Message;
}

export interface UserListEvent {
    event: EventType.USER_LIST;
    users: {
        id: string;
        name: string;
        online: boolean;
    }[];
}

export type ServerEvent = UserOnlineEvent | UserOfflineEvent | MessageEvent | UserListEvent;

// Other Types
export interface UserSockets {
    userId: string;
    sockets: WebSocket[];
}