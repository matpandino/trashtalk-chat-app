import { WebSocket } from "@fastify/websocket";
import { Like, Message as PrismaMessage, User } from '@prisma/client';

// Client to server events
export enum ClientEventType {
    NEW_MESSAGE = 'new_message',
    LIKE_TOGGLE = 'like_toggle',
}

export interface ClientEventLikeToggleMessage {
    event: ClientEventType.LIKE_TOGGLE;
    messageId: string;
}

export interface ClientEventSentMessage {
    event: ClientEventType.NEW_MESSAGE;
    data: string;
    image?: string;
    roomId: string;
}

// Server to client events
export enum EventType {
    USER_ONLINE = 'user_online',
    USER_OFFLINE = 'user_offline',
    USER_LIST = 'user_list',
    MESSAGE = 'message',
    UPDATE_MESSAGE = 'update_message',
    NEW_ROOM = 'new_room',
}

interface Message extends PrismaMessage {
    likes: Like[];
}

export interface NewRoomEvent {
    event: EventType.NEW_ROOM;
    room: {
        id: string;
        users: User[];
        messages: Message[];
    }
}

export interface UpdateMessageEvent {
    event: EventType.UPDATE_MESSAGE;
    roomId: string;
    message: Message
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

export type ServerEvent = UpdateMessageEvent | UserOnlineEvent | UserOfflineEvent | MessageEvent | UserListEvent | NewRoomEvent;

// Other Types
export interface UserSockets {
    userId: string;
    sockets: WebSocket[];
}