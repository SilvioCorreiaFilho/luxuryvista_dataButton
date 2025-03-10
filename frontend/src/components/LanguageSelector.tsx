import React from 'react';
import { useLanguage } from '../utils/languageContext';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'pt-BR', name: 'Português', flag: '🇧🇷' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
  { code: 'zh-CN', name: '中文', flag: '🇨🇳' },
  { code: 'ru-RU', name: 'Русский', flag: '🇷🇺' },
];

interface Props {
  className?: string;
}

export function LanguageSelector({ className = '' }: Props) {
  const { language, setLanguage } = useLanguage();

  const currentLanguage = languages.find((lang) => lang.code === language) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`flex items-center gap-1 hover:bg-primary/5 p-1 ${className}`}
        >
          <span className="text-base sm:text-xl">{currentLanguage.flag}</span>
          <span className="font-light hidden md:inline">{currentLanguage.name}</span>
          <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[180px] bg-white/80 backdrop-blur-lg border-gray-100 text-sm sm:text-base"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setLanguage(lang.code)}
          >
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-xl">{lang.flag}</span>
              <span className="font-light">{lang.name}</span>
            </div>
            {lang.code === language && (
              <Check className="w-4 h-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
