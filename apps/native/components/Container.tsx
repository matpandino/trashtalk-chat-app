import React from "react";
import {
  SafeAreaView,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAppTheme } from "@/utils/theme";
import { HeaderHeightContext } from "@react-navigation/elements";

interface ContainerProps extends React.ComponentProps<typeof View> {}

export const Container: React.FC<ContainerProps> = (props) => {
  const appTheme = useAppTheme();
  const headerHeight = React.useContext(HeaderHeightContext) ?? 0;
  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: appTheme.colors.background }]}
    >
      <KeyboardAvoidingView
        {...props}
        style={[
          styles.container,
          Array.isArray(props.style) ? props.style : [props.style],
        ]}
        keyboardVerticalOffset={headerHeight}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {props.children}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  keyboardAreaView: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingVertical: 6,
  },
});
