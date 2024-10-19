import React from "react";
import { Text, View } from "react-native";
import { useUserStore } from "../../utils/providers/user-store-provider";
import { TouchableOpacity } from "react-native-gesture-handler";
import { router, useNavigation, useRouter } from "expo-router";

export default function Page() {
  const { user } = useUserStore((state) => state);
  const router = useRouter();
  const handleChat = () => {
    router.push("/chatting/chat-screen");
  };

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "red",
      }}
    >
      <Text>User: {user?.name}</Text>
      <TouchableOpacity onPress={handleChat}>
        <Text>Go to chat</Text>
      </TouchableOpacity>
    </View>
  );
}
