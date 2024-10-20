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
    <Avatar size={30} label={title.charAt(0) || ""} isOnline={isOnline} />
    <View>
      <Text variant="titleSmall">{title}</Text>
      <Text variant="bodySmall">{isOnline ? "Online" : "Offline"}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
