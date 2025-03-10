import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../utils/auth-store';
import { TranslatedText } from './TranslatedText';
import { User, LogOut, Settings, UserCircle } from 'lucide-react';

export const UserMenu: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-black/20 p-2 backdrop-blur-md hover:bg-black/30 text-white"
      >
        <UserCircle className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-lg bg-white py-2 shadow-xl z-10">
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium">{user.user_metadata?.full_name || user.email}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
          
          <button
            onClick={() => {
              navigate('/Dashboard');
              setIsOpen(false);
            }}
            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <User className="mr-2 h-4 w-4" />
            <TranslatedText text="Painel de Controle" fromLang="pt-BR" />
          </button>
          
          <button
            onClick={() => {
              navigate('/Profile');
              setIsOpen(false);
            }}
            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            <Settings className="mr-2 h-4 w-4" />
            <TranslatedText text="Meu Perfil" fromLang="pt-BR" />
          </button>
          
          <div className="border-t border-gray-100 mt-1 pt-1">
            <button
              onClick={() => {
                signOut();
                setIsOpen(false);
              }}
              className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <TranslatedText text="Sair" fromLang="pt-BR" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
