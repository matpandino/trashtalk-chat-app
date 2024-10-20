import React from "react";
import { Text, View } from "react-native";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { useChattingStore } from "../../utils/providers/chatting-store-provider";

export default function Page() {
  const { users } = useChattingStore((state) => state);

  const router = useRouter();
  const handleChat = (userId: string) => {
    router.push("/chatting/room/" + userId as any);
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "red",
      }}
    >
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity key={item.id} onPress={() => handleChat(item.id)}>
            <Text>{item.name}</Text>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListHeaderComponent={() => <Text>Users</Text>}
      />
    </View>
  );
}
