import { DefaultTheme, useTheme } from "react-native-paper";
import { ThemeProp } from "react-native-paper/lib/typescript/types";

export type AppTheme = {
    colors: {
        red: string;
        sentMessageBackground: string;
        receivedMessageBackground: string;
    };
} & ThemeProp;

export const useAppTheme = () => useTheme<AppTheme>();

export const appTheme: AppTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        red: "#ff3f3f",
        sentMessageBackground: "#dbcbff",
        receivedMessageBackground: "#e6e6e6",
    },
};