import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useAppTheme } from "../utils/theme";
import { UserAvatarStatus } from "./UserAvatarStatus";

interface ChatListItemProps extends React.ComponentProps<typeof View> {
  title: string;
  isOnline: boolean;
  onPress?: () => void;
  centralize?: boolean;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
  onPress,
  title,
  isOnline,
  ...props
}) => {
  const appTheme = useAppTheme();
  return (
    <TouchableOpacity onPress={() => onPress?.()}>
      <View
        {...props}
        style={[
          styles.container,
          { backgroundColor: appTheme.colors.background },
          Array.isArray(props.style) ? props.style : [props.style],
        ]}
      >
        <UserAvatarStatus avatarSize={48} isOnline={isOnline} title={title} />
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
});
