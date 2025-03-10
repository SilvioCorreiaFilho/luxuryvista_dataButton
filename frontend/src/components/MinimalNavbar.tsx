import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';

interface Props {
  className?: string;
}

export function MinimalNavbar({ className = '' }: Props) {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/30 backdrop-blur-lg">
      <div className="w-full px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="text-white hover:text-white/80 transition-colors"
            >
              <Home className="w-5 h-5" />
            </button>
            
            <div 
              className="flex items-center gap-2 cursor-pointer" 
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
          </div>

          <LanguageSelector className="text-white" />
        </div>
      </div>
    </nav>
  );
}