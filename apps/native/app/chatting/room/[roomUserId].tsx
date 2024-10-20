import { View, Text, TextInput, TouchableOpacity } from "react-native";
import React, { useEffect } from "react";
import { Redirect, useLocalSearchParams } from "expo-router";
import { useChattingStore } from "../../../utils/providers/chatting-store-provider";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserStore } from "../../../utils/providers/user-store-provider";

const schema = z.object({
  message: z.string().min(1, "Message is required"),
});

type FormData = z.infer<typeof schema>;

export default function Page() {
  const { roomUserId } = useLocalSearchParams();
  const { rooms, sendMessage, syncRoomInfo } = useChattingStore(
    (state) => state
  );
  const { user: currentUser } = useUserStore((state) => state);

  const roomData = rooms.find((room) => {
    const roomUserIds = room.users.map((u) => u.id);
    if (!currentUser?.id) return false;
    return (
      roomUserIds.includes(currentUser?.id) &&
      roomUserIds.includes(roomUserId as string)
    );
  });

  useEffect(() => {
    if (!currentUser?.id) return;
    syncRoomInfo({ roomId: roomUserId as string, userId: currentUser?.id });
  }, [roomUserId, currentUser?.id]);

  const { control, handleSubmit, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = (data: { message: string }) => {
    sendMessage({ userId: roomUserId as string, message: data.message });
    reset();
  };

  return (
    <View>
      <Text>Page {JSON.stringify(roomUserId)}</Text>
      {roomData?.messages.map((message) => (
        <Text key={message.id}>{message.data}</Text>
      ))}

      <View>
        <Controller
          control={control}
          name="message"
          render={({ field: { onChange, value } }) => (
            <View style={{ flexDirection: "row" }}>
              <TextInput
                placeholder="Type a message"
                onChangeText={onChange}
                value={value}
                returnKeyType="send"
                style={{
                  flex: 1,
                  height: 40,
                  borderColor: "gray",
                  borderWidth: 1,
                }}
                onSubmitEditing={handleSubmit(onSubmit)}
              />
              <TouchableOpacity onPress={handleSubmit(onSubmit)}>
                <Text>Send</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    </View>
  );
}
