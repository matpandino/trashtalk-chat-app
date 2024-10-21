import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import Avatar from "./Avatar";

interface ChatHeaderTitleProps {
  title: string;
  isOnline: boolean;
  centralize?: boolean;
  avatarSize?: number;
}

export const UserAvatarStatus: React.FC<ChatHeaderTitleProps> = ({
  title,
  isOnline,
  centralize,
  avatarSize = 36,
}) => (
  <View style={[styles.container, centralize && styles.centralized]}>
    <Avatar size={avatarSize} label={title.charAt(0) || ""} isOnline={isOnline} />
    <View style={styles.content}>
      <Text variant="titleMedium">{title}</Text>
      <Text variant="bodySmall">{isOnline ? "Online" : "Offline"}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  centralized: {
    justifyContent: "center",
  },
  content: {
    gap: 2,
  },
});
