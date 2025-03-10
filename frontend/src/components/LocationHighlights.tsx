import React from 'react';
import { motion } from 'framer-motion';
import { TranslatedText } from './TranslatedText';

interface Location {
  id: number;
  name: string;
  description: string;
  image: string;
}

const locations: Location[] = [
  {
    id: 1,
    name: 'Lago Sul',
    description: 'Região nobre com mansões à beira do lago Paranoá',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  },
  {
    id: 2,
    name: 'Setor Noroeste',
    description: 'Bairro sustentável com apartamentos modernos',
    image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  },
  {
    id: 3,
    name: 'Sudoeste',
    description: 'Localização privilegiada próxima ao centro',
    image: 'https://images.unsplash.com/photo-1448630360428-65456885c650?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2067&q=80'
  },
  {
    id: 4,
    name: 'Park Way',
    description: 'Amplos terrenos em meio à natureza',
    image: 'https://images.unsplash.com/photo-1464082354059-27db6ce50048?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
  }
];

export const LocationHighlights: React.FC = () => {
  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center text-4xl font-bold"
        >
          <TranslatedText text="Localizações Premium em Brasília" />
        </motion.h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {locations.map((location, index) => (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group cursor-pointer overflow-hidden rounded-lg bg-white shadow-lg"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={location.image}
                  alt={location.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>

              <div className="p-6">
                <h3 className="mb-2 text-xl font-bold"><TranslatedText text={location.name} /></h3>
                <p className="text-gray-600"><TranslatedText text={location.description} /></p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
