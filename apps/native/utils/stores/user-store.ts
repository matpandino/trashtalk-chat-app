import AsyncStorage from '@react-native-async-storage/async-storage';
import { createStore } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface CurrentUser {
  id: string;
  name: string;
}

interface UserStoreState {
  user: CurrentUser | null;
}

interface UserStoreActions {
  setUser: (user: CurrentUser) => void;
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
