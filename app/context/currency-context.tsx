import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQueryClient } from "@tanstack/react-query";
import React, { createContext, useContext, useEffect, useState } from "react";
import { api, setApiClientCurrency } from "../lib/api-client";

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
  undefined,
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

        // Fetch API rates and Settings
        const [currencyRes, settingsRes] = await Promise.all([
          api.get<{ data: CurrencyConfig }>("/api/v1/currency/config"),
          api.get<{ success: boolean; data: { currency: string } }>(
            "/api/v1/settings",
          ),
        ]);

        if (currencyRes.data && settingsRes.data) {
          const config = currencyRes.data;
          const storeCurrency = settingsRes.data.currency;

          setConfig(config);

          const isSavedActive = saved && config.activeCodes.includes(saved);
          let finalCode: string;

          if (isSavedActive) {
            finalCode = saved!;
          } else {
            // Priority: Settings Currency > Base > First Active
            if (config.activeCodes.includes(storeCurrency)) {
              finalCode = storeCurrency;
            } else if (config.activeCodes.includes(config.base)) {
              finalCode = config.base;
            } else {
              finalCode = config.activeCodes[0];
            }
          }

          setCurrencyState(finalCode);
          setApiClientCurrency(finalCode);
          if (!isSavedActive) {
            await AsyncStorage.setItem("user_currency", finalCode);
          }
        }
      } catch (e: any) {
        if (!e.isHandled) {
          console.error("Failed to init currency", e);
        }
      } finally {
        setIsLoaded(true);
      }
    };

    init();
  }, []);

  const queryClient = useQueryClient();

  const setCurrency = async (code: CurrencyCode) => {
    setCurrencyState(code);
    setApiClientCurrency(code);
    await AsyncStorage.setItem("user_currency", code);
    // Force re-fetch of all data with the new x-currency header
    queryClient.invalidateQueries();
    // Note: App reload removed - query invalidation is sufficient for currency changes
  };

  const formatPrice = (amount: number, fromCurrency: string = config.base) => {
    // 1. Get rates
    const fromRate = config.rates[fromCurrency as CurrencyCode] || 1;
    const toRate = config.rates[currency] || 1;

    // 2. Convert to Base then to Target
    const amountInUSD = amount / fromRate;
    const finalValue = amountInUSD * toRate;

    const symbol = config.symbols[currency] || "$";

    // 3. Format with commas and 2 decimal places
    const formattedValue = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(finalValue);

    return `${symbol} ${formattedValue}`;
  };

  if (!isLoaded) return null;

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
