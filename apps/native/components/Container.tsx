import React from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  KeyboardAvoidingView,
} from "react-native";
import { useAppTheme } from "../utils/theme";
import { useHeaderHeight } from "@react-navigation/elements";

interface ContainerProps extends React.ComponentProps<typeof View> {}

export const Container: React.FC<ContainerProps> = (props) => {
  const appTheme = useAppTheme();
  const height = useHeaderHeight()
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} keyboardVerticalOffset={height} behavior="padding">
      <SafeAreaView
        style={[
          styles.safeArea,
          { backgroundColor: appTheme.colors.background },
        ]}
      >
        <View style={styles.container} {...props}>
          {props.children}
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingVertical: 6,
  },
});
