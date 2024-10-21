import {
  GestureResponderEvent,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";

const DEFAULT_DOUBLE_PRESS_DELAY = 250;

type Props = {
  onDoublePress?: (event: GestureResponderEvent) => void;
  doublePressDelay?: number;
} & TouchableOpacityProps;

export const DoubleTouchableOpacity: React.FC<Props> = ({
  children,
  onPress,
  onDoublePress,
  doublePressDelay = DEFAULT_DOUBLE_PRESS_DELAY,
}) => {
  const [clickCount, setClickCount] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handlePress = (event: GestureResponderEvent) => {
    setClickCount((prev) => prev + 1);

    if (clickCount === 1) {
      if (timeoutRef.current != null) clearTimeout(timeoutRef.current);
      onDoublePress?.(event);
      setClickCount(0);
    } else {
      timeoutRef.current = setTimeout(() => {
        if (onPress) onPress(event);
        setClickCount(0);
      }, doublePressDelay);
    }
  };

  return (
    <TouchableOpacity activeOpacity={1} onPress={handlePress}>
      {children}
    </TouchableOpacity>
  );
};
