import React from "react";
import { View } from "react-native";
import { FlatList, TouchableOpacity } from "react-native-gesture-handler";
import { useRouter } from "expo-router";
import { Card, Text } from "react-native-paper";
import { useChattingStore } from "../../utils/providers/chatting-store-provider";
import Avatar from "../../components/Avatar";

export default function Page() {
  const { users } = useChattingStore((state) => state);

  const router = useRouter();
  const handleChat = (userId: string) => {
    router.push(("/chatting/room/" + userId) as any);
  };

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity key={item.id} onPress={() => handleChat(item.id)}>
            <Card>
              <Card.Title
                title={item.name}
                left={(props) => <Avatar {...props} label={item.name.charAt(0)} isOnline={!!item?.online} />}
                subtitle={item.online ? "Online" : "Offline"}
              />
            </Card>
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
      />
    </View>
  );
}
