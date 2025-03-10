import React, { useEffect, useState } from 'react';
import { useTranslation } from '../utils/useTranslation';
import { useLanguage } from '../utils/languageContext';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  placeholder: string;
  fromLang?: string;
}

export function TranslatedInput({ 
  placeholder, 
  fromLang = 'pt-BR',
  ...props 
}: Props) {
  const { language } = useLanguage();
  const { translate } = useTranslation();
  const [translatedPlaceholder, setTranslatedPlaceholder] = useState(placeholder);

  useEffect(() => {
    if (language !== fromLang) {
      translate(placeholder).then(setTranslatedPlaceholder);
    } else {
      setTranslatedPlaceholder(placeholder);
    }
  }, [placeholder, language, fromLang, translate]);

  return (
    <input
      {...props}
      placeholder={translatedPlaceholder}
    />
  );
}
