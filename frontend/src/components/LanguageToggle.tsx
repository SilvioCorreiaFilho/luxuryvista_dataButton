import React from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '../utils/languageContext';

interface Props {
  className?: string;
}

export function LanguageToggle({ className = '' }: Props) {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'pt-BR' ? 'en-US' : 'pt-BR');
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`hover:bg-white/10 relative group ${className}`}
      onClick={toggleLanguage}
      title={language === 'pt-BR' ? 'Switch to English' : 'Mudar para Português'}
    >
      <div className="relative w-8 h-6 overflow-hidden rounded-[2px]">
        {/* Brazilian Flag */}
        <img
          src="/public/f2781c83-f39f-466b-ab5d-e85c2f4ca111/brazil.png"
          alt="Bandeira do Brasil"
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-300 ${language === 'pt-BR' ? 'translate-y-0' : '-translate-y-full'}`}
        />
        
        {/* USA Flag */}
        <img
          src="/public/f2781c83-f39f-466b-ab5d-e85c2f4ca111/united-states.png"
          alt="USA Flag"
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-300 ${language === 'pt-BR' ? 'translate-y-full' : 'translate-y-0'}`}
        />
      </div>
      <span className="sr-only">
        {language === 'pt-BR' ? 'Switch to English' : 'Mudar para Português'}
      </span>
    </Button>
  );
}
