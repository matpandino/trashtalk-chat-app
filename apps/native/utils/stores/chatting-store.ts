import { createStore } from 'zustand'
import { connectWebSocket, sendSocketMessage } from '../socket';
import { EventType, ClientEventSentMessage, ClientEventType } from '../../../api/src/types';
import apiClient from '../axios';

interface Users {
  id: string;
  name: string;
  roomId?: string | null;
  online?: boolean;
}

interface Message {
  id: string;
  data: string;
  sentById: string | null;
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
  sendMessage: (newMessageDTO: { roomId: string; message: string }) => void;
  initializeSocket: (token: string) => void;
  updateRoom: (newRoomData: Room) => void;
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
    sendMessage: (newMessageDTO) => {
      console.log("newMessageDTO",newMessageDTO)
      const { roomId, message } = newMessageDTO;
      sendSocketMessage({ roomId, event: ClientEventType.NEW_MESSAGE, data: message } as ClientEventSentMessage);
    },
    updateRoom: (newRoomData) => {
      set(state => {
        const roomExists = state.rooms.find(room => room.id === newRoomData.id);
        console.log(".. roomExists ",roomExists)
        if (roomExists) {
          return { ...state, rooms: state.rooms.map(room => room.id === newRoomData.id ? newRoomData : room) };
        } else {
          return { ...state, rooms: [...state.rooms, newRoomData] };
        }
      });
    },
    initializeSocket: (token) => {
      set(state => defaultInitState)
      connectWebSocket(token, (serverEvent) => {
        const eventType = serverEvent.event
        const currentUserId = token
        switch (eventType) {
          case EventType.USER_ONLINE:
            console.log("user ON: ", JSON.stringify(serverEvent, null, 2))

            if (serverEvent.user.id === currentUserId) return
            set(state => {
              const foundUser = state.users.find(user => user.id === serverEvent.user.id);
              if (foundUser) {
                const updatedUsers = state.users.map(u => u.id === serverEvent.user.id ? { ...u, online: true } : u);
                return { ...state, users: updatedUsers };
              } else {
                return { ...state, users: [{ id: serverEvent.user.id, name: serverEvent.user.name, online: true, roomId: null }, ...state.users] };
              }
            });
            break;
          case EventType.USER_OFFLINE:
            console.log("user OFF: ", JSON.stringify(serverEvent, null, 2))

            if (serverEvent.user.id === currentUserId) return
            set(state => {
              const foundUser = state.users.find(user => user.id === serverEvent.user.id);
              if (foundUser) {
                const updatedUsers = state.users.map(u => u.id === serverEvent.user.id ? { ...u, online: false } : u);
                return { ...state, users: updatedUsers };
              } else {
                return { ...state, users: [{ id: serverEvent.user.id, name: serverEvent.user.name, online: false, roomId: null }, ...state.users] };
              }
            });
            break;
          case EventType.MESSAGE:
            set(state => {
              console.log(".....")
              console.log("new message", JSON.stringify(serverEvent, null, 2))
              const existingRoom = state.rooms.find(room => room.id === serverEvent.message.roomId);
              if (existingRoom) {
                const updatedRooms = state.rooms.map(room => {
                  if (room.id === serverEvent.message.roomId) {
                    return {
                      ...room,
                      messages: [...room?.messages, serverEvent.message]
                    };
                  }
                  return room;
                });
                return { ...state, rooms: updatedRooms };
              } else {
                return {
                  ...state,
                  rooms:
                    [
                      ...state.rooms,
                      {
                        id: serverEvent.message.roomId,
                        users: [],
                        messages: [serverEvent.message],
                      }
                    ]
                };
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
              const newRoomUser = serverEvent.room.users.find(u => u.id !== token);
              const newUsers = state.users.map(u => {
                if (newRoomUser?.id === u.id) return { ...u, roomId: serverEvent.room.id };
                return u
              });
              return {
                ...state,
                users: newUsers,
                rooms: [serverEvent.room, ...state.rooms]
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