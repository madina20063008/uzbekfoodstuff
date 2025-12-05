import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Currency {
  id: number;
  name: string;
  name_uz: string;
  name_en: string;
  name_ru: string;
}

interface CurrencyContextType {
  currencies: Currency[];
  selectedCurrency: Currency | null;
  setSelectedCurrency: (currency: Currency) => void;
  loading: boolean;
  error: string | null;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.uzbekfoodstaff.ae/api/v1/currency/');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: Currency[] = await response.json();
        setCurrencies(data);
        
        // Set the first currency as default
        if (data.length > 0) {
          setSelectedCurrency(data[0]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch currencies');
        console.error('Error fetching currencies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrencies();
  }, []);

  const handleSetSelectedCurrency = (currency: Currency) => {
    setSelectedCurrency(currency);
  };

  const value: CurrencyContextType = {
    currencies,
    selectedCurrency,
    setSelectedCurrency: handleSetSelectedCurrency,
    loading,
    error,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};