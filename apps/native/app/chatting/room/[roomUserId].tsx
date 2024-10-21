import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import React, { useEffect, useMemo } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { useChattingStore } from "../../../utils/providers/chatting-store-provider";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserStore } from "../../../utils/providers/user-store-provider";
import { Chip, Text } from "react-native-paper";
import { FlatList } from "react-native";
import { UserAvatarStatus } from "../../../components/UserAvatarStatus";
import { useAppTheme } from "../../../utils/theme";
import { Container } from "../../../components/Container";
import { ChatTextInput } from "../../../components/ChatTextInput";

const schema = z.object({
  message: z.string().min(1, "Message is required"),
});

type FormData = z.infer<typeof schema>;

export default function Page() {
  const { roomUserId } = useLocalSearchParams();
  const { rooms, users, sendMessage, syncRoomInfo } = useChattingStore(
    (state) => state
  );
  const { user: currentUser } = useUserStore((state) => state);

  const appTheme = useAppTheme();

  const roomData = rooms.find((room) => {
    const roomUserIds = room.users.map((u) => u.id);
    if (!currentUser?.id) return false;
    return (
      roomUserIds.includes(currentUser?.id) &&
      roomUserIds.includes(roomUserId as string)
    );
  });

  const conversationUserId = roomData?.users
    .map((u) => u.id)
    .find((u) => u !== currentUser?.id);
  const chattingUser = users.find((u) => u.id === conversationUserId);

  const messages = useMemo(() => {
    const reversedMessages = [...(roomData?.messages || [])].reverse();
    return reversedMessages;
  }, [roomData?.messages]);

  useEffect(() => {
    if (!currentUser?.id) return;
    syncRoomInfo({ roomId: roomUserId as string, userId: currentUser?.id });
  }, [roomUserId, currentUser?.id]);

  const { control, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: { message: string }) => {
    // sendMessage({ userId: roomUserId as string, message: data.message });
    reset({
      message: "",
    });
  };

  return (
    <Container>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <UserAvatarStatus
              centralize
              isOnline={!!chattingUser?.online}
              title={chattingUser?.name || ""}
            />
          ),
        }}
      />

      <FlatList
        inverted
        style={styles.messagesList}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          const isSentByCurrentUser = item.sentById === currentUser?.id;
          const spacePrevMessage =
            messages?.[index - 1] &&
            messages?.[index - 1]?.sentById !== item?.sentById;

          return (
            <Chip
              key={item.id}
              style={{
                borderRadius: 16,
                borderBottomRightRadius: isSentByCurrentUser ? 0 : 16,
                borderBottomLeftRadius: isSentByCurrentUser ? 16 : 0,
                marginBottom: spacePrevMessage ? 8 : 0,
                backgroundColor: isSentByCurrentUser
                  ? appTheme.colors.sentMessageBackground
                  : appTheme.colors.receivedMessageBackground,
              }}
            >
              <Text>{item.data}</Text>
            </Chip>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <View>
        <Controller
          control={control}
          name="message"
          render={({ field: { onChange, value } }) => (
            <ChatTextInput
              onChange={onChange}
              value={value}
              handleSubmit={handleSubmit(onSubmit)}
            />
          )}
        />
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  separator: {
    height: 4,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 10,
  },
});
