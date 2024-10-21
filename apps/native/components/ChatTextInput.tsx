import React from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import { TextInput } from "./TextInput";
import { Icon } from "react-native-paper";
import { transparentize } from "polished";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";

interface ChatTextInputProps extends React.ComponentProps<typeof TextInput> {
  handleSubmit: () => void;
  canSubmit: boolean;
  value?: {
    text: string;
    image?: string;
  };
  onChange: (...event: any[]) => void;
}

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

export const ChatTextInput: React.FC<ChatTextInputProps> = ({
  handleSubmit,
  onChange,
  canSubmit = false,
  value,
}) => {
  const pickImage = async ({ source }: { source: "camera" | "library" }) => {
    if (source === "camera") {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert("Permission to access camera was denied");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled) {
        onChange({ ...value, image: result.assets[0].uri });
      }
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
      if (!result.canceled) {
        onChange({ ...value, image: result.assets[0].uri });
      }
    }
  };

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
        onChangeText={(newText) => onChange({ ...value, text: newText })}
        value={value?.text}
        returnKeyType="send"
        onSubmitEditing={handleSubmit}
        // TextInput 'right' is not displaying component - added as position absolute
        right={<></>}
        contentStyle={{
          marginRight: 90,
          marginLeft: 36,
        }}
        style={{
          flex: 1,
        }}
      />
      <TouchableOpacity
        onPress={() => pickImage({ source: "camera" })}
        style={{
          position: "absolute",
          left: 14,
        }}
      >
        {value?.image ? (
          <Image
            style={[styles.image, { height: 32, width: 32 }]}
            source={value?.image}
            contentFit="scale-down"
            transition={1000}
          />
        ) : (
          <Icon source={"camera"} color="white" size={26} />
        )}
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => pickImage({ source: "library" })}
        style={{
          position: "absolute",
          right: 54,
        }}
      >
        <Icon source={"upload"} color="white" size={26} />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={!canSubmit}
        style={{
          position: "absolute",
          right: 16,
        }}
      >
        <Icon
          source="send"
          color={canSubmit ? "white" : transparentize(0.7, "white")}
          size={26}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    flex: 1,
    marginVertical: 6,
    width: "100%",
  },
});
