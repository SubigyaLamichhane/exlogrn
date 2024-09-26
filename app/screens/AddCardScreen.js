import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Button,
  SectionList,
  Alert,
} from "react-native";
import { Avatar, Card } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { theme } from "../core/theme";
import BackButton from "../components/BackButton";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CardDataContext } from "../context/CardDataContext";

export default function AddCardScreen({ route }) {
  const { cardDataStatic, loading: loadingCardData } =
    useContext(CardDataContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [cardData, setCardData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    console.log("Card data static:", cardDataStatic);
    setCardData(cardDataStatic);
  }, [cardDataStatic]);

  useEffect(() => {
    if (searchTerm === "") {
      setCardData(cardDataStatic);
      return;
    } else {
      const filteredData = cardDataStatic.filter((card) => {
        return card.card.some((card) =>
          card.cardName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setCardData(filteredData);
    }
  }, [searchTerm]);

  // Safely reduce cardData by ensuring it's an array and checking each card's structure
  const groupedCards = (Array.isArray(cardData) ? cardData : []).reduce(
    (acc, card) => {
      // Check if card and cardIssuer exist, and card.card is an array
      if (card && card.cardIssuer && Array.isArray(card.card)) {
        (acc[card.cardIssuer] = acc[card.cardIssuer] || []).push(...card.card);
      }
      return acc;
    },
    {}
  );

  // Format data for SectionList
  const sections = Object.keys(groupedCards).map((issuer) => ({
    title: issuer,
    data: groupedCards[issuer],
  }));

  const handleCardPress = (card) => {
    setSelectedCard(card);
    setModalVisible(true);
  };

  const confirmCardSelection = async () => {
    setLoading(true);
    const accessToken = await AsyncStorage.getItem("accessToken");
    await axios.post(
      `${process.env.REACT_APP_API_URL}/playground/card/`,
      {
        company_name: selectedCard.cardKey,
      },
      {
        headers: {
          "Content-Type": "application/json",
          // Set the access token in the Authorization header
          Authorization: `Bearer ${accessToken}`,
          "ngrok-skip-browser-warning": "69420",
        },
      }
    );
    setLoading(false);
    Alert.alert("Card added successfully!");
    // navigate back to the homescreen
    navigation.navigate("HomeScreen");
    setModalVisible(false);
  };

  const renderCardItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleCardPress(item)}
      style={styles.cardItem}
    >
      <Image
        source={require("../../assets/credit-card.svg")}
        style={styles.cardImage}
      />
      <View style={styles.cardDetails}>
        <Text style={styles.cardName}>{item.cardName}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderIssuerHeader = ({ section: { title } }) => (
    <Text style={styles.issuerName}>{title}</Text>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <BackButton goBack={() => navigation.navigate("HomeScreen")} />
        <Text style={styles.header}>Add Card</Text>
        <TouchableOpacity onPress={() => navigation.navigate("ProfileScreen")}>
          <Avatar.Image
            width={50}
            height={50}
            style={{ backgroundColor: "transparent" }}
            source={require("../../assets/avatar.svg")}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <TouchableOpacity>
          <Image
            source={require("../../assets/menu.svg")}
            style={styles.menuIcon}
          />
        </TouchableOpacity>
        <TextInput
          style={styles.searchInput}
          placeholder="Search your credit card..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <TouchableOpacity>
          <Image
            source={require("../../assets/search.svg")}
            style={styles.searchIcon}
          />
        </TouchableOpacity>
      </View>

      {sections.length > 0 ? (
        <SectionList
          sections={sections}
          renderItem={renderCardItem}
          renderSectionHeader={renderIssuerHeader}
          keyExtractor={(item) => item.cardKey}
          contentContainerStyle={styles.cardListContainer}
          stickySectionHeadersEnabled={false} // Optional: to prevent section headers from sticking
          showsVerticalScrollIndicator={false} // Optional: to hide the scroll bar
          style={styles.sectionList} // Ensure the SectionList itself can scroll
        />
      ) : (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Are you sure you want to add {selectedCard?.cardName}?
            </Text>
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmCardSelection}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.buttonText}>Confirm</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
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
    marginTop: 40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5eefc",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 20,
  },
  menuIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingLeft: 5,
  },
  searchIcon: {
    width: 24,
    height: 24,
    marginLeft: 10,
  },
  cardListContainer: {
    paddingBottom: 20,
  },
  cardItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5eefc",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardImage: {
    width: 60,
    height: 40,
    borderRadius: 5,
    marginRight: 15,
  },
  cardDetails: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  issuerName: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    maxWidth: 300,
    width: "80%",
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: theme.colors.error,
  },
  confirmButton: {
    backgroundColor: theme.colors.primary,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
