import { create, createStore } from 'zustand'

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

export interface UserStore extends UserStoreState, UserStoreActions {}

export const defaultInitState: UserStoreState = {
  user: null,
}
export const createUserStore = (
  initState: UserStoreState = defaultInitState,
) => {
  return createStore<UserStore>()((set) => ({
    ...initState,
    clearUser: () => set({ user: null }),
    setUser: (user) => set({ user }),
  }))
}