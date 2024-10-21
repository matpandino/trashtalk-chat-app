import React from "react";
import { View } from "react-native";
import { Message, User } from "../utils/stores/chatting-store";
import { DoubleTouchableOpacity } from "./DoubleTouchOpacity";
import { useAppTheme } from "../utils/theme";
import { Icon, Text } from "react-native-paper";
import { darken } from "polished";

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

  return (
    <DoubleTouchableOpacity
      onDoublePress={() => handleMessageLikeToggle(item.id)}
      key={item.id + item?.likes?.length || 0}
    >
      <View
        style={{
          padding: 8,
          paddingHorizontal: 16,
          borderRadius: 16,
          marginLeft: isSentByCurrentUser ? 60 : 0,
          marginRight: isSentByCurrentUser ? 0 : 60,
          borderBottomRightRadius: isSentByCurrentUser ? 0 : 16,
          borderBottomLeftRadius: isSentByCurrentUser ? 16 : 0,
          marginBottom: spacePrevMessage ? 8 : 0,
          backgroundColor: isSentByCurrentUser
            ? appTheme.colors.primary
            : appTheme.colors.primaryBg,
        }}
      >
        <Text>{item.data}</Text>
      </View>
      {item.likes?.map((like, index) => (
        <View
          key={like.id}
          style={[
            { position: "absolute", top: 8 },
            isSentByCurrentUser
              ? { left: 50 - index * 12 }
              : { right: 50 - index * 12 },
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
