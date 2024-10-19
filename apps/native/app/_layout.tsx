import { Slot } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserStoreProvider } from "../utils/providers/user-store-provider";

const queryClient = new QueryClient();

export default function Layout() {
  return (
    <UserStoreProvider>
      <QueryClientProvider client={queryClient}>
        <Slot/>
      </QueryClientProvider>
    </UserStoreProvider>
  );
}
