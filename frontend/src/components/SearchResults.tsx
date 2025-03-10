import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Property {
  id: string;
  title: string;
  description: string;
  price: string;
  location: string;
  area: string;
  bedrooms: number;
  image: string;
}

interface SearchResultsProps {
  isLoading: boolean;
  error: string | null;
  properties: Property[];
  onClose: () => void;
}

export function SearchResults({ isLoading, error, properties, onClose }: SearchResultsProps) {
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-full left-1/2 -translate-x-1/2 w-[800px] max-w-[90vw] mt-4 bg-white/90 backdrop-blur-md rounded-lg shadow-2xl p-6 z-50"
      >
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-md rounded-lg shadow-2xl p-6 z-50"
      >
        <div className="text-center text-red-600 py-12">{error}</div>
      </motion.div>
    );
  }

  if (properties.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-md rounded-lg shadow-2xl p-6 z-50"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-light">Propriedades Encontradas</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {properties.map((property) => (
            <motion.div
              key={property.id}
              className="group cursor-pointer bg-white/50 rounded-lg p-3 hover:bg-white/80 transition-colors duration-200"
              onClick={() => navigate(`/property/${property.id}`)}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative h-52 rounded-lg overflow-hidden mb-3">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <div className="text-white">
                    <h4 className="text-lg font-light mb-1">{property.title}</h4>
                    <p className="text-sm opacity-90">{property.location}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-primary font-light">{property.price}</span>
                  <span className="text-gray-600">{property.area}</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{property.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
