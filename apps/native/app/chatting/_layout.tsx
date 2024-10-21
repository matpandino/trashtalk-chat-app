import { Stack } from "expo-router";
import Header from "../../components/Header";
import { StatusBar } from "expo-status-bar";

export default function Layout() {
  return (
    <>
      <Stack
        screenOptions={{
          headerBackTitle: "Back",
          header: (props) => <Header {...props} />,
        }}
      />
      <StatusBar style="light" />
    </>
  );
}
