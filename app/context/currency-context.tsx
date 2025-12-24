import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api-client";

export type CurrencyCode = "USD" | "INR" | "AUD" | "NPR";

interface CurrencyConfig {
  base: string;
  rates: Record<CurrencyCode, number>;
  symbols: Record<CurrencyCode, string>;
}

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amount: number) => string;
  rates: Record<CurrencyCode, number>;
  symbol: string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

const DEFAULT_CONFIG: CurrencyConfig = {
  base: "USD",
  rates: { USD: 1, INR: 83.5, AUD: 1.52, NPR: 133.5 },
  symbols: { USD: "$", INR: "₹", AUD: "A$", NPR: "Rs." },
};

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("USD");
  const [config, setConfig] = useState<CurrencyConfig>(DEFAULT_CONFIG);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved currency and fetch latest rates
  useEffect(() => {
    const init = async () => {
      try {
        // Load saved preference
        const saved = await AsyncStorage.getItem("user_currency");
        if (saved) setCurrencyState(saved as CurrencyCode);

        // Fetch API rates
        const res = await api.get<{ data: CurrencyConfig }>(
          "/api/currency/config"
        );
        if (res.data) {
          setConfig(res.data);
        }
      } catch (e) {
        console.error("Failed to init currency", e);
      } finally {
        setIsLoaded(true);
      }
    };

    init();
  }, []);

  const setCurrency = async (code: CurrencyCode) => {
    setCurrencyState(code);
    await AsyncStorage.setItem("user_currency", code);
  };

  const formatPrice = (amount: number) => {
    const rate = config.rates[currency] || 1;
    const value = amount * rate;
    const symbol = config.symbols[currency] || "$";

    return `${symbol}${value.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        rates: config.rates,
        symbol: config.symbols[currency],
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context)
    throw new Error("useCurrency must be used within CurrencyProvider");
  return context;
};
