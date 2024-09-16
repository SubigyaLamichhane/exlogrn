import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Image,
  TouchableOpacity,
} from "react-native";
import { Avatar } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { theme } from "../core/theme";
import BackButton from "../components/BackButton";

// Sample credit card data based on API response
const cardData = [
  {
    id: "1",
    creditCardName: "Citi Custom Cash™",
    spendBonusDesc: "Earn 5% Cashback on Grocery Stores",
    earnMultiplier: "5x",
  },
  {
    id: "2",
    creditCardName: "American Express® Gold",
    spendBonusDesc: "Earn 4x Points on Restaurants",
    earnMultiplier: "4x",
  },
  {
    id: "3",
    creditCardName: "Bank of America® Unlimited",
    spendBonusDesc: "Earn 1.5% Cashback on All Purchases",
    earnMultiplier: "1.5x",
  },
  {
    id: "4",
    creditCardName: "Citi Custom Cash™",
    spendBonusDesc: "Earn 5% Cashback on Transit",
    earnMultiplier: "5x",
  },
  // Add more card data as needed
];

export default function AddCardScreen() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigation = useNavigation();

  // Filter card data based on search term
  const filteredCards = cardData.filter((card) =>
    card.creditCardName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderCardItem = ({ item }) => (
    <View style={styles.cardItem}>
      <Image
        source={require("../../assets/credit-card.svg")}
        style={styles.cardImage}
      />
      <View style={styles.cardDetails}>
        <Text style={styles.cardName}>{item.creditCardName}</Text>
        <Text style={styles.spendBonusDesc}>{item.spendBonusDesc}</Text>
        <Text style={styles.earnMultiplier}>{item.earnMultiplier}</Text>
      </View>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => alert(`Added ${item.creditCardName}`)}
      >
        <Image
          source={require("../../assets/plus.svg")}
          style={styles.addIcon}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <BackButton goBack={() => navigation.navigate("HomeScreen")} />
        <Text style={styles.header}>Add Card</Text>

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

      <FlatList
        data={filteredCards}
        renderItem={renderCardItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.cardListContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#fff",
  },
  centeredAvatarContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20, // Adjust the padding as needed
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
    backgroundColor: "#f5eefc", // Light purple background
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
    paddingBottom: 20, // To provide padding for the list
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
  spendBonusDesc: {
    fontSize: 14,
    color: "#666",
  },
  earnMultiplier: {
    fontSize: 12,
    color: "#00f",
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 50,
    padding: 8,
  },
  addIcon: {
    width: 20,
    height: 20,
  },
});
