import React from 'react';
import { motion } from 'framer-motion';
import { TranslatedText } from './TranslatedText';
import { 
  Home, 
  ShieldCheck, 
  Users,
  Sparkles 
} from 'lucide-react';

interface Value {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
}

const values: Value[] = [
  {
    id: 1,
    title: 'Excelência em Imóveis',
    description: 'Seleção exclusiva das melhores propriedades em Brasília',
    icon: Home
  },
  {
    id: 2,
    title: 'Atendimento Premium',
    description: 'Serviço personalizado e discreto para cada cliente',
    icon: Users
  },
  {
    id: 3,
    title: 'Segurança Garantida',
    description: 'Transações seguras e confidenciais',
    icon: ShieldCheck
  },
  {
    id: 4,
    title: 'Experiência Única',
    description: 'Tecnologia avançada para visualização de imóveis',
    icon: Sparkles
  }
];

export const ValueProposition: React.FC = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center text-4xl font-bold"
        >
          <TranslatedText text="Por que Escolher a Ferola" />
        </motion.h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {values.map((value, index) => {
            const Icon = value.icon;
            return (
              <motion.div
                key={value.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="flex flex-col items-center text-center"
              >
                <div className="mb-4 rounded-full bg-gray-100 p-4">
                  <Icon className="h-8 w-8 text-black" />
                </div>
                <h3 className="mb-2 text-xl font-bold"><TranslatedText text={value.title} /></h3>
                <p className="text-gray-600"><TranslatedText text={value.description} /></p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
