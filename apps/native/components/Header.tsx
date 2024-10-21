import { NativeStackHeaderProps } from "@react-navigation/native-stack";
import React from "react";
import { Appbar, Text } from "react-native-paper";
import { useAppTheme } from "@/utils/theme";

interface HeaderProps extends NativeStackHeaderProps {}

const Header: React.FC<HeaderProps> = ({ navigation, options, back }) => {
  const appTheme = useAppTheme();
  return (
    <Appbar.Header style={{ backgroundColor: appTheme.colors.background }}>
      {options?.headerLeft
        ? options.headerLeft({ canGoBack: navigation.canGoBack() })
        : null}
      {back && !options?.headerLeft ? (
        <Appbar.BackAction onPress={() => navigation.goBack()} />
      ) : null}
      <Appbar.Content
        title={
          typeof options?.headerTitle === "function" ? (
            options?.headerTitle({
              children: options?.title || "",
            })
          ) : (
            <Text variant="titleLarge" style={{ fontWeight: "bold" }}>
              {options?.title}
            </Text>
          )
        }
      />
      {options?.headerRight
        ? options.headerRight({ canGoBack: navigation.canGoBack() })
        : null}
    </Appbar.Header>
  );
};

export default Header;
