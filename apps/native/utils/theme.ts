import { darken } from "polished";
import { MD3DarkTheme, useTheme } from "react-native-paper";
import { white } from "react-native-paper/lib/typescript/styles/themes/v2/colors";
import { MD3Colors } from "react-native-paper/lib/typescript/types";

export const useAppTheme = () => useTheme<AppTheme>();


const defaultColors: MD3Colors = {
    ...MD3DarkTheme.colors,
    primary: "#2139ed",
    secondary: "#2c3869",
    background: "#080b17",
};

const customColors = {
    white: "#ffff",
    red: "#f25757",
    strongGreen: '#3f7a35',
    green: "#85f781",
    secondaryBg: darken(0.3, defaultColors.secondary),
    primaryBg: darken(0.3, defaultColors.primary),
}

export const appTheme = {
    ...MD3DarkTheme,
    colors: {
        ...defaultColors,
        ...customColors,
    },
};

export type AppTheme = typeof appTheme;
