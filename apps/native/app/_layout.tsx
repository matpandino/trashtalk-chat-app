import { Slot } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserStoreProvider } from "../utils/providers/user-store-provider";
import { ChattingStoreProvider } from "../utils/providers/chatting-store-provider";
import { DefaultTheme, PaperProvider, useTheme } from "react-native-paper";

const queryClient = new QueryClient();

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    red: "#ff3f3f",
  },
};

export type AppTheme = typeof theme;

export const useAppTheme = () => useTheme<AppTheme>();

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
