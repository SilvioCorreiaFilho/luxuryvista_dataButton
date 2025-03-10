import React from 'react';
import { motion } from 'framer-motion';
import { TranslatedText } from './TranslatedText';
import { TranslatedInput } from './TranslatedInput';

export const Hero: React.FC = () => {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2075&q=80)',
          filter: 'brightness(0.7)'
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center text-white">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-6 text-center text-5xl font-bold md:text-6xl lg:text-7xl"
        >
          <TranslatedText text="Ferola Private Brokers" fromLang="pt-BR" />
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8 text-center text-xl md:text-2xl"
        >
          <TranslatedText text="Imóveis de Luxo em Brasília" fromLang="pt-BR" />
        </motion.p>
        
        {/* Search Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full max-w-3xl px-4"
        >
          <div className="flex items-center rounded-lg bg-white/90 p-2 shadow-lg backdrop-blur-sm">
            <TranslatedInput 
              type="text"
              placeholderText="Busque por localização, tipo de imóvel ou características..."
              className="flex-1 bg-transparent px-4 py-2 text-black outline-none"
            />
            <button className="rounded-lg bg-black px-6 py-2 font-semibold text-white transition hover:bg-gray-800">
              <TranslatedText text="Buscar" fromLang="pt-BR" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
