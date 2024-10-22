import { useChattingStore } from "@/providers/chatting-store-provider";
import { useUserStore } from "@/providers/user-store-provider";
import { useAppTheme } from "@/utils/theme";
import { StyleSheet, View } from "react-native";
import { IconButton, Text } from "react-native-paper";

export const ConnectionLostHeader = () => {
  const appTheme = useAppTheme();
  const { user } = useUserStore((state) => state);
  const { initializeSocket } = useChattingStore((state) => state);

  const handleRetryConnection = () => {
    if (user?.id) {
      initializeSocket(user?.id);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={{ color: appTheme.colors.red }} variant="titleMedium">
        Connection Lost
      </Text>
      <IconButton
        iconColor={appTheme.colors.red}
        size={24}
        icon="refresh"
        onPress={handleRetryConnection}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    flexDirection: "row",
    alignItems: "center",
  },
});
