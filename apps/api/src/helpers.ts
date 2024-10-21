import { WebSocket } from "@fastify/websocket";
import { EventType, NewRoomEvent, RoomsListEvent, ServerEvent, UserListEvent, UserOnlineEvent, UserSockets } from "./types";
import { prisma } from "./index";
import { FastifyRequest } from "fastify";

export const sendEvent = ({ event, sockets }: { sockets: WebSocket[], event: ServerEvent }) => {
    sockets.forEach(socket => {
        if (socket) {
            socket.send(JSON.stringify(event))
        }
    });
};

export const getUserById = (userId: string) => {
    return prisma.user.findUnique({ where: { id: userId } });
};

export const getAndNotifyRoomsList = async ({ notifySockets, userId }: { notifySockets: WebSocket[], userId: string }) => {
    const userRooms = await prisma.chatRoom.findMany({
        include: {
            users: true,
            messages: true
        },
        where: {
            users: {
                some: {
                    id: userId
                }
            }
        }
    });

    const event: RoomsListEvent = { event: EventType.ROOMS_LIST, rooms: userRooms };
    sendEvent({ event, sockets: notifySockets });
}

export const getChatRoomById = async ({ chatRoomId }: { chatRoomId: string }) => {
    const room = await prisma.chatRoom.findUnique({
        where: { id: chatRoomId },
        select: { id: true, users: true, messages: true }
    });
    if (!room) throw new Error('Room not found');

    return room;
}

export const removeUserSocket = ({ socket, userId, usersSockets }: { userId: string, socket: WebSocket, usersSockets: UserSockets[] }) => {
    return usersSockets.map(u => {
        if (u.userId === userId) {
            return {
                ...u,
                sockets: [],
            };
        }
        return u;
    });
}

export const addSocketToUser = ({ socket, userId, usersSockets }: { userId: string, socket: WebSocket, usersSockets: UserSockets[] }) => {
    const userIndex = usersSockets.findIndex(u => u.userId === userId);

    if (userIndex === -1) {
        usersSockets.push({ userId, sockets: [socket] });
        return usersSockets
    }
    usersSockets[userIndex].sockets.push(socket);
    return usersSockets
}

export const getAndNotifyUsersList = async ({ userId, usersSockets, notifySocket }: { userId: string, usersSockets: UserSockets[], notifySocket: WebSocket }) => {
    const allUsersExceptCurrent = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
        },
        where: {
            id: {
                not: userId,
            }
        }
    });

    const userRooms = await prisma.chatRoom.findMany({
        include: {
            users: true
        },
        where: {
            users: {
                some: {
                    id: userId
                },
            }
        }
    });

    const usersListWithOnlineStatus = allUsersExceptCurrent.map(u => {
        const roomWithUser = userRooms.find(room => {
            const roomUsers = room.users.map(u => u.id);
            return roomUsers.includes(u.id) && roomUsers.includes(userId)
        })

        return {
            ...u,
            roomId: roomWithUser?.id || null,
            online: usersSockets.filter(us => us.userId === u.id).length > 0
        }
    }).sort((a, b) => {
        return (b.online ? 1 : 0) - (a.online ? 1 : 0);
    });
    const event: UserListEvent = { event: EventType.USER_LIST, users: usersListWithOnlineStatus };
    sendEvent({ event, sockets: [notifySocket] });
}

export const validateNewSocketConnection = async ({ req, socket, usersSockets }: { socket: WebSocket, req: FastifyRequest, usersSockets: UserSockets[] }) => {
    const token = req.headers?.token || req.query?.token
    if (!token) {
        socket.send(JSON.stringify({ error: 'Unauthorized' }));
        socket.close();
        throw new Error('Invalid token');
    }
    const user = await getUserById(token);
    if (!user) {
        socket.send(JSON.stringify({ error: 'User is not registered' }));
        socket.close();
        throw new Error('User is not registered');
    }
    const prevUserSockets = usersSockets.filter(us => us.userId === user.id);
    const newUserSockets = addSocketToUser({ socket, userId: user.id, usersSockets })

    const allSockets = usersSockets.filter(u => u.userId !== token).flatMap(us => us.sockets);
    const event: UserOnlineEvent = { event: EventType.USER_ONLINE, user: { id: user.id, name: user.name } };
    sendEvent({ event, sockets: allSockets });
    console.log(`LOG: ${user.name} is online`);
    return { user, newUserSockets }
}