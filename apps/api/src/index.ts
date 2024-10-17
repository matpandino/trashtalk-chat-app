import fastify from 'fastify';
import websocketPlugin from '@fastify/websocket';
import { v7 as uuid } from 'uuid';
import { ChatClient, ChatRoom, Message } from './types'

const port = 8080;

const server = fastify();
server.register(websocketPlugin);

let rooms: ChatRoom[] = []

// Function to create a new chat room
const createRoom = (roomId: string): ChatRoom => {
  const room: ChatRoom = { id: roomId, clients: [], messages: [] };
  rooms = [...rooms, room];
  return room;
};

// Function to broadcast a message to all clients in a room except the sender
const broadcastMessage = (roomId: string, message: Message) => {
  const room = rooms.filter(room => room.id === roomId)?.[0];
  if (room) {
    room.clients.forEach(client => {
      client.socket.send(JSON.stringify(message));
    });
  }
};

// WebSocket route for chat
server.register(async function (server) {
  server.get('/chat/:roomId', { websocket: true }, (socket, req) => {
    try {
      const roomId = (req.params as { roomId: string }).roomId;
      let room = rooms?.filter(room => room.id === roomId)?.[0];

      // If room doesn't exist, create a new one
      if (!room) {
        room = createRoom(roomId);
      }

      // Assign a random username to the user
      const randomUsername = `User-${uuid()}`;
      const clientId = uuid()
      const client: ChatClient = { id: clientId, username: randomUsername, socket };

      // Add client to the room
      room.clients.push(client);

      console.log(`${client.username} joined room ${roomId}`);

      // Handle new user joining the room
      const createdMessage: Message = {
        id: uuid(),
        message: `${client.username} has joined the room ${roomId}`,
        sentBy: null,
        createdAt: new Date().toISOString()
      }
      broadcastMessage(roomId, createdMessage);

      // Handle messages from the client
      socket.on('message', message => {
        const createdMessage: Message = {
          id: uuid(),
          message: message.toString(),
          sentBy: {
            id: client.id,
            username: client.username
          },
          createdAt: new Date().toISOString()
        }

        broadcastMessage(roomId, createdMessage);
      });

      // Handle client disconnect
      socket.on('close', () => {
        const createdMessage: Message = {
          id: uuid(),
          message: `${client.username} left room ${roomId}`,
          sentBy: null,
          createdAt: new Date().toISOString()
        }
        room.clients = room.clients.filter(c => c.id !== clientId);
        broadcastMessage(roomId, createdMessage);

        // // If the room is empty, delete it
        // if (room.clients.length === 0) {
        //   const newRooms = rooms.filter(r => r.id !== roomId);
        //   rooms = newRooms;
        //   console.log(`Room ${roomId} deleted as it is empty.`);
        // }
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
