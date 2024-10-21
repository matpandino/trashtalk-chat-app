import React from "react";
import { useAppTheme } from "../utils/theme";
import { TouchableOpacity, View } from "react-native";
import { TextInput } from "./TextInput";
import { Icon } from "react-native-paper";

interface ChatTextInputProps extends React.ComponentProps<typeof TextInput> {
  handleSubmit: () => void;
  onChange: (...event: any[]) => void;
}

export const ChatTextInput: React.FC<ChatTextInputProps> = ({
  handleSubmit,
  onChange,
  value,
  ...props
}) => {
  const appTheme = useAppTheme();
  return (
    <View
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
      }}
    >
      <TextInput
        mode="outlined"
        placeholder="Type a message"
        onChangeText={onChange}
        value={value}
        returnKeyType="send"
        onSubmitEditing={handleSubmit}
        // TextInput 'right' is not displaying component - added as position absolute
        right={<></>}
        style={{
          flex: 1,
        }}
      />
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={!value}
        style={{
          position: "absolute",
          right: 18,
        }}
      >
        <Icon source="send" color={value ? "white" : "rgba(255, 255, 255, 0.3)"} size={28} />
      </TouchableOpacity>
    </View>
  );
};
