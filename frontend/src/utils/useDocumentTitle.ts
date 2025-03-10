import { useEffect } from 'react';
import { useLanguage } from './languageContext';
import { useTranslation } from './useTranslation';

const TITLE = 'Imóveis de Alto Padrão';
const SUBTITLE = 'Descubra residências exclusivas em localizações privilegiadas';

export function useDocumentTitle() {
  const { language } = useLanguage();
  const { translate } = useTranslation();

  useEffect(() => {
    const updateTitle = async () => {
      if (language === 'pt-BR') {
        document.title = `${TITLE} | ${SUBTITLE}`;
      } else {
        try {
          const [translatedTitle, translatedSubtitle] = await Promise.all([
            translate(TITLE, 'pt-BR', language),
            translate(SUBTITLE, 'pt-BR', language)
          ]);
          document.title = `${translatedTitle} | ${translatedSubtitle}`;
        } catch (error) {
          console.error('Error translating document title:', error);
          document.title = `${TITLE} | ${SUBTITLE}`;
        }
      }
    };

    updateTitle();
  }, [language, translate]);
}
