import { createStore } from 'zustand'
import { connectWebSocket, sendSocketMessage } from '@/utils/socket';
import { EventType, ClientEventSentMessage, ClientEventType, ClientEventLikeToggleMessage, ClientEventDeleteMessage } from '@/api/src/types';
import { ChatRoom, User as PrismaUser, Message as PrismaMessage, Like } from '@/api/prisma/prisma-types'
import { Toast } from 'toastify-react-native';

export interface User extends PrismaUser {
  roomId?: string | null;
  online?: boolean;
}

export interface Message extends PrismaMessage {
  likes: Like[];
}

interface Room extends ChatRoom {
  messages: Message[];
}

interface ChattingStoreState {
  users: User[];
  rooms: Room[];
  status: 'online' | 'offline'
}

interface ChattingStoreActions {
  likeToggle: (likeToggleDTO: { messageId: string }) => void,
  deleteMessage: (deleteMessageDTO: { messageId: string }) => void,
  sendMessage: (newMessageDTO: { roomId: string; message: string, image?: string }) => void;
  initializeSocket: (token: string) => void;
  updateRoom: (newRoomData: Room) => void;
}

export interface ChattingStore extends ChattingStoreState, ChattingStoreActions { }

export const defaultInitState: ChattingStoreState = {
  rooms: [],
  users: [],
  status: 'offline'
}

export const createChattingStore = (
  initState = defaultInitState,
) => {
  return createStore<ChattingStore>()((set) => ({
    ...initState,
    deleteMessage: ({ messageId }) => {
      sendSocketMessage({ event: ClientEventType.DELETE_MESSAGE, messageId } as ClientEventDeleteMessage);
    },
    sendMessage: (newMessageDTO) => {
      const { roomId, message, image } = newMessageDTO;
      sendSocketMessage({ roomId, event: ClientEventType.NEW_MESSAGE, data: message, image } as ClientEventSentMessage);
    },
    likeToggle: ({ messageId }) => {
      sendSocketMessage({ event: ClientEventType.LIKE_TOGGLE, messageId } as ClientEventLikeToggleMessage);
    },
    updateRoom: (newRoomData) => {
      set(state => {
        const roomExists = state.rooms.find(room => room.id === newRoomData.id);
        if (roomExists) {
          return { ...state, rooms: state.rooms.map(room => room.id === newRoomData.id ? newRoomData : room) };
        } else {
          return { ...state, rooms: [...state.rooms, newRoomData] };
        }
      });
    },
    initializeSocket: (token) => {
      set(state => defaultInitState)
      connectWebSocket(token,
        // HANDLE STATUS CHANGE
        (statusChange) => {
          set(state => ({ ...state, status: statusChange }))
        },
        // HANDLE SOCKET ERRORS
        (error) => {
          const errorMessage = typeof error === 'string' ? error : undefined;
          if (errorMessage) {
            const maxLength = 100;
            const errorFormatted = ((errorMessage).length > maxLength) ?
              (((errorMessage).substring(0, maxLength - 3)) + '...') :
              errorMessage
            Toast.error('Error: ' + errorFormatted, 'top');
          }
        },
        // HANDLE SOCKET MESSAGES
        (serverEvent) => {
          const eventType = serverEvent.event
          const currentUserId = token
          switch (eventType) {
            case EventType.USER_ONLINE:
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
                const existingRoom = state.rooms.find(room => room.id === serverEvent.message.roomId);
                if (existingRoom) {
                  const updatedRooms = state.rooms.map(room => {
                    if (room.id === serverEvent.message.roomId) {
                      return {
                        ...room,
                        messages: [...room?.messages, serverEvent.message]
                      } as Room;
                    }
                    return room as Room;
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
                          messages: [serverEvent.message],
                        } as Room
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
            case EventType.UPDATE_MESSAGE:
              set(state => {
                return {
                  ...state,
                  rooms: [...state.rooms.map(room => {
                    if (room.id === serverEvent.roomId) {
                      return {
                        ...room,
                        messages: room.messages.map(message => {
                          if (message.id === serverEvent.message.id) {
                            return serverEvent.message;
                          }
                          return message;
                        })
                      } as Room
                    }
                    return room;
                  })]
                }
              });
              break
            case EventType.NEW_ROOM:
              set(state => {
                const newRoomUser = serverEvent.room.users.find(u => u.id !== token);
                const newUsers = state.users.map(u => {
                  if (newRoomUser?.id === u.id) return { ...u, roomId: serverEvent.room.id } as User;
                  return u
                });
                return {
                  ...state,
                  users: newUsers,
                  rooms: [serverEvent.room as Room, ...state.rooms]
                }
              })
              break;
          }
        })
    }
  }))
}