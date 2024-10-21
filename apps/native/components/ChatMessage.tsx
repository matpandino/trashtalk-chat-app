import React from "react";
import { View, StyleSheet } from "react-native";
import { Message, User } from "../utils/stores/chatting-store";
import { DoubleTouchableOpacity } from "./DoubleTouchOpacity";
import { useAppTheme } from "../utils/theme";
import { Icon, Text } from "react-native-paper";
import { darken } from "polished";
import { Image } from "expo-image";

const blurhash =
  "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[";

interface ChatMessageProps {
  item: Message;
  index: number;
  prevMessage?: Message;
  currentUser: User | null;
  handleMessageLikeToggle: (messageId: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  item,
  prevMessage,
  currentUser,
  handleMessageLikeToggle,
}) => {
  const isSentByCurrentUser = item.sentById === currentUser?.id;
  const spacePrevMessage =
    prevMessage && prevMessage?.sentById !== item?.sentById;

  const appTheme = useAppTheme();

  const messageMarginSpace = 60;

  return (
    <DoubleTouchableOpacity
      onDoublePress={() => handleMessageLikeToggle(item.id)}
      key={item.id + item?.likes?.length || 0}
    >
      <View
        style={[
          styles.messageContainer,
          {
            marginLeft: isSentByCurrentUser ? messageMarginSpace : 0,
            marginRight: isSentByCurrentUser ? 0 : messageMarginSpace,
            borderBottomRightRadius: isSentByCurrentUser ? 0 : 16,
            borderBottomLeftRadius: isSentByCurrentUser ? 16 : 0,
            marginBottom: spacePrevMessage ? 8 : 0,
            backgroundColor: isSentByCurrentUser
              ? appTheme.colors.primary
              : appTheme.colors.primaryBg,
          },
        ]}
      >
        {item.attachment && (
          <Image
            style={styles.image}
            source={item.attachment}
            placeholder={{ blurhash }}
            contentFit="scale-down"
            transition={1000}
          />
        )}

        <Text>{item.data}</Text>
      </View>
      {item.likes?.map((like, index) => (
        <View
          key={like.id}
          style={[
            styles.likeIconContainer,
            isSentByCurrentUser
              ? { left: messageMarginSpace - 10 - index * 12 }
              : { right: messageMarginSpace - 10 - index * 12 },
          ]}
        >
          <Icon
            size={20}
            source="heart"
            color={darken(
              like.userId === currentUser?.id ? 0 : 0.2,
              appTheme.colors.red
            )}
          />
        </View>
      ))}
    </DoubleTouchableOpacity>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    padding: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  likeIconContainer: {
    position: "absolute",
    bottom: 8,
  },
  image: {
    flex: 1,
    minHeight: 200,
    marginVertical: 6,
    width: "100%",
  },
});
