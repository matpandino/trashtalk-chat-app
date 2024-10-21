import React from "react";
import { StyleSheet, View } from "react-native";
import { FlatList } from "react-native";
import { useRouter, Stack } from "expo-router";
import { useChattingStore } from "../../utils/providers/chatting-store-provider";
import { Container } from "../../components/Container";
import { ChatListItem } from "../../components/ChatListItem";
import { Appbar } from "react-native-paper";
import { useUserStore } from "../../utils/providers/user-store-provider";
import { Separator } from "../../components/Separator";

export default function Page() {
  const { clearUser } = useUserStore((state) => state);
  const { users } = useChattingStore((state) => state);
  const router = useRouter();

  const handleChat = (userId: string) => {
    router.navigate(`/chatting/room/${userId}`);
  };

  const handleLogout = () => {
    clearUser();
    router.navigate("/");
  };

  return (
    <Container>
      <Stack.Screen
        options={{
          title: "TrashTalk",
          headerRight: () => (
            <Appbar.Action icon="logout" onPress={handleLogout} />
          ),
        }}
      />
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        renderItem={({ item }) => (
          <ChatListItem
            isOnline={!!item?.online}
            title={item.name}
            onPress={() => handleChat(item.id)}
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
});
