import React, { useState } from "react";
import { TouchableOpacity, StyleSheet, View, Alert } from "react-native";
import { Text } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios"; // For API calls
import { auth } from "../../firebaseConfig";
import { createUserWithEmailAndPassword, getIdToken } from "firebase/auth"; // Firebase methods
import Background from "../components/Background";
import Logo from "../components/Logo";
import Header from "../components/Header";
import Button from "../components/Button";
import TextInput from "../components/TextInput";
import BackButton from "../components/BackButton";
import { theme } from "../core/theme";
import { emailValidator } from "../helpers/emailValidator";
import { passwordValidator } from "../helpers/passwordValidator";
import { nameValidator } from "../helpers/nameValidator";

// Get your root URL from environment variables
const ROOT_URL = process.env.REACT_APP_API_URL;

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState({ value: "", error: "" });
  const [email, setEmail] = useState({ value: "", error: "" });
  const [password, setPassword] = useState({ value: "", error: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onSignUpPressed = async () => {
    const nameError = nameValidator(name.value);
    const emailError = emailValidator(email.value);
    const passwordError = passwordValidator(password.value);

    if (emailError || passwordError || nameError) {
      setName({ ...name, error: nameError });
      setEmail({ ...email, error: emailError });
      setPassword({ ...password, error: passwordError });
      return;
    }

    setLoading(true);

    try {
      // Sign up using Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.value,
        password.value
      );
      const user = userCredential.user;

      // Get Firebase ID Token
      const firebaseIdToken = await getIdToken(user);

      // Call the Playground API to authenticate the user
      // const response = await axios.post(`${ROOT_URL}/playground/login/`, {
      //   firebase_id_token: firebaseIdToken,
      // });

      // Save token in AsyncStorage
      // await AsyncStorage.setItem("auth_token", response.data.token);

      // console.log("User registered:", response.data);

      // login into the platform
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/playground/login/`,
        {
          firebase_id_token: user?.stsTokenManager?.accessToken,
        },
        {
          headers: {
            "Content-Type": "application/json", // Set the correct content type
            "ngrok-skip-browser-warning": "69420",
          },
        }
      );

      console.log("Login response:", response.data);

      // Set the access token and refresh token in storage using react native async storage
      await AsyncStorage.setItem("accessToken", response.data.access);
      await AsyncStorage.setItem("refreshToken", response.data.refresh);

      // Navigate to Select Credit Cards
      navigation.reset({
        index: 0,
        routes: [{ name: "AddCardScreen" }],
      });
    } catch (error) {
      console.error("Sign-up failed:", error.message);
      Alert.alert("Sign-Up Error", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Background>
      <BackButton
        goBack={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: "StartScreen" }],
          })
        }
      />
      <Logo />
      <Header>Sign Up</Header>
      <TextInput
        label="Name"
        returnKeyType="next"
        value={name.value}
        onChangeText={(text) => setName({ value: text, error: "" })}
        error={!!name.error}
        errorText={name.error}
      />
      <TextInput
        label="Email"
        returnKeyType="next"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: "" })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
      />
      <TextInput
        label="Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: "" })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />
      <Text style={{ color: "red" }}>{error}</Text>
      <Button
        mode="contained"
        onPress={onSignUpPressed}
        loading={loading}
        disabled={loading}
        style={{ marginTop: 24 }}
      >
        Sign Up
      </Button>
      <View style={styles.row}>
        <Text>Already have an account?</Text>
        <TouchableOpacity onPress={() => navigation.replace("LoginScreen")}>
          <Text style={styles.link}>Log in</Text>
        </TouchableOpacity>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    marginTop: 4,
  },
  link: {
    fontWeight: "bold",
    color: theme.colors.primary,
  },
});
