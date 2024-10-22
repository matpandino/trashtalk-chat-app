import fastify from 'fastify';
import websocketPlugin, { WebSocket } from '@fastify/websocket';
import { ClientEventLikeToggleMessage, ClientEventSentMessage, ClientEventType, EventType, MessageEvent, NewRoomEvent, UserOfflineEvent, UserSockets } from './types'
import { PrismaClient } from '@prisma/client';
import { getAndNotifyUsersList, getChatRoomById, handleLikeToggleEvent, removeUserSocket, sendEvent, validateNewSocketConnection } from './helpers';

const port = 8080;
let usersSockets: UserSockets[] = []

export const prisma = new PrismaClient();

const server = fastify();
server.register(websocketPlugin);

// Create User route
server.post('/users', async (request, reply) => {
  const { name } = request.body as { name: string };
  const userExists = await prisma.user.findUnique({ where: { name } });

  if (userExists) return userExists
  const newUser = await prisma.user.create({ data: { name } });

  return reply.status(201).send(newUser);
});

// Get - Create room route
server.get('/users/:userId/room', async (request, reply) => {
  const { userId } = request.params as { userId: string };
  const { token } = request.headers as { token: string };

  if (!token) return reply.status(400).send({ error: 'Invalid user token' });
  if (!userId) return reply.status(400).send({ error: 'Invalid user' });

  const currentUser = await prisma.user.findUnique({ where: { id: token } });
  if (!currentUser) return reply.status(401).send({ error: 'Invalid user token' });

  const userRoom = await prisma.user.findUnique({ where: { id: userId } });
  if (!userRoom) return reply.status(400).send({ error: 'Invalid user ID' });

  const userIds = [userRoom.id, currentUser.id];
  const room = await prisma.chatRoom.findFirst({
    where: {
      users: {
        every: {
          id: { in: userIds }
        }
      }
    },
    include: {
      messages: {
        include: {
          likes: true,
          sentBy: true,
        }
      },
      users: true,
    },
  });
  if (!room) {
    const newRoom = await prisma.chatRoom.create({
      data: {
        users: {
          connect: [userRoom, currentUser],
        },
      },
      select: {
        id: true, messages: {
          include: {
            likes: true,
            sentBy: true,
          }
        }, users: true
      },
    });
    const newEvent: NewRoomEvent = { event: EventType.NEW_ROOM, room: newRoom };
    const sockets = usersSockets.filter(u => userIds.includes(u.userId)).flatMap(us => us.sockets);
    sendEvent({ event: newEvent, sockets });
    return reply.status(201).send(newRoom);
  }
  return reply.status(200).send(room);
});

// todo: upload image logic
// const uploadImage = async ({ image }: { image: string }) => {
// };

// WebSocket
server.register(async function (server) {
  server.get('/chat', { websocket: true }, async (socket, req) => {
    try {
      const { user, newUserSockets } = await validateNewSocketConnection({ req, socket, usersSockets });
      usersSockets = newUserSockets;
 
      getAndNotifyUsersList({ userId: user.id, notifySocket: socket, usersSockets: newUserSockets });

      socket.on('message', async message => {
        try {
          const messageParsed = JSON.parse(message.toString())
          switch (messageParsed?.event) {
            case ClientEventType.LIKE_TOGGLE:
              const likeToggleEvent = messageParsed as ClientEventLikeToggleMessage;
              console.log("LOG: likeToggleEvent", JSON.stringify(likeToggleEvent))
              handleLikeToggleEvent({ currentUserId: user.id, messageId: likeToggleEvent.messageId, usersSockets });
              break
            case ClientEventType.NEW_MESSAGE:
              const messageEvent = messageParsed as ClientEventSentMessage;
              console.log("LOG: messageEvent request: ", messageEvent)
              if (!messageEvent?.roomId) return socket.send(JSON.stringify({ error: 'Invalid roomId' }));
              let room = await getChatRoomById({ chatRoomId: messageEvent.roomId });
              if (!room) {
                socket.send(JSON.stringify({ error: 'Room not found' }));
                return
              }
              // TODO: Upload image to s3 or self host..
              // if(messageEvent.image){
              // const image = await uploadImage({ image: messageEvent.image });
              // messageEvent.image = image;
              // }
              const createdMessage = await prisma.message.create({
                data: {
                  data: messageEvent.data,
                  attachment: messageEvent.image,
                  roomId: room.id,
                  sentById: user.id,
                },
                include: { room: true, sentBy: true, likes: true }
              })

              const roomSockets: WebSocket[] = usersSockets.filter(
                us => room.users.map(u => u.id).includes(us.userId)
              ).flatMap(us => us.sockets);
              const event: MessageEvent = { event: EventType.MESSAGE, message: createdMessage };
              console.log("LOG: message sent event", event, 'sent to sockets (count): ', roomSockets.length)
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
          const allSockets = usersSockets.flatMap(u => u.sockets);
          console.log(`LOG: ${user.name} is offline`);
          const event: UserOfflineEvent = { event: EventType.USER_OFFLINE, user: { id: user.id, name: user.name } };
          sendEvent({ event, sockets: allSockets });
          const newUserSockets = removeUserSocket({ socket, userId: user.id, usersSockets })
          usersSockets = newUserSockets;
        }
      });
    } catch (error: any) {
      console.error("Socket Error: ", error)
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
