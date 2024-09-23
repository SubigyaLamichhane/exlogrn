import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Card, Avatar, ActivityIndicator } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { theme } from "../core/theme";
import { useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// Getting the window width for responsive design
const windowWidth = Dimensions.get("window").width;

// Import local images from assets
const avatarImage = require("../../assets/avatar.svg");
const addIcon = require("../../assets/add.png");

const cardData = [
  // {
  //   cardName: "American Express® Gold",
  //   spendBonusCategories: [
  //     { spendBonusDesc: "4x at restaurants worldwide" },
  //     { spendBonusDesc: "4x on groceries at U.S" },
  //     { spendBonusDesc: "3x on flights booked directly with airlines" },
  //   ],
  //   color: "#FFD700", // Yellow
  // },
  // {
  //   cardName: "Discover It® Student Cash Back",
  //   spendBonusCategories: [
  //     { spendBonusDesc: "Earn 5% Cashback Bonus at Grocery Stores" },
  //     { spendBonusDesc: "Earn 5% Cashback Bonus at Walmart" },
  //     { spendBonusDesc: "1% cash back on all other purchases" },
  //   ],
  //   color: "#FF6347", // Red
  // },
  // {
  //   cardName: "Chase Sapphire",
  //   spendBonusCategories: [
  //     { spendBonusDesc: "Earn 2x points on dining" },
  //     { spendBonusDesc: "Earn 5x points on Lyft ride" },
  //   ],
  //   color: "#87CEFA", // Light blue
  // },
];

const colors = ["#252a16", "#ee3324", "#edbd57"];
const contrastingColors = ["#dfddd0", "#f3f7f8", "#eee8da"];

export default function HomeScreen() {
  const navigation = useNavigation();
  const [cardData, setCardData] = useState([]);
  const [loading, setLoading] = useState(false);

  useFocusEffect(() => {
    setLoading(true);
    // Fetch card data when the component is mounted
    const fetchCardData = async () => {
      const accessToken = await AsyncStorage.getItem("accessToken");
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/homeviewapi/`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      console.log("Card data:", response.data);
      setCardData(response.data);
      setLoading(false);
    };

    fetchCardData();
  }, []);

  const renderCard = ({ item, index }) => {
    // Use the index value combined with the length of the colors array to get a more variable output
    const randomIndex = index % colors.length;

    return (
      <Card style={[styles.card, { backgroundColor: colors[randomIndex] }]}>
        <Card.Content>
          <Text
            style={[
              styles.cardTitle,
              { color: contrastingColors[randomIndex] },
            ]}
          >
            {item.cardName}
          </Text>
          {item.spendBonusCategories.map((category, i) => (
            <React.Fragment key={i}>
              <Text
                style={[
                  styles.bonusTitle,
                  { color: contrastingColors[randomIndex] },
                ]}
              >
                {category.spendBonusCategoryName}
              </Text>
              <Text
                style={[
                  styles.bonusText,
                  { color: contrastingColors[randomIndex] },
                ]}
              >
                {category.spendBonusDesc}
              </Text>
            </React.Fragment>
          ))}
        </Card.Content>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Home</Text>
        <TouchableOpacity onPress={() => navigation.navigate("ProfileScreen")}>
          {" "}
          {/* <View style={styles.centeredAvatarContainer}> */}
          <Avatar.Image
            width={50}
            height={50}
            style={{ backgroundColor: "transparent" }}
            source={require("../../assets/avatar.svg")}
          />
          {/* </View> */}
        </TouchableOpacity>
      </View>

      {cardData.length > 0 ? (
        <FlatList
          data={cardData}
          renderItem={renderCard}
          keyExtractor={(item, index) => index.toString()}
          style={styles.cardList}
          contentContainerStyle={styles.cardListContainer}
        />
      ) : loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <Text>Please add more cards to see the available offers.</Text>
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddCardScreen")}
      >
        <Image source={addIcon} style={styles.fabIcon} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
    position: "relative",
  },
  cardTitle: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
  },
  bonusTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontSize: 32,
    fontWeight: "bold",
  },
  cardList: {
    flex: 1,
    marginBottom: 80,
  },
  cardListContainer: {
    alignItems: "center", // Centers the cards horizontally
  },
  card: {
    width: windowWidth - 20, // Ensures the card takes up max width minus padding
    marginBottom: 15,
    borderRadius: 10,
    padding: 10,
  },
  bonusText: {
    fontSize: 16,
    marginBottom: 5,
  },
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "transparent",
    // Removed background color to remove the circle effect
  },
  fabIcon: {
    width: 60,
    height: 60, // Adjust size according to the image you want
  },
});
