import { MD3DarkTheme, useTheme } from "react-native-paper";
import { MD3Colors } from "react-native-paper/lib/typescript/types";

export const useAppTheme = () => useTheme<AppTheme>();

const customColors = {
    red: "#f25757",
    green: "#85f781",
    sentMessageBackground: "#dbcbff",
    receivedMessageBackground: "#e6e6e6",
    primaryLight: "#6b7496",
}

const defaultColors: MD3Colors = {
    ...MD3DarkTheme.colors,
    primary: "#2c3869",
    background: "#080b17",
    backdrop: "#323f73",
};

export const appTheme = {
    ...MD3DarkTheme,
    colors: {
        ...defaultColors,
        ...customColors,
    },
};

export type AppTheme = typeof appTheme;
