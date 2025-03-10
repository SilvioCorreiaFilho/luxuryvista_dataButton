import React, { createContext, useState, useContext, ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
}

// Create a context with a default value
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Custom hook for easy context usage
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    // If no provider is found, return a default implementation
    return {
      language: 'pt-BR',
      setLanguage: () => console.warn('LanguageProvider not found')
    };
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage?: string;
}

// Provider component
export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  initialLanguage = 'pt-BR'
}) => {
  const [language, setLanguage] = useState(initialLanguage);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
