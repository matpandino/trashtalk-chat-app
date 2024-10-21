import { StyleSheet, View } from "react-native";
import { useAppTheme } from "@/utils/theme";

export const Separator = () => {
  const appTheme = useAppTheme();
  return <View style={styles.separator} />;
};

const styles = StyleSheet.create({
  separator: {
    height: 6,
  },
});
