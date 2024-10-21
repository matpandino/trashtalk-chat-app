import React from "react";
import { View, StyleSheet } from "react-native";
import { Avatar as PaperAvatar, Portal, useTheme } from "react-native-paper";
import { useAppTheme } from "../utils/theme";

interface AvatarProps extends React.ComponentProps<typeof PaperAvatar.Text> {
  isOnline: boolean;
}

const Avatar: React.FC<AvatarProps> = ({ isOnline, ...props }) => {
  const theme = useAppTheme();
  return (
    <View style={styles.container}>
      <PaperAvatar.Text {...props} />
      <View
        style={[
          styles.statusIndicator,
          { backgroundColor: isOnline ? theme.colors.green : theme.colors.red },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  statusIndicator: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 14,
    height: 14,
    borderRadius: 6,
    borderWidth: 1.5,
  },
});

export default Avatar;
