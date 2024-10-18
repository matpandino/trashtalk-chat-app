import fastify from 'fastify';
import websocketPlugin, { WebSocket } from '@fastify/websocket';
import { Event, MessageDTO, UserSockets } from './types'
import { PrismaClient, ChatRoom, Message, User } from '@prisma/client';

const port = 8080;

const prisma = new PrismaClient();

const server = fastify();
server.register(websocketPlugin);

let usersSockets: UserSockets[] = []

const sendMessages = ({ message, sockets }: { sockets: WebSocket[], message: Message }) => {
  sockets.forEach(socket => {
    if (socket) {
      socket.send(JSON.stringify(message))
    }
  });
};

const getUserById = async (userId: string) => {
  return await prisma.user.findUnique({ where: { id: userId } });
};

const getRoomById = async (roomId: string) => {
  return await prisma.chatRoom.findUnique({ where: { id: roomId }, include: { users: true } });
};

const addSocketToUser = ({ socket, userId }: { userId: string, socket: WebSocket }) => {
  const userIndex = usersSockets.findIndex(u => u.userId === userId);

  if (userIndex === -1) {
    usersSockets.push({ userId, sockets: [socket] });
    return
  }
  usersSockets[userIndex].sockets.push(socket);
}

const removeUserSocket = ({ socket, userId }: { userId: string, socket: WebSocket }) => {
  usersSockets = usersSockets.map(u => {
    if (u.userId === userId) {
      u.sockets = u.sockets.filter(s => s !== socket);
    }
    return u;
  });
}

server.post('/users', async (request, reply) => {
  const { name } = request.body as { name: string };

  const userExists = await prisma.user.findUnique({ where: { name } });

  if (userExists) {
    return reply.status(400).send({ error: 'User already exists' });
  }

  const newUser = await prisma.user.create({
    data: {
      name,
    }
  });

  return reply.status(201).send(newUser);
});

server.post('/rooms', async (request, reply) => {
  const { roomUsers } = request.body as { roomUsers: string[] };
  const { token } = request.headers as { token: string };

  const usersToAdd = await Promise.all([...roomUsers, token].map(getUserById));
  const validRoomUsers = usersToAdd?.map(u => u!.id).filter(uid => uid) || [];

  const roomExists = await prisma.chatRoom.findFirst({
    where: {
      users: {
        every: {
          id: {
            in: validRoomUsers,
          },
        },
      },
    },
  });

  if (roomExists) {
    return reply.status(400).send({ error: 'Room already exists' });
  }

  const newRoom = await prisma.chatRoom.create({
    data: {
      users: {
        connect: validRoomUsers as any[],
      },
    }
  });

  return reply.status(201).send(newRoom);
});

// WebSocket route for chat
server.register(async function (server) {
  server.get('/chat', { websocket: true }, async (socket, req) => {
    try {
      const { token } = req.headers as { token: string };

      if (!token) {
        socket.send(JSON.stringify({ error: 'Unauthorized' }));
        socket.close();
        return;
      }
      const user = await getUserById(token);
      if (!user) {
        socket.send(JSON.stringify({ error: 'User is not registered' }));
        socket.close();
        return;
      }
      addSocketToUser({ socket, userId: user.id })

      console.log(`LOG: ${user.name} is online`);

      socket.on('message', async message => {
        const messageParsed = JSON.parse(message.toString()) as MessageDTO;

        switch (messageParsed.event) {
          case Event.JOIN_ROOM:
            break;
          case Event.LEAVE_ROOM:
            break;
          case Event.MESSAGE:
            let room = await getRoomById(messageParsed.roomId);
            if (!room) {
              socket.send(JSON.stringify({ error: 'Room not found' }));
              return
            }
            const createdMessage = await prisma.message.create({
              data: {
                event: messageParsed.event,
                data: messageParsed.message,
                roomId: room.id,
                sentById: user.id,
              },
              include:{
                room: true,
                sentBy: true
              }
            })

            const roomSockets: WebSocket[] = room.users.flatMap(u =>
              usersSockets.filter(us => us.userId === u.id).flatMap(us => us.sockets)
            );

            sendMessages({ message: createdMessage, sockets: roomSockets });
            break;
        }
      })

      // Handle client disconnect
      socket.on('close', () => {
        console.log(`LOG: User ${user.name} lost connection`)
        removeUserSocket({ socket, userId: user.id })
      });
    } catch (error) {
      console.error("error", error)
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
