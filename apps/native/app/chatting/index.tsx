import React from "react";
import { StyleSheet, View } from "react-native";
import { FlatList } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useChattingStore } from "@/utils/providers/chatting-store-provider";
import { Container } from "@/components/Container";
import { ChatListItem } from "@/components/ChatListItem";
import { Appbar, Text } from "react-native-paper";
import { useUserStore } from "@/utils/providers/user-store-provider";
import { Separator } from "@/components/Separator";
import { appTheme } from "@/utils/theme";
import apiClient from "@/utils/axios";
import { ConnectionLostHeader } from "@/components/ConnectionLostHeader";
import { closeWebSocket } from "@/utils/socket";
import { Toast } from "toastify-react-native";

export default function Page() {
  const { clearUser, user: currentUser } = useUserStore((state) => state);
  const { users, updateRoom, status } = useChattingStore((state) => state);
  const router = useRouter();

  const handleChat = async ({
    userId,
  }: {
    roomId?: string | null;
    userId: string;
  }) => {
    try {
      const response = await apiClient.get(`/users/${userId}/room`, {
        headers: { token: currentUser?.id, content: "Application/JSON" },
      });
      const room = response.data;
      updateRoom(room);
      router.navigate(
        `/chatting/room/${userId}${room ? `?roomId=${room?.id}` : ""}`
      );
    } catch (error: any) {
      if (typeof error?.message === "string") {
        Toast.error("Error: " + error?.message, "top");
      }
      console.error(JSON.stringify(error, null, 2));
    }
  };

  const handleLogout = () => {
    clearUser();
    closeWebSocket();
    router.navigate("/");
  };

  return (
    <Container>
      <Stack.Screen
        options={{
          headerTitle: () =>
            status === "offline" ? (
              <ConnectionLostHeader />
            ) : (
              <Text variant="titleLarge" style={{ fontWeight: 600 }}>
                TrashTalk
              </Text>
            ),
          headerRight: () => (
            <Appbar.Action
              icon="logout"
              color={appTheme.colors.red}
              onPress={handleLogout}
            />
          ),
        }}
      />
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>No users found to chat</Text>
          </View>
        }
        renderItem={({ item }) => (
          <ChatListItem
            key={item.id}
            isOnline={!!item?.online}
            title={item.name}
            onPress={() => handleChat({ userId: item.id })}
          />
        )}
        ItemSeparatorComponent={() => <Separator />}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  messagesList: {
    flex: 1,
    paddingHorizontal: 12,
  },
  emptyContainer: {
    flex: 1,
    marginTop: 120,
    justifyContent: "center",
    alignItems: "center",
  },
});
