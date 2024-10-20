import React from "react";
import { SafeAreaView, View, StyleSheet } from "react-native";
import { useAppTheme } from "../utils/theme";

interface ContainerProps extends React.ComponentProps<typeof View> {}

export const Container: React.FC<ContainerProps> = (props) => {
  const appTheme = useAppTheme();
  
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: appTheme.colors.onSurfaceDisabled }]}>
      <View
        style={styles.container}
        {...props}
      >
        {props.children}
      </View>
    </SafeAreaView>
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
