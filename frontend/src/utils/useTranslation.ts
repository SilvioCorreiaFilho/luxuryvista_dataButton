import { useCallback, useMemo } from 'react';
import { useLanguage } from './languageContext';
import brain from 'brain';
import { create } from 'zustand';

// Service status types from the API
type TranslationServiceStatus = 'success' | 'limited' | 'error' | 'unavailable';

interface TranslationServiceInfo {
  status: TranslationServiceStatus;
  message: string;
}

interface TranslationResult {
  text: string;
  serviceInfo?: TranslationServiceInfo;
}

interface TranslationCache {
  translations: Record<string, TranslationResult>;
  pendingTranslations: Record<string, Promise<TranslationResult>>;
  addTranslation: (key: string, translation: TranslationResult) => void;
  addPendingTranslation: (key: string, promise: Promise<TranslationResult>) => void;
  removePendingTranslation: (key: string) => void;
  getTranslation: (key: string) => TranslationResult | undefined;
  getPendingTranslation: (key: string) => Promise<TranslationResult> | undefined;
}

// Store for translation status tracking
interface TranslationStatusStore {
  currentStatus: TranslationServiceStatus;
  lastMessage: string;
  setStatus: (status: TranslationServiceStatus, message: string) => void;
  clearStatus: () => void;
}

const useTranslationStatusStore = create<TranslationStatusStore>((set) => ({
  currentStatus: 'success',
  lastMessage: '',
  setStatus: (status, message) => set({ currentStatus: status, lastMessage: message }),
  clearStatus: () => set({ currentStatus: 'success', lastMessage: '' }),
}));

// Store for translation cache
const useTranslationStore = create<TranslationCache>((set, get) => ({
  translations: {},
  pendingTranslations: {},
  addTranslation: (key, translation) =>
    set((state) => ({
      translations: { ...state.translations, [key]: translation },
    })),
  addPendingTranslation: (key, promise) =>
    set((state) => ({
      pendingTranslations: { ...state.pendingTranslations, [key]: promise },
    })),
  removePendingTranslation: (key) =>
    set((state) => {
      const { [key]: _, ...rest } = state.pendingTranslations;
      return { pendingTranslations: rest };
    }),
  getTranslation: (key) => get().translations[key],
  getPendingTranslation: (key) => get().pendingTranslations[key],
}));

export function useTranslation() {
  // Get translation status functions
  const { setStatus } = useTranslationStatusStore();
  const { language } = useLanguage();
  const {
    addTranslation,
    getTranslation,
    addPendingTranslation,
    removePendingTranslation,
    getPendingTranslation,
  } = useTranslationStore();

  // Create a cache key from the text and languages
  const createCacheKey = useCallback(
    (text: string, fromLang: string, toLang: string) =>
      `${text}:${fromLang}:${toLang}`,
    []
  );

  const translate = useCallback(
    async (
      text: string,
      fromLang: string = 'pt-BR',
      toLang?: string
    ): Promise<string> => {
      const targetLang = toLang || language;
      if (targetLang === fromLang) return text;
      if (!text || !text.trim()) return text;

      const cacheKey = createCacheKey(text, fromLang, targetLang);
      const cachedTranslation = getTranslation(cacheKey);
      if (cachedTranslation) return cachedTranslation.text;

      const pendingTranslation = getPendingTranslation(cacheKey);
      if (pendingTranslation) return pendingTranslation.then(result => result.text);

      const translationPromise = (async () => {
        try {
          const response = await brain.translate({
            text,
            from_lang: fromLang,
            to_lang: targetLang,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(
              errorData.detail || `Translation failed with status ${response.status}`
            );
          }

          const data = await response.json();
          const translatedText = data.translated_text;
          const serviceInfo = data.service_info || { 
            status: 'success', 
            message: 'Translation successful' 
          };
          
          // Update global translation status
          if (serviceInfo.status !== 'success') {
            setStatus(serviceInfo.status as TranslationServiceStatus, serviceInfo.message);
          }

          // Cache the translation result
          const result: TranslationResult = {
            text: translatedText,
            serviceInfo: serviceInfo as TranslationServiceInfo
          };
          
          addTranslation(cacheKey, result);

          return translatedText;
        } catch (error) {
          console.error('Translation error:', error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred during translation';
          throw new Error(errorMessage);
        } finally {
          removePendingTranslation(cacheKey);
        }
      })();

      addPendingTranslation(cacheKey, translationPromise);
      return translationPromise;
    },
    [language, createCacheKey, addTranslation, getTranslation, addPendingTranslation, removePendingTranslation, getPendingTranslation]
  );

  // Export additional functions for status management
  const { currentStatus, lastMessage } = useTranslationStatusStore();
  
  return { 
    translate,
    translationStatus: currentStatus,
    translationMessage: lastMessage
  };
}
