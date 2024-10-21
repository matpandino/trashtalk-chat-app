import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import Avatar from "./Avatar";

interface ChatHeaderTitleProps {
  title: string;
  isOnline: boolean;
}

export const ChatHeaderTitle: React.FC<ChatHeaderTitleProps> = ({
  title,
  isOnline,
}) => (
  <View style={styles.container}>
    <Avatar size={36} label={title.charAt(0) || ""} isOnline={isOnline} />
    <View style={styles.content}>
      <Text variant="titleMedium">{title}</Text>
      <Text variant="bodySmall">{isOnline ? "Online" : "Offline"}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  content: {
    gap: 2,
  },
});
