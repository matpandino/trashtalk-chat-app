import { Slot } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserStoreProvider } from "@/utils/providers/user-store-provider";
import { ChattingStoreProvider } from "@/utils/providers/chatting-store-provider";
import { PaperProvider } from "react-native-paper";
import { appTheme } from "@/utils/theme";
import { StatusBar } from "expo-status-bar";
import ToastManager from "toastify-react-native";
import { Dimensions } from "react-native";
import { darken } from "polished";

const queryClient = new QueryClient();

export default function Layout() {
  return (
    <>
      <StatusBar style="light" />
      <ToastManager
        showCloseIcon={false}
        height={60}
        position="bottom"
        width={Dimensions.get("window").width - 40}
        style={{
          backgroundColor: darken(0.4, appTheme.colors.red),
        }}
        textStyle={{
          color: appTheme.colors.white,
          fontSize: 14,
        }}
      />
      <UserStoreProvider>
        <ChattingStoreProvider>
          <QueryClientProvider client={queryClient}>
            <PaperProvider theme={appTheme}>
              <Slot />
            </PaperProvider>
          </QueryClientProvider>
        </ChattingStoreProvider>
      </UserStoreProvider>
    </>
  );
}
