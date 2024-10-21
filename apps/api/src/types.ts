import { WebSocket } from "@fastify/websocket";
import { Message, User } from '@prisma/client';

// Client to server events
export enum ClientEventType {
    NEW_MESSAGE = 'new_message',
}

export interface ClientEventSentMessage {
    event: ClientEventType.NEW_MESSAGE;
    data: string;
    roomId: string;
}

// Server to client events
export enum EventType {
    USER_ONLINE = 'user_online',
    USER_OFFLINE = 'user_offline',
    USER_LIST = 'user_list',
    ROOMS_LIST = 'rooms_list',
    MESSAGE = 'message',
    NEW_ROOM = 'new_room',
}

export interface RoomsListEvent {
    event: EventType.ROOMS_LIST;
    rooms: {
        id: string;
        users: User[];
        messages: Message[];
    }[]
}

export interface NewRoomEvent {
    event: EventType.NEW_ROOM;
    room: {
        id: string;
        users: User[];
        messages: Message[];
    }
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
        roomId: string | null;
        online: boolean;
    }[];
}

export type ServerEvent = UserOnlineEvent | UserOfflineEvent | MessageEvent | UserListEvent | NewRoomEvent | RoomsListEvent;

// Other Types
export interface UserSockets {
    userId: string;
    sockets: WebSocket[];
}