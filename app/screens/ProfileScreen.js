import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Avatar, Button } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "../../firebaseConfig"; // Firebase auth instance
import { signOut, getIdToken } from "firebase/auth";
import BackButton from "../components/BackButton";

export default function ProfileScreen({ navigation }) {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    // Fetch user info when the component is mounted
    const fetchUserInfo = async () => {
      const user = auth.currentUser;
      if (user) {
        // Get user data from Firebase
        const token = await getIdToken(user); // Get Firebase access token
        await AsyncStorage.setItem("firebase_access_token", token); // Save token in local storage

        setUserInfo({
          displayName: user.displayName || "Anonymous",
          email: user.email,
          photoURL: user.photoURL || require("../../assets/avatar.svg"), // Default avatar if none provided
        });
      } else {
        Alert.alert("Error", "No user is currently signed in.");
      }
    };

    fetchUserInfo();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth); // Sign out from Firebase
      await AsyncStorage.removeItem("firebase_access_token"); // Remove token from local storage
      navigation.reset({
        index: 0,
        routes: [{ name: "StartScreen" }], // Navigate back to login screen after sign out
      });
    } catch (error) {
      Alert.alert("Sign Out Error", error.message);
    }
  };

  if (!userInfo) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BackButton goBack={() => navigation.navigate("HomeScreen")} />
      <View style={styles.profileHeader}>
        <Avatar.Image
          style={{ backgroundColor: "transparent" }}
          size={100}
          source={userInfo.photoURL}
        />
        <Text style={styles.userName}>{userInfo.displayName}</Text>
        <Text style={styles.email}>{userInfo.email}</Text>
      </View>

      <View style={styles.buttonsContainer}>
        <Button
          mode="contained"
          style={styles.signOutButton}
          onPress={handleSignOut}
        >
          Sign Out
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 40,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  email: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  buttonsContainer: {
    marginTop: 30,
    alignItems: "center",
  },
  signOutButton: {
    width: "100%",
    backgroundColor: "#ff5252",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
