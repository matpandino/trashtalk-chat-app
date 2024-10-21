import React from "react";
import { TextInput as PaperTextInput } from "react-native-paper";
import { useAppTheme } from "../utils/theme";

interface CustomTextInputProps extends React.ComponentProps<typeof PaperTextInput> {}

export const TextInput: React.FC<CustomTextInputProps> = ({ style, ...props }) => {
  const appTheme = useAppTheme();
  return (
    <PaperTextInput
      {...props}
      style={[{
        flex: 1,
        backgroundColor: appTheme.colors.background,
        borderWidth: 0,
      },
      ...(Array.isArray(style) ? style : [style]),
    ]}
    />
  );
};
