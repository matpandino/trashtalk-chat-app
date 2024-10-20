import fastify from 'fastify';
import websocketPlugin, { WebSocket } from '@fastify/websocket';
import { ClientEventSentMessage, ClientEventType, EventType, MessageEvent, UserListEvent, UserOfflineEvent, UserSockets } from './types'
import { PrismaClient } from '@prisma/client';
import { getAndNotifyRoomsList, getAndNotifyUsersList, getOrCreateChatRoomByUsersId, getUserListWithOnlineStatus, removeUserSocket, sendEvent, validateNewSocketConnection } from './helpers';

const port = 8080;
let usersSockets: UserSockets[] = []

export const prisma = new PrismaClient();

const server = fastify();
server.register(websocketPlugin);

// Create User route
server.post('/users', async (request, reply) => {
  const { name } = request.body as { name: string };
  const userExists = await prisma.user.findUnique({ where: { name } });

  if (userExists) return reply.status(400).send({ error: 'User already exists' });
  const newUser = await prisma.user.create({ data: { name } });

  return reply.status(201).send(newUser);
});

// Get room info route
server.get('/rooms/:id', async (request, reply) => {
  const { id } = request.params as { id: string };
  const { token } = request.headers as { token: string };
  if (!token) return reply.status(400).send({ error: 'Invalid user token' });
  if (!id) return reply.status(400).send({ error: 'Invalid room ID' });

  const room = await prisma.chatRoom.findUnique({
    where: { id }, include: {
      messages: true,
      users: true
    }
  });
  if (!room?.users.map(u => u.id).includes(token)) return reply.status(401).send({ error: 'User is not authorized to access this room' });
  if (!room) return reply.status(404).send({ error: 'Room not found' });
  return reply.status(200).send(room);
});

// WebSocket
server.register(async function (server) {
  server.get('/chat', { websocket: true }, async (socket, req) => {
    try {
      const { user, newUserSockets } = await validateNewSocketConnection({ req, socket, usersSockets });
      usersSockets = newUserSockets;

      getAndNotifyUsersList({ userId: user.id, usersSockets });
      getAndNotifyRoomsList({ userId: user.id, usersSockets });

      socket.on('message', async message => {
        try {
          const messageParsed = JSON.parse(message.toString())
          switch (messageParsed?.event) {
            case ClientEventType.NEW_MESSAGE:
              const messageEvent = messageParsed as ClientEventSentMessage;
              if (!messageEvent?.userId) return socket.send(JSON.stringify({ error: 'Invalid userId' }));
              let room = await getOrCreateChatRoomByUsersId({ users: [messageEvent.userId, user.id], usersSockets });
              if (!room) {
                socket.send(JSON.stringify({ error: 'Room not found' }));
                return
              }
              const createdMessage = await prisma.message.create({
                data: {
                  data: messageEvent.data,
                  roomId: room.id,
                  sentById: user.id,
                },
                include: { room: true, sentBy: true }
              })

              const roomSockets: WebSocket[] = room.users.flatMap(u =>
                usersSockets.filter(us => us.userId === u.id).flatMap(us => us.sockets)
              );
              const event: MessageEvent = { event: EventType.MESSAGE, message: createdMessage };
              
              sendEvent({ event, sockets: roomSockets });
              break;
            default:
              socket.send(JSON.stringify({ error: 'Invalid event' }));
              break;
          }
        } catch (error: any) {
          console.error(error)
          socket.send(JSON.stringify({ error: error?.message }));
          return
        }
      })

      // Handle client disconnect
      socket.on('close', () => {
        if (user) {
          const prevUserSockets = usersSockets.filter(us => us.userId === user.id);
          if (prevUserSockets.length === 1) {
            const allSockets = usersSockets.flatMap(us => us.sockets);
            const event: UserOfflineEvent = { event: EventType.USER_OFFLINE, user: { id: user.id, name: user.name } };
            sendEvent({ event, sockets: allSockets });
          }
          const newUserSockets = removeUserSocket({ socket, userId: user.id, usersSockets })
          usersSockets = newUserSockets;
        }
      });
    } catch (error: any) {
      socket.send(JSON.stringify({ error: error?.message }));
      return
    }
  });
});

// Start the server
server.listen({ port }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
