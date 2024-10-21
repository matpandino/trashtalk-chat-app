import React from "react";
import { TextInput as PaperTextInput } from "react-native-paper";
import { useAppTheme } from "../utils/theme";

interface CustomTextInputProps
  extends React.ComponentProps<typeof PaperTextInput> {}

export const TextInput: React.FC<CustomTextInputProps> = ({
  style,
  ...props
}) => {
  const appTheme = useAppTheme();
  return (
    <PaperTextInput
      mode="outlined"
      outlineColor={appTheme.colors.primary}
      activeOutlineColor={appTheme.colors.primaryLight}
      {...props}
      style={[
        {
          backgroundColor: appTheme.colors.primary,
          borderWidth: 2,
        },
        ...(Array.isArray(style) ? style : [style]),
      ]}
    />
  );
};
