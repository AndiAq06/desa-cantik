// src/contexts/FooterContext.jsx
import { createContext, useState, useEffect } from "react";
import { apiClient } from "@/services/apiClient";

export const FooterContext = createContext();

export const FooterProvider = ({ children }) => {
  // Default initial state
  const [footerData, setFooterData] = useState({
    email: "desacantik@bps.go.id",
    phone: "0812-3456-7890",
    bps_torut: "https://torutkab.bps.go.id/",
    bps_sulsel: "https://sulsel.bps.go.id",
    bps_ri: "https://www.bps.go.id",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get("/footer");
        if (response.success && response.data) {
          setFooterData(response.data);
        }
      } catch (error) {
        console.error("Gagal memuat kontak footer:", error);
      }
    };

    fetchData();
  }, []);

  const updateFooterData = async (newData) => {
    try {
      await apiClient.post("/footer", newData); // Assuming POST/PUT is mapped
      setFooterData(newData);
      return true;
    } catch (error) {
      console.error("Gagal update footer:", error);
      throw error;
    }
  };

  return <FooterContext.Provider value={{ footerData, setFooterData, updateFooterData }}>{children}</FooterContext.Provider>;
};
