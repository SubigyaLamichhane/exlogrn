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
import Geolocation from "react-native-geolocation-service";
import { Alert } from "react-native";
// Getting the window width for responsive design
const windowWidth = Dimensions.get("window").width;

// Import local images from assets
const avatarImage = require("../../assets/avatar.svg");
const addIcon = require("../../assets/add.png");

const colors = ["#ffdd2a", "#fd5d4e", "#6ac8ff"];

export default function HomeScreen() {
  const navigation = useNavigation();
  const [cardData, setCardData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { cardDataStatic, loading: loadingCardData } =
    useContext(CardDataContext);

  const [location, setLocation] = useState({ latitude: null, longitude: null });

  useEffect(() => {
    const fetchLocation = async () => {
      // Request location permission based on the platform
      const hasPermission = await requestLocationPermission();

      if (!hasPermission) {
        Alert.alert(
          "Permission Denied",
          "Location permission is required to access your location."
        );
        return;
      }

      // Get current location
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          callApi({ latitude, longitude });
        },
        (error) => {
          Alert.alert("Error", error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    };

    // Request location permission function
    const requestLocationPermission = async () => {
      try {
        if (Platform.OS === "ios") {
          // iOS specific permission request
          const granted = await Geolocation.requestAuthorization("whenInUse");
          return granted === "granted";
        } else if (Platform.OS === "android") {
          // Android specific permission request
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: "Location Permission",
              message:
                "This app needs access to your location to provide nearby services.",
              buttonNeutral: "Ask Me Later",
              buttonNegative: "Cancel",
              buttonPositive: "OK",
            }
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return false;
      } catch (err) {
        console.warn(err);
        return false;
      }
    };

    // API call function
    const callApi = async (locationData) => {
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/nearbyapi/`,
          locationData,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
              "ngrok-skip-browser-warning": "69420",
            },
          }
        );
        console.log("API Response:", response.data);
      } catch (error) {
        console.error("API Error:", error);
      }
    };

    fetchLocation();
  }, []);

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
              "ngrok-skip-browser-warning": "69420",
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
        const getCardName = (cardKey) => {
          const card = cardDataStaticArray.find(
            (card) => card.cardKey === cardKey
          );
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
    const randomIndex = index % colors.length;

    return (
      <Card style={[styles.card, { backgroundColor: colors[randomIndex] }]}>
        <Card.Content>
          <Text style={[styles.cardTitle]}>{item.cardName}</Text>
          {item.spendBonusCategories.map((category, i) => (
            <React.Fragment key={i}>
              <Text
                style={[
                  styles.bonusText,
                  // { color: contrastingColors[randomIndex] },
                ]}
              >
                <Text style={[styles.bonusTitle]}>
                  {category.spendBonusCategoryName}:{" "}
                </Text>
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
          <Avatar.Image
            width={50}
            height={50}
            style={{ backgroundColor: "transparent" }}
            source={require("../../assets/avatar.svg")}
          />
        </TouchableOpacity>
      </View>

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
        <Text>
          <ActivityIndicator size="large" color="#007bff" />
        </Text>
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
    marginTop: 10,
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
