import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStore } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface User {
  id: string;
  name: string;
}

interface UserStoreState {
  user: User | null;
}

interface UserStoreActions {
  setUser: (user: User) => void;
  clearUser: () => void;
}

export interface UserStore extends UserStoreState, UserStoreActions { }

export const defaultInitState: UserStoreState = {
  user: null,
}

export const createUserStore = (
  initState = defaultInitState,
) => {
  return createStore<UserStore>()(
    persist(
      (set) => ({
        ...initState,
        clearUser: () => set({ user: null }),
        setUser: (user) => set({ user }),
      }),
      {
        name: 'user-storage',
        storage: createJSONStorage(() => AsyncStorage),
      }
    )
  );
};
