import { WebSocket } from "@fastify/websocket";
import { EventType, ServerEvent, UpdateMessageEvent, UserListEvent, UserOnlineEvent, UserSockets } from "./types";
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
        const isOnline = usersSockets.filter(us => us.userId === u.id).map(us => us.sockets).flat().length > 0;
        return {
            ...u,
            roomId: roomWithUser?.id || null,
            online: isOnline,
        }
    }).sort((a, b) => {
        return (b.online ? 1 : 0) - (a.online ? 1 : 0);
    });
    const event: UserListEvent = { event: EventType.USER_LIST, users: usersListWithOnlineStatus };
    sendEvent({ event, sockets: [notifySocket] });
}

export const validateNewSocketConnection = async ({ req, socket, usersSockets }: { socket: WebSocket, req: FastifyRequest, usersSockets: UserSockets[] }) => {
    const token = req.headers?.token || (req.query as { token?: string })?.token;
    if (!token || Array.isArray(token)) {
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
    const newUserSockets = addSocketToUser({ socket, userId: user.id, usersSockets })

    const allSockets = usersSockets.filter(u => u.userId !== token).flatMap(us => us.sockets);
    const event: UserOnlineEvent = { event: EventType.USER_ONLINE, user: { id: user.id, name: user.name } };
    sendEvent({ event, sockets: allSockets });
    console.log(`LOG: ${user.name} is online`);
    return { user, newUserSockets }
}

export const handleLikeToggleEvent = async ({ messageId, usersSockets, currentUserId }: { messageId: string, usersSockets: UserSockets[], currentUserId: string }) => {
    const message = await prisma.message.findUniqueOrThrow({
        where: { id: messageId },
        select: {
            id: true,
            roomId: true,
            sentById: true,
            attachment: true,
            deleted: true,
            data: true,
            createdAt: true,
            room: {
                select: {
                    id: true,
                    users: {
                        select: {
                            id: true
                        }
                    }
                }
            },
            likes: {
                select: {
                    id: true,
                    messageId: true,
                    userId: true,
                }
            },
            sentBy: true
        }
    });

    const likedByCurrentUser = message.likes.filter(like => like.userId === currentUserId);
    if (likedByCurrentUser.length) {
        await prisma.like.deleteMany({
            where: {
                id: {
                    in: likedByCurrentUser.map(like => like.id)
                }
            }
        });
        const messageWithoutLike = {
            ...message,
            likes: message.likes.filter(l => l.userId !== currentUserId) || []
        }
        const event: UpdateMessageEvent = {
            event: EventType.UPDATE_MESSAGE,
            message: messageWithoutLike,
            roomId: message.room.id
        };
        const notifySockets = usersSockets.filter(socketUser => message.room.users.map(u => u.id).includes(socketUser.userId)).flatMap(us => us.sockets);
        sendEvent({ event, sockets: notifySockets });
    } else {
        await prisma.like.create({
            data: {
                messageId,
                userId: currentUserId
            },
        });
        const updatedMessage = await prisma.message.findUnique({
            where: { id: messageId },
            include: {
                room: {
                    select: {
                        id: true,
                        users: true,
                    }
                },
                likes: true,
                sentBy: true
            }
        });
        if (!updatedMessage) return;
        const notifySockets = usersSockets.filter(socketUser => updatedMessage.room.users.map(u => u.id).includes(socketUser.userId)).flatMap(us => us.sockets);
        const event: UpdateMessageEvent = { event: EventType.UPDATE_MESSAGE, message: updatedMessage, roomId: updatedMessage.room.id };
        sendEvent({ event, sockets: notifySockets });
    }
}

export const handleDeleteMessageEvent = async ({ messageId, usersSockets, currentUserId }: { messageId: string, usersSockets: UserSockets[], currentUserId: string }) => {
    const message = await prisma.message.findUniqueOrThrow({
        where: { id: messageId },
        select: {
            id: true,
            roomId: true,
            sentById: true,
            attachment: true,
            data: true,
            deleted: true,
            createdAt: true,
            room: {
                select: {
                    id: true,
                    users: {
                        select: {
                            id: true
                        }
                    }
                }
            },
            likes: {
                select: {
                    id: true,
                    messageId: true,
                    userId: true,
                }
            },
            sentBy: true
        }
    });

    if(!message?.id){
        throw new Error("Couldn't find message")
    }

    if(message.sentById !== currentUserId){
        throw new Error("You can't delete a message that wasn't sent by you")
    }

    const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: {
            deleted: true,
            data: "",
            attachment: null,
        },
        select: {
            id: true,
            roomId: true,
            sentById: true,
            attachment: true,
            data: true,
            deleted: true,
            createdAt: true,
            room: {
                select: {
                    id: true,
                    users: {
                        select: {
                            id: true
                        }
                    }
                }
            },
            likes: {
                select: {
                    id: true,
                    messageId: true,
                    userId: true,
                }
            },
            sentBy: true
        }
    })

    const notifySockets = usersSockets.filter(socketUser => updatedMessage.room.users.map(u => u.id).includes(socketUser.userId)).flatMap(us => us.sockets);
    const event: UpdateMessageEvent = { event: EventType.UPDATE_MESSAGE, message: updatedMessage, roomId: updatedMessage.room.id };
    sendEvent({ event, sockets: notifySockets });
}   