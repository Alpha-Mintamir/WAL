import React, { createContext, useContext } from "react";
import { useSelector } from "react-redux";

// Create a context for translations
const TranslationContext = createContext();

// Custom hook to use the translation context
export const useTranslation = () => {
  return useContext(TranslationContext);
};

// Translation provider component
export const TranslationProvider = ({ children }) => {
  const translations = useSelector((state) => state.translation.translations);

  // Translation function
  const t = (label) => {
    return translations[label] || label;
  };

  return (
    <TranslationContext.Provider value={t}>
      {children}
    </TranslationContext.Provider>
  );
};