import React, { useContext } from "react";
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
import { FloatingAction } from "react-native-floating-action";
import { ScrollView } from "react-native-gesture-handler";
import { CardDataContext } from "../context/CardDataContext";
// Getting the window width for responsive design
const windowWidth = Dimensions.get("window").width;

// Import local images from assets
const avatarImage = require("../../assets/avatar.svg");
const addIcon = require("../../assets/add.png");

const colors = ["#252a16", "#ee3324", "#edbd57"];
const contrastingColors = ["#dfddd0", "#f3f7f8", "#eee8da"];

export default function HomeScreen() {
  const navigation = useNavigation();
  const [cardData, setCardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { cardDataStatic, loading: loadingCardData } =
    useContext(CardDataContext);

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      if (loadingCardData) {
        return;
      }
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
        // card static has array of card Issuer inside which there is array of cards and each card has cardKey and cardName
        if (cardDataStatic.length === 0) {
          setCardData(response.data);
          setLoading(false);
          return;
        }
        // convert card static to array of cards
        const cardDataStaticArray = cardDataStatic.reduce((acc, cardIssuer) => {
          return acc.concat(cardIssuer.card);
        }, []);
        console.log("Card data:", response.data, cardDataStaticArray);
        const getCardName = (cardKey) => {
          const card = cardDataStaticArray.find(
            (card) => card.cardKey === cardKey
          );
          console.log("Card:", card, cardKey);
          return card ? card.cardName : cardKey;
        };

        const formattedData = response.data.map((card) => {
          // find the card in the static data
          return {
            ...card,
            cardName: getCardName(card.cardName),
          };
        });

        setCardData(formattedData);
        setLoading(false);
      };

      fetchCardData();
    }, [cardDataStatic])
  );

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
      {/* <View style={{ position: "relative" }}> */}
      {/* {cardData.length > 0 ? (
          <FlatList
            data={cardData}
            renderItem={renderCard}
            keyExtractor={(item, index) => index.toString()}
            style={styles.cardList}
            contentContainerStyle={[
              styles.cardListContainer,
              { paddingBottom: 100 },
            ]}
            //  contentContainerStyle={{ paddingBottom: 100 }}
          />
        ) : loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : (
          <Text>Please add more cards to see the available offers.</Text>
        )} */}
      {cardData.length > 0 ? (
        <ScrollView
          contentContainerStyle={[
            styles.cardListContainer,
            { paddingBottom: 100 },
          ]}
        >
          {cardData.map((item, index) => renderCard({ item, index }))}
        </ScrollView>
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
      {/* <FloatingAction
          // actions={actions}
          onPressItem={() => navigation.navigate("AddCardScreen")}
          floatingIcon={addIcon}
        /> */}
      {/* </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
    // position: "relative",
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
    // backgroundColor: "transparent",
    zIndex: 100,
    // Removed background color to remove the circle effect
  },
  fabIcon: {
    width: 60,
    height: 60, // Adjust size according to the image you want
    zIndex: 100,
  },
});
