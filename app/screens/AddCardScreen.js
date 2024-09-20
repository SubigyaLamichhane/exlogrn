import React, { useState, useEffect } from "react";
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
import { Avatar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { theme } from "../core/theme";
import BackButton from "../components/BackButton";
import * as FileSystem from "expo-file-system";
import axios from "axios";

const apiLink = `${process.env.REACT_APP_API_URL}/api/credit-cards`;
// const apiLink = `https://8f75-202-51-80-201.ngrok-free.app/api/credit-cards`;

let cardDataStatic = [];

export default function AddCardScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cardData, setCardData] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const navigation = useNavigation();

  const getCardData = async () => {
    try {
      const { data } = await axios.get(apiLink, {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420",
        },
      });
      // console.log("Card data:", data);
      cardDataStatic = data;
      setCardData(data);
    } catch (error) {
      console.error("Error fetching card data:", error);
    }
  };

  useEffect(() => {
    getCardData();
  }, []);

  useEffect(() => {
    if (searchTerm === "") {
      setCardData(cardDataStatic);
      return;
    } else {
      //   [
      // {
      //     "cardIssuer": "American Airlines Federal Credit Union",
      //     "card": [
      //         {
      //             "cardKey": "aacfu-biz-plat",
      //             "cardName": "American Airlines Credit Union Visa Business Platinum"
      //         },
      //         {
      //             "cardKey": "aacfu-cashback",
      //             "cardName": "American Airlines Credit Union Visa Signature Cash Back"
      //         },

      //     ]
      // },

      const filteredData = cardDataStatic.filter((card) => {
        return card.card.some((card) =>
          card.cardName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
      setCardData(filteredData);
    }
  }, [searchTerm]);

  // Group cards by issuer
  const groupedCards = cardData.reduce((acc, card) => {
    (acc[card.cardIssuer] = acc[card.cardIssuer] || []).push(...card.card);
    return acc;
  }, {});

  // Format data for SectionList
  const sections = Object.keys(groupedCards).map((issuer) => ({
    title: issuer,
    data: groupedCards[issuer],
  }));

  // Function to check if the card image exists
  const getCardImage = async (cardKey) => {
    // const imagePath = `../../assets/card_images/${cardKey}.jpg`;
    // try {
    //   await FileSystem.getInfoAsync(imagePath);
    //   return imagePath;
    // } catch {
    return require("../../assets/credit-card.svg");
    // }
  };

  const handleCardPress = (card) => {
    setSelectedCard(card);
    setModalVisible(true);
  };

  const confirmCardSelection = async () => {
    await axios.post(`${process.env.REACT_APP_API_URL}/playground/card/`, {
      company_name: selectedCard.cardKey,
    });
    Alert.alert("Card added successfully!");
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
                <Text style={styles.buttonText}>Confirm</Text>
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
