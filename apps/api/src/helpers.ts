import { WebSocket } from "@fastify/websocket";
import { Event, EventType, UserOnlineEvent, UserSockets } from "./types";
import { prisma } from "./index";
import { FastifyRequest } from "fastify";

export const sendEvent = ({ event, sockets }: { sockets: WebSocket[], event: Event }) => {
    sockets.forEach(socket => {
        if (socket) {
            socket.send(JSON.stringify(event))
        }
    });
};

export const getUserById = (userId: string) => {
    return prisma.user.findUnique({ where: { id: userId } });
};

export const getOrCreateChatRoomByUsersId = async (users: string[]) => {
    const validatedUsers = await prisma.user.findMany({
        where: {
            id: { in: users },
        },
        select: { id: true }
    });

    if (users.length !== validatedUsers.length) {
        throw new Error('Invalid users. Could not create room.');
    }

    const room = await prisma.chatRoom.findFirst({
        where: {
            users: {
                every: {
                    id: { in: users },
                }
            }
        }, select: { id: true, users: true, messages: true }
    });
    if (room) {
        return room;
    }
    const newRoom = await prisma.chatRoom.create({
        data: {
            users: {
                connect: validatedUsers
            },
        },
        select: { id: true, messages: true, users: true },
    });
    return newRoom;
}


export const removeUserSocket = ({ socket, userId, usersSockets }: { userId: string, socket: WebSocket, usersSockets: UserSockets[] }) => {
    return usersSockets.map(u => {
        if (u.userId === userId) {
            u.sockets = u.sockets.filter(s => s !== socket);
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

export const getUserListWithOnlineStatus = async ({ userId, usersSockets }: { userId: string, usersSockets: UserSockets[] }) => {
    const allUsers = await prisma.user.findMany({
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

    const allUsersWithOnlineStatus = allUsers.map(u => ({ ...u, online: usersSockets.filter(us => us.userId === u.id).length > 0 }));
    return allUsersWithOnlineStatus
}

export const validateNewSocketConnection = async ({ req, socket, usersSockets }: { socket: WebSocket, req: FastifyRequest, usersSockets: UserSockets[] }) => {
    const { token } = req.headers as { token: string };
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

    // Notify that user is online if didn't had a connection
    if (prevUserSockets.length === 0) {
        const allSockets = usersSockets.flatMap(us => us.sockets);
        const event: UserOnlineEvent = { event: EventType.USER_ONLINE, user: { id: user.id, name: user.name } };
        sendEvent({ event, sockets: allSockets });
    }
    console.log(`LOG: ${user.name} is online`);
    return { user, newUserSockets }
}