import { create, createStore } from 'zustand'
import { connectWebSocket, sendSocketMessage } from '../socket';
import { ServerEvent, MessageEvent, EventType, ClientEventSentMessage, ClientEventType } from '../../../api/src/types';
import apiClient from '../axios';

interface Users {
  id: string;
  name: string;
  online?: boolean;
}

interface Message {
  id: string;
  data: string;
  createdAt: Date;
}

interface Room {
  id: string;
  users: Users[];
  messages: Message[];
}

interface ChattingStoreState {
  users: Users[];
  rooms: Room[];
}

interface ChattingStoreActions {
  sendMessage: (newMessageDTO: { userId: string; message: string }) => void;
  syncRoomInfo: (args: { roomId: string, userId: string }) => Promise<void>;
  initializeSocket: (token: string) => void;
}

export interface ChattingStore extends ChattingStoreState, ChattingStoreActions { }

export const defaultInitState: ChattingStoreState = {
  rooms: [],
  users: [],
}

export const createChattingStore = (
  initState = defaultInitState,
) => {
  return createStore<ChattingStore>()((set) => ({
    ...initState,
    syncRoomInfo: async ({ roomId, userId }) => {
      try {
        const response = await apiClient.get(`/room/${roomId}`, { headers: { token: userId } });
        console.log("roomId", roomId)
        const room = response.data;
        set(state => {
          const existingRoomIndex = state.rooms.findIndex(room => room.id === roomId);
          if (existingRoomIndex !== -1) {
            const updatedRooms = state.rooms;
            updatedRooms[existingRoomIndex] = {
              ...updatedRooms[existingRoomIndex],
              messages: room.messages,
              users: room.users
            };
            return { ...state, rooms: updatedRooms };
          } else {
            return { ...state, rooms: [...state.rooms, room] };
          }
        });
      } catch (error) {
        console.error('Error syncing room info', JSON.stringify(error, null, 2));
      }
    },
    sendMessage: (newMessageDTO) => {
      const { userId, message } = newMessageDTO;
      sendSocketMessage({ userId, event: ClientEventType.NEW_MESSAGE, data: message } as ClientEventSentMessage);
    },
    initializeSocket: (token) => {
      connectWebSocket(token, (serverEvent) => {
        const eventType = serverEvent.event
        const currentUserId = token
        switch (eventType) {
          case EventType.USER_ONLINE:
            if (serverEvent.user.id === currentUserId) return
            set(state => {
              const existingUserIndex = state.users.findIndex(user => user.id === serverEvent.user.id);
              if (existingUserIndex !== -1) {
                const updatedUsers = [...state.users];
                updatedUsers[existingUserIndex] = {
                  ...updatedUsers[existingUserIndex],
                  name: serverEvent.user.name,
                  online: true
                };
                return { ...state, users: updatedUsers };
              } else {
                return { ...state, users: [...state.users, { id: serverEvent.user.id, name: serverEvent.user.name, online: true }] };
              }
            });
            break;
          case EventType.USER_OFFLINE:
            if (serverEvent.user.id === currentUserId) return
            set(state => {
              const existingUserIndex = state.users.findIndex(user => user.id === serverEvent.user.id);
              if (existingUserIndex !== -1) {
                const updatedUsers = [...state.users];
                updatedUsers[existingUserIndex] = {
                  ...updatedUsers[existingUserIndex],
                  name: serverEvent.user.name,
                  online: true
                };
                return { ...state, users: updatedUsers };
              } else {
                return { ...state, users: [...state.users, { id: serverEvent.user.id, name: serverEvent.user.name, online: false }] };
              }
            });
            break;
          case EventType.MESSAGE:
            set(state => {
              console.log("new message", JSON.stringify(serverEvent, null, 2))
              const existingRoomIndex = state.rooms.findIndex(room => room.id === serverEvent.message.roomId);
              if (existingRoomIndex !== -1) {
                const updatedRooms = state.rooms;
                updatedRooms[existingRoomIndex] = {
                  ...updatedRooms[existingRoomIndex],
                  messages: [...updatedRooms[existingRoomIndex]?.messages, { id: serverEvent.message.id, data: serverEvent.message.data, createdAt: new Date() }]
                };
                return { ...state, rooms: updatedRooms };
              } else {
                return { ...state, rooms: [...state.rooms, { id: serverEvent.message.roomId, users: [], messages: [{ id: serverEvent.message.id, data: serverEvent.message.data, createdAt: new Date() }] }] };
              }
            });
            break;
          case EventType.USER_LIST:
            set(state => {
              return {
                ...state,
                users: serverEvent.users
              }
            });
            break
          case EventType.NEW_ROOM:
            set(state => {
              return {
                ...state,
                rooms: [...[], serverEvent.room]
              }
            })
            break;
            case EventType.ROOMS_LIST:
              set(state => {
                return {
                  ...state,
                  rooms: serverEvent.rooms
                }
              })
              break;
        }
      })
    }
  }))
}