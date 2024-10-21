import { Slot } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserStoreProvider } from "@/utils/providers/user-store-provider";
import { ChattingStoreProvider } from "@/utils/providers/chatting-store-provider";
import { PaperProvider } from "react-native-paper";
import { appTheme } from "@/utils/theme";
import { StatusBar } from "expo-status-bar";

const queryClient = new QueryClient();

export default function Layout() {
  return (
    <UserStoreProvider>
      <ChattingStoreProvider>
        <QueryClientProvider client={queryClient}>
          <PaperProvider theme={appTheme}>
            <StatusBar style="light" />
            <Slot />
          </PaperProvider>
        </QueryClientProvider>
      </ChattingStoreProvider>
    </UserStoreProvider>
  );
}
