import React from 'react';
import { motion } from 'framer-motion';
import { TranslatedText } from './TranslatedText';

interface Property {
  id: number;
  title: string;
  location: string;
  price: string;
  image: string;
  type: string;
}

const properties: Property[] = [
  {
    id: 1,
    title: 'Mansão Contemporânea',
    location: 'Lago Sul',
    price: 'R$ 12.500.000',
    image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
    type: 'Mansão'
  },
  {
    id: 2,
    title: 'Cobertura Duplex',
    location: 'Setor Noroeste',
    price: 'R$ 8.900.000',
    image: 'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
    type: 'Cobertura'
  },
  {
    id: 3,
    title: 'Apartamento de Alto Padrão',
    location: 'Sudoeste',
    price: 'R$ 5.200.000',
    image: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    type: 'Apartamento'
  }
];

export const FeaturedProperties: React.FC = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center text-4xl font-bold"
        >
          <TranslatedText text="Imóveis em Destaque" />
        </motion.h2>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {properties.map((property, index) => (
            <motion.div
              key={property.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="group overflow-hidden rounded-lg bg-white shadow-lg transition-transform hover:-translate-y-1"
            >
              <div className="relative h-64 overflow-hidden">
                <img 
                  src={property.image} 
                  alt={property.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute left-4 top-4 rounded-full bg-black/80 px-4 py-1 text-sm text-white backdrop-blur-sm">
                  <TranslatedText text={property.type} />
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="mb-2 text-xl font-bold"><TranslatedText text={property.title} /></h3>
                <p className="mb-4 text-gray-600"><TranslatedText text={property.location} /></p>
                <p className="text-lg font-semibold">{property.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
