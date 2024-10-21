import {
  type ReactNode,
  createContext,
  useRef,
  useContext,
  useEffect,
} from "react";
import { useStore } from "zustand";

import {
  type ChattingStore,
  createChattingStore,
} from "../stores/chatting-store";
import { UserStoreContext, useUserStore } from "./user-store-provider";
import { closeWebSocket } from "../socket";

export type ChattingStoreApi = ReturnType<typeof createChattingStore>;

export const ChattingStoreContext = createContext<ChattingStoreApi | undefined>(
  undefined
);

export interface ChattingStoreProviderProps {
  children: ReactNode;
}

export const ChattingStoreProvider = ({
  children,
}: ChattingStoreProviderProps) => {
  const storeRef = useRef<ChattingStoreApi>();
  if (!storeRef.current) {
    storeRef.current = createChattingStore();
  }
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    closeWebSocket();
    if (user?.id && storeRef.current) {
      storeRef.current.getState().initializeSocket(user?.id);
    }
  }, [user?.id]);

  return (
    <ChattingStoreContext.Provider value={storeRef.current}>
      {children}
    </ChattingStoreContext.Provider>
  );
};

export const useChattingStore = <T,>(
  selector: (store: ChattingStore) => T
): T => {
  const chattingStoreContext = useContext(ChattingStoreContext);

  if (!chattingStoreContext) {
    throw new Error(
      `useChattingStoreContext must be used within ChattingStoreProvider`
    );
  }
  const userStoreContext = useContext(UserStoreContext);

  if (!userStoreContext) {
    throw new Error(
      `useChattingStoreContext must be used within UserStoreProvider`
    );
  }

  return useStore(chattingStoreContext, selector);
};
