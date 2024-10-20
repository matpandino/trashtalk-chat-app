import { Stack } from "expo-router";
import { Text } from "react-native-paper";
import { useAppTheme } from "../../utils/theme";

export default function Layout() {
  const appTheme = useAppTheme();
  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: {backgroundColor: appTheme.colors.surfaceVariant},
        headerTitle: ({children}) => <Text variant="titleMedium">{children}</Text>,
      }}
    />
  );
}