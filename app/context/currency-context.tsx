import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api-client";

export type CurrencyCode = string;

interface CurrencyConfig {
  base: string;
  rates: Record<string, number>;
  symbols: Record<string, string>;
  activeCodes: string[];
}

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  formatPrice: (amount: number, fromCurrency?: string) => string;
  rates: Record<string, number>;
  symbol: string;
  allSymbols: Record<string, string>;
  activeCodes: string[];
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
);

const DEFAULT_CONFIG: CurrencyConfig = {
  base: "USD",
  rates: { USD: 1 },
  symbols: { USD: "$" },
  activeCodes: ["USD"],
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
          // 1. If saved pref is valid and active, keep it.
          // 2. Otherwise, use server base IF active.
          // 3. Finally, fallback to first available active code.
          const isSavedActive = saved && res.data.activeCodes.includes(saved);
          if (!isSavedActive) {
            const defaultCode = res.data.activeCodes.includes(res.data.base)
              ? res.data.base
              : res.data.activeCodes[0];
            setCurrencyState(defaultCode);
          }
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

  const formatPrice = (amount: number, fromCurrency: string = "USD") => {
    // 1. Get rates
    const fromRate = config.rates[fromCurrency as CurrencyCode] || 1;
    const toRate = config.rates[currency] || 1;

    // 2. Convert to Base (USD) then to Target
    // If fromRate is 0.85 (1 USD = 0.85 EUR), then 1 EUR = 1/0.85 USD.
    const amountInUSD = amount / fromRate;
    const finalValue = amountInUSD * toRate;

    const symbol = config.symbols[currency] || "$";

    return `${symbol}${finalValue.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatPrice,
        rates: config.rates,
        symbol: config.symbols[currency],
        allSymbols: config.symbols,
        activeCodes: config.activeCodes,
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
