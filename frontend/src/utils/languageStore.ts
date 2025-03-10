import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SupportedLanguage } from "../components/TranslatedText";

interface LanguageState {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
}

export const useLanguageStore = create<LanguageState>(
  persist(
    (set) => ({
      language: "pt-BR" as SupportedLanguage,
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: "language-store",
    }
  )
);
