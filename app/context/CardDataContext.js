// CardDataContext.js
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { View } from "react-native-web";

export const CardDataContext = createContext();

const apiLink = `${process.env.REACT_APP_API_URL}/api/credit-cards`;

export const CardDataProvider = ({ children }) => {
  const [cardDataStatic, setCardDataStatic] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCardData = async () => {
    try {
      const { data } = await axios.get(apiLink, {
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "69420",
        },
      });
      setCardDataStatic(data);
      setLoading(false);
      // console.log("Card data fetched successfully", data);
    } catch (error) {
      console.error("Error fetching card data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getCardData();
  }, []);

  return (
    <CardDataContext.Provider value={{ cardDataStatic, loading }}>
      {children}
    </CardDataContext.Provider>
  );
};
