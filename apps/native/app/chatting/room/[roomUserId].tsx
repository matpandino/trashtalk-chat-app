import { StyleSheet, View } from "react-native";
import React, { useMemo } from "react";
import { Stack, useLocalSearchParams } from "expo-router";
import { useChattingStore } from "@/utils/providers/chatting-store-provider";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserStore } from "@/utils/providers/user-store-provider";
import { FlatList } from "react-native";
import { UserAvatarStatus } from "@/components/UserAvatarStatus";
import { Container } from "@/components/Container";
import { ChatTextInput } from "@/components/ChatTextInput";
import { ChatMessage } from "@/components/ChatMessage";

const schema = z.object({
  message: z.object({
    text: z.string().min(1, "Message is required"),
    image: z.any().optional(),
  }),
});

type FormData = z.infer<typeof schema>;

export default function Page() {
  const { roomUserId, roomId } = useLocalSearchParams();
  const { rooms, users, sendMessage, likeToggle } = useChattingStore(
    (state) => state
  );
  const { user: currentUser } = useUserStore((state) => state);

  const roomUser = users.find((u) => u.id === roomUserId);
  const roomData = rooms.find((r) => r.id === roomId);

  const messages = useMemo(() => {
    const reversedMessages = [...(roomData?.messages || [])].reverse();
    return reversedMessages;
  }, [roomData?.messages]);

  const { control, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: { message: { text: string; image?: string } }) => {
    sendMessage({
      roomId: roomId as string,
      message: data.message.text,
      image: data.message?.image,
    });
    reset({
      message: {
        text: "",
        image: undefined,
      },
    });
  };

  const handleMessageLikeToggle = (messageId: string) => {
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
      <FlatList
        inverted
        style={styles.messagesList}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ChatMessage
            currentUser={currentUser}
            item={item}
            index={index}
            prevMessage={messages?.[index - 1]}
            handleMessageLikeToggle={handleMessageLikeToggle}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <View>
        <Controller
          control={control}
          name="message"
          render={({ field: { onChange, value } }) => (
            <ChatTextInput
              canSubmit={!!value?.text || !!value?.image}
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
