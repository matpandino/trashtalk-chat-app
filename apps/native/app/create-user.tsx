import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query"; // Updated import
import { useRouter } from "expo-router";
import { useUserStore } from "../utils/providers/user-store-provider";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
});

type FormData = z.infer<typeof schema>;

export default function Page() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const userStore = useUserStore(state => state);
  const router = useRouter()

  const mutation = useMutation({
    mutationFn: (data: FormData) => {
      console.log(data);
      return Promise.resolve(data);
    },
    onSuccess: (data) => {
      userStore.setUser({ id: "1", name: data.name });
      console.log("success");
      router.push("/chatting/");
    },
    onError: (error) => {
      console.log("error");
      console.error(error);
    },
  });

  const onSubmit: SubmitHandler<FormData> = (data) => {
    mutation.mutate(data);
  };

  return (
    <View style={styles.container}>
      <View style={styles.main}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder="Enter your name"
            />
          )}
        />
        {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}

        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.buttonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
  },
  main: {
    flex: 1,
    justifyContent: "center",
    maxWidth: 960,
    marginHorizontal: "auto",
  },
  title: {
    fontSize: 64,
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
  button: {
    backgroundColor: "#007BFF",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
    marginTop: 20,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  error: {
    color: "red",
    marginVertical: 5,
  },
});
