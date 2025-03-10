import { useNavigate } from 'react-router-dom';
import { LanguageSelector } from './LanguageSelector';
import { TranslatedText } from './TranslatedText';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../utils/auth-store';
import { UserMenu } from './UserMenu';
// AuthModal now managed by App.tsx

interface Props {
  className?: string;
  variant?: 'transparent' | 'solid';
}

export function Navbar({ className = '', variant = 'transparent' }: Props) {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  // No longer managing modal state directly
  const { user } = useAuthStore();

  // Function to dispatch the auth modal event
  const openAuthModal = () => {
    const event = new CustomEvent('open-auth-modal');
    window.dispatchEvent(event);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // No longer rendering AuthModal directly

  if (isMobile) {
    return (
      <>
        {/* AuthModal now managed by App.tsx */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="w-full px-4 py-4">
            <div className="flex flex-col items-center gap-2">
            <div 
              className="flex items-center justify-center gap-2 cursor-pointer" 
              onClick={() => navigate('/')}
            >
              <img
                src="/public/f2781c83-f39f-466b-ab5d-e85c2f4ca111/ferola.png"
                alt="Ferola Private Brokers"
                className="h-6"
              />
              <img
                src="/public/f2781c83-f39f-466b-ab5d-e85c2f4ca111/m2wBranca.png"
                alt="M2W"
                className="h-4"
              />
            </div>

            <LanguageSelector className="text-white" />

            <div className="flex flex-col items-center gap-2">
              <button
                className="text-white text-lg font-light tracking-wide"
                onClick={() => navigate('/PropertyListing')}
              >
                <TranslatedText text="Imóveis" fromLang="pt-BR" />
              </button>
              <button
                className="text-white text-lg font-light tracking-wide"
                onClick={() => navigate('/Contact')}
              >
                <TranslatedText text="Contato" fromLang="pt-BR" />
              </button>
              {/* Login button for mobile */}
              {user ? (
                <button
                  className="text-white text-lg font-light tracking-wide"
                  onClick={() => navigate('/Dashboard')}
                >
                  <TranslatedText text="Painel" fromLang="pt-BR" />
                </button>
              ) : (
                <button
                  className="text-white text-lg font-light tracking-wide navbar-auth-button"
                  onClick={openAuthModal}
                >
                  <TranslatedText text="Entrar" fromLang="pt-BR" />
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      </>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-lg">
      <div className="w-full px-8 py-4">
        <div className="flex flex-row justify-between items-center">
          <div 
            className="flex items-center justify-center gap-4 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <img
              src="/public/f2781c83-f39f-466b-ab5d-e85c2f4ca111/ferola.png"
              alt="Ferola Private Brokers"
              className="h-12"
            />
            <img
              src="/public/f2781c83-f39f-466b-ab5d-e85c2f4ca111/m2wBranca.png"
              alt="M2W"
              className="h-8"
            />
          </div>

          <div className="flex flex-row items-center gap-8">
            <LanguageSelector className="text-white" />
            <div className="flex flex-row items-center gap-6">
              <button
                className="text-white/90 hover:text-white text-sm font-light"
                onClick={() => navigate('/PropertyListing')}
              >
                <TranslatedText text="Imóveis" fromLang="pt-BR" />
              </button>
              <button
                className="text-white/90 hover:text-white text-sm font-light"
                onClick={() => navigate('/Contact')}
              >
                <TranslatedText text="Contato" fromLang="pt-BR" />
              </button>
              {user && (
                <button
                  className="text-white/90 hover:text-white text-sm font-light"
                  onClick={() => navigate('/Dashboard')}
                >
                  <TranslatedText text="Painel" fromLang="pt-BR" />
                </button>
              )}
              <button
                className="bg-black/20 backdrop-blur-md text-white/90 hover:text-white text-sm font-light px-6 py-2 rounded-md"
                onClick={() => navigate('/Contact')}
              >
                <TranslatedText text="Agende sua Visita" fromLang="pt-BR" />
              </button>
              
              {user ? (
                <UserMenu />
              ) : (
                <button
                  className="bg-white/10 backdrop-blur-md text-white/90 hover:text-white text-sm font-light px-6 py-2 rounded-md navbar-auth-button"
                  onClick={openAuthModal}
                >
                  <TranslatedText text="Entrar" fromLang="pt-BR" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Auth Modal now managed by App.tsx */}
    </nav>
  );
}