import { Slot } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserStoreProvider } from "../utils/providers/user-store-provider";
import { ChattingStoreProvider } from "../utils/providers/chatting-store-provider";
import { DefaultTheme, PaperProvider } from "react-native-paper";

const queryClient = new QueryClient();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
  },
};

export default function Layout() {
  return (
    <UserStoreProvider>
      <ChattingStoreProvider>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={theme}>
            <Slot />
          </PaperProvider>
        </QueryClientProvider>
      </ChattingStoreProvider>
    </UserStoreProvider>
  );
}
