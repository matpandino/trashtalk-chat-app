import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "react-native-paper";
import Avatar from "./Avatar";
import { useAppTheme } from "../utils/theme";

interface ChatListItemProps {
  title: string;
  isOnline: boolean;
  onPress?: () => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
  onPress,
  title,
  isOnline,
}) => {
  const appTheme = useAppTheme();
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.container}>
        <Avatar size={44} label={title.charAt(0) || ""} isOnline={isOnline} />
        <View style={styles.content}>
          <Text variant="bodyLarge">{title}</Text>
          <Text variant="bodySmall">{isOnline ? "Online" : "Offline"}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
  },
  content: {},
});
