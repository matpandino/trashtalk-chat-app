import { StyleSheet, TouchableOpacity, View } from "react-native";
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
import {
  GestureHandlerRootView,
  TapGestureHandler,
} from "react-native-gesture-handler";
import { DoubleTouchableOpacity } from "../../../components/DoubleTouchOpacity";

const schema = z.object({
  message: z.string().min(1, "Message is required"),
});

type FormData = z.infer<typeof schema>;

export default function Page() {
  const { roomUserId, roomId } = useLocalSearchParams();
  const { rooms, users, sendMessage, likeToggle } = useChattingStore(
    (state) => state
  );
  const { user: currentUser } = useUserStore((state) => state);

  const appTheme = useAppTheme();

  const roomUser = users.find((u) => u.id === roomUserId);
  const roomData = rooms.find((r) => r.id === roomId);

  const messages = useMemo(() => {
    const reversedMessages = [...(roomData?.messages || [])].reverse();
    return reversedMessages;
  }, [roomData?.messages]);

  const { control, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: { message: string }) => {
    sendMessage({ roomId: roomId as string, message: data.message });
    reset({
      message: "",
    });
  };

  const handleMessageLikeToggle = (messageId: string) => {
    console.log("like toggle")
    likeToggle({ messageId });
  };

  return (
    <Container>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <UserAvatarStatus
              centralize
              isOnline={!!roomUser?.online}
              title={roomUser?.name || ""}
            />
          ),
        }}
      />
      <GestureHandlerRootView>
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
              <DoubleTouchableOpacity
                onDoublePress={() => handleMessageLikeToggle(item.id)}
                key={item.id}
              >
                <Chip
                  style={{
                    borderRadius: 16,
                    marginLeft: isSentByCurrentUser ? 60 : 0,
                    marginRight: isSentByCurrentUser ? 0 : 60,
                    borderBottomRightRadius: isSentByCurrentUser ? 0 : 16,
                    borderBottomLeftRadius: isSentByCurrentUser ? 16 : 0,
                    marginBottom: spacePrevMessage ? 8 : 0,
                    backgroundColor: isSentByCurrentUser
                      ? appTheme.colors.primary
                      : appTheme.colors.primaryBg,
                  }}
                >
                  <Text>{item.data}</Text>
                </Chip>
              </DoubleTouchableOpacity>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </GestureHandlerRootView>

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
    paddingVertical: 6,
  },
});
