import React from "react";
import { StyleSheet, View } from "react-native";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Redirect, useRouter } from "expo-router";
import { useUserStore } from "@/providers/user-store-provider";
import apiClient from "@/utils/axios";
import { Container } from "@/components/Container";
import { TextInput } from "@/components/TextInput";
import { Button, Text } from "react-native-paper";
import { useAppTheme } from "@/utils/theme";
import { transparentize } from "polished";
import axios from "axios";

const schema = z.object({
  name: z
    .string({ required_error: "Name cannot be empty" })
    .min(1, "Name is required")
    .refine((value) => value.trim() !== "", {
      message: "Name cannot be empty",
    }),
});

type FormData = z.infer<typeof schema>;

type CreateUserResponse = {
  id: string;
  name: string;
};

export default function Page() {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, disabled },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const userStore = useUserStore((state) => state);
  const router = useRouter();
  const appTheme = useAppTheme();

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      try {
        const res = await apiClient.post<CreateUserResponse>("/users", data);
        return res;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          throw new Error(error.response?.data?.error || "Try Again Later");
        } else {
          throw new Error("An unexpected error occurred");
        }
      }
    },
    onSuccess: ({ data }) => {
      userStore.setUser({ id: data.id, name: data.name });
      router.push("/chatting/");
    },
    onError: (error) => {
      setError("root", { message: "Failed to create user. " + error.message });
    },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    mutation.mutate(data);
  };

  if (userStore.user) {
    return <Redirect href={"/chatting/"} />;
  }

  const buttonColor = transparentize(
    !errors?.name ? 0.7 : 0.9,
    appTheme.colors.primary
  );

  return (
    <Container style={styles.container}>
      <View style={styles.titleContainer}>
        <Text variant="displaySmall" style={styles.title}>
          TrashTalk
        </Text>
      </View>
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            placeholder="Enter your name"
            returnKeyType="send"
            onSubmitEditing={handleSubmit(onSubmit)}
          />
        )}
      />
      <View style={styles.bottomContainer}>
        <Text style={styles.error} variant="bodyMedium">
          {errors?.name?.message || errors?.root?.message}
        </Text>
        <Button
          mode="contained"
          dark
          uppercase
          disabled={!!errors?.name}
          theme={{ roundness: 1 }}
          contentStyle={styles.buttonContent}
          style={[
            styles.button,
            {
              borderColor: buttonColor,
              backgroundColor: buttonColor,
            },
          ]}
          onPress={handleSubmit(onSubmit)}
        >
          <Text variant="bodyLarge" style={styles.buttonText}>
            Continue
          </Text>
        </Button>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
  },
  errorText: {
    color: "red",
  },
  bottomContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  button: {
    width: "100%",
  },
  buttonContent: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: 55,
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
  },
  titleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 36,
    color: "#38434D",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    padding: 10,
    marginVertical: 10,
    width: "100%",
  },

  error: {
    color: "red",
    marginVertical: 5,
  },
});
