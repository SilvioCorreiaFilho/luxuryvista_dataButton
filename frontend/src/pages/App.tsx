import React, { useState, useEffect } from 'react';
import { Property } from '../utils/propertyTypes';
import { Toaster } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PropertyList } from '../components/PropertyList';
import { ScheduleDialog } from '../components/ScheduleDialog';
import { SearchResults } from '../components/SearchResults';
import { Navbar } from 'components/Navbar';
import { AuthModal } from 'components/AuthModal';
import { useAuthStore } from '../utils/auth-store';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Search, MapPin, Building2, Home, Castle, Star, Key, UserCheck, Phone, Mail, Instagram, Facebook, Linkedin, Youtube } from 'lucide-react';
import { motion } from 'framer-motion';
import brain from 'brain';
import { toast } from 'sonner';

import { LanguageProvider } from '../utils/languageContext';
import { TranslatedText } from '../components/TranslatedText';
import { PropertyMap } from '../components/PropertyMap';
import { TranslatedInput } from '../components/TranslatedInput';
import { useTranslation } from '../utils/useTranslation';
import { useDocumentTitle } from '../utils/useDocumentTitle';

const AppContent = () => {
  return <AppContentInner />;
};

const AppContentInner = () => {
  // Hooks must be called in the same order
  const navigate = useNavigate();
  const { translate } = useTranslation();
  const { user } = useAuthStore();
  
  // State hooks
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add event listener for opening auth modal from navbar
  useEffect(() => {
    const handleOpenAuthModal = () => setIsAuthModalOpen(true);
    window.addEventListener('open-auth-modal', handleOpenAuthModal);
    
    return () => {
      window.removeEventListener('open-auth-modal', handleOpenAuthModal);
    };
  }, []);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<Property[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Custom hooks
  useDocumentTitle();

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setShowResults(true);

    try {
      // Validate input
      if (searchQuery.length < 3) {
        throw new Error('SEARCH_QUERY_TOO_SHORT');
      }

      const response = await brain.search_properties({ query: searchQuery.trim() });
      const data = await response.json();

      if (!data.properties || !Array.isArray(data.properties)) {
        throw new Error('INVALID_RESPONSE_FORMAT');
      }

      setSearchResults(data.properties as Property[]);
    } catch (error) {
      // Log error for debugging
      console.error('Search error:', {
        error,
        searchQuery,
        timestamp: new Date().toISOString(),
      });

      // Handle specific error cases
      let errorMessage = 'Ocorreu um erro ao buscar propriedades. Por favor, tente novamente.';
      
      if (error instanceof Error) {
        switch (error.message) {
          case 'SEARCH_QUERY_TOO_SHORT':
            errorMessage = 'Por favor, digite pelo menos 3 caracteres para buscar.';
            break;
          case 'INVALID_RESPONSE_FORMAT':
            errorMessage = 'Erro no formato dos dados. Por favor, tente novamente.';
            break;
          default:
            // Keep default error message
            break;
        }
      }

      setSearchError(translate(errorMessage));
      toast.error(translate('Erro na busca'), {
        description: translate(errorMessage),
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-center" richColors />
      {/* Auth Modal directly in App */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <Navbar variant="transparent" />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <motion.img
            src="https://images.unsplash.com/photo-1613977257592-4871e5fcd7c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3540&q=80"
            alt="Mansão de Luxo em Brasília"
            className="w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
          />
          {/* Lightroom-like effects with enhanced HDR */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/30" />
          <div className="absolute inset-0 bg-[#f5f5f5]/10" style={{ mixBlendMode: 'overlay' }} />
          <div className="absolute inset-0 bg-[#2d4a77]/5" style={{ mixBlendMode: 'soft-light' }} />
          <div className="absolute inset-0 bg-gradient-to-tr from-[#1a1a1a]/20 to-transparent" style={{ mixBlendMode: 'multiply' }} />
          <div className="absolute inset-0 bg-radial-gradient" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center space-y-12 px-4">
          {/* Hero Text */}
          <motion.div
            className="space-y-6 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-5xl md:text-6xl font-light text-white tracking-wide">
              <TranslatedText text="Luxo Imobiliário em Brasília" fromLang="pt-BR" />
            </h1>
            <p className="text-xl text-white font-light max-w-2xl mx-auto drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]">
              <TranslatedText text="Descubra as mansões e residências exclusivas do Lago Sul, Lago Norte e setores mais valorizados da capital" fromLang="pt-BR" />
            </p>
          </motion.div>

          {/* AI Search */}
          <motion.div
            className="max-w-2xl mx-auto w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="relative">
              <TranslatedInput
                type="text"
                placeholder="Descreva o imóvel dos seus sonhos..."
                className="w-full h-16 pl-12 pr-4 bg-white/90 backdrop-blur-md text-lg placeholder:text-gray-500 rounded-full border-0 focus-visible:ring-2 focus-visible:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Search 
                className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500 cursor-pointer" 
                onClick={handleSearch}
              />
              {showResults && (
                <SearchResults
                  isLoading={isSearching}
                  error={searchError}
                  properties={searchResults}
                  onClose={() => setShowResults(false)}
                />
              )}
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <ScheduleDialog
              trigger={
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-12 py-6 bg-white/5 backdrop-blur-md text-white border border-white/30 hover:border-white/50 transition-all duration-500 shadow-[0_0_30px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] relative overflow-hidden group"
                >
                  <TranslatedText text="Agende sua Visita" fromLang="pt-BR" />
                </Button>
              }
            />
            <Button
              size="lg"
              className="text-lg px-12 py-6 bg-primary text-white hover:bg-primary/90 transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]"
              onClick={() => navigate('/LuxuryShowcase')}
            >
              <TranslatedText text="Experiência Imersiva" fromLang="pt-BR" />
            </Button>
            
            {/* Login button removed from hero section as requested */}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="w-8 h-12 rounded-full border-2 border-white flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-white rounded-full animate-scroll" />
          </div>
        </motion.div>
      </section>

      {/* Featured Properties by Category */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto space-y-16">
          {/* Section Header */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-light tracking-wide">
              <TranslatedText text="Imóveis em Destaque" fromLang="pt-BR" />
            </h2>
            <p className="text-gray-600 font-light text-lg">
              <TranslatedText text="Seleção exclusiva das melhores propriedades" fromLang="pt-BR" />
            </p>
          </div>

          {/* Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Coberturas */}
            <motion.div
              className="group cursor-pointer"
              onClick={() => navigate('/Properties?category=cobertura')}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative h-64 overflow-hidden rounded-lg mb-4">
                <img
                  src="https://images.unsplash.com/photo-1604014237800-1c9102c219da?q=80&w=2940&auto=format&fit=crop"
                  alt="Cobertura"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-light text-center"><TranslatedText text="Coberturas" fromLang="pt-BR" /></h3>
            </motion.div>

            {/* Mansões */}
            <motion.div
              className="group cursor-pointer"
              onClick={() => navigate('/Properties?category=mansao')}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative h-64 overflow-hidden rounded-lg mb-4">
                <img
                  src="https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2940&auto=format&fit=crop"
                  alt="Mansão"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Castle className="w-12 h-12 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-light text-center"><TranslatedText text="Mansões" fromLang="pt-BR" /></h3>
            </motion.div>

            {/* Apartamentos de Alto Padrão */}
            <motion.div
              className="group cursor-pointer"
              onClick={() => navigate('/Properties?category=apartamento')}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative h-64 overflow-hidden rounded-lg mb-4">
                <img
                  src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2940&auto=format&fit=crop"
                  alt="Apartamento"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <Home className="w-12 h-12 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-light text-center"><TranslatedText text="Apartamentos de Alto Padrão" fromLang="pt-BR" /></h3>
            </motion.div>

            {/* Vista para o Lago */}
            <motion.div
              className="group cursor-pointer"
              onClick={() => navigate('/Properties?category=vista-lago')}
              whileHover={{ y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <div className="relative h-64 overflow-hidden rounded-lg mb-4">
                <img
                  src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2940&auto=format&fit=crop"
                  alt="Vista para o Lago"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <MapPin className="w-12 h-12 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-light text-center"><TranslatedText text="Vista para o Lago" fromLang="pt-BR" /></h3>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Premium Locations */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 space-y-16">
          {/* Section Header */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-light tracking-wide">
              <TranslatedText text="Localizações Premium em Brasília" fromLang="pt-BR" />
            </h2>
            <p className="text-gray-600 font-light text-lg">
              <TranslatedText text="As regiões mais valorizadas da capital" fromLang="pt-BR" />
            </p>
          </div>

          {/* Locations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Setor de Mansões Park Way */}
            <motion.div
              className="relative h-80 rounded-lg overflow-hidden cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              onClick={() => navigate('/Properties?location=park-way')}
            >
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2940&auto=format&fit=crop"
                alt="Park Way"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                <div className="text-white">
                  <h3 className="text-2xl font-light mb-2"><TranslatedText text="Setor de Mansões Park Way" fromLang="pt-BR" /></h3>
                  <p className="font-light opacity-80"><TranslatedText text="Exclusividade e privacidade em amplos terrenos" fromLang="pt-BR" /></p>
                </div>
              </div>
            </motion.div>

            {/* Lago Sul */}
            <motion.div
              className="relative h-80 rounded-lg overflow-hidden cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              onClick={() => navigate('/Properties?location=lago-sul')}
            >
              <img
                src="https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2940&auto=format&fit=crop"
                alt="Lago Sul"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                <div className="text-white">
                  <h3 className="text-2xl font-light mb-2"><TranslatedText text="Lago Sul" fromLang="pt-BR" /></h3>
                  <p className="font-light opacity-80"><TranslatedText text="Sofisticação à beira do Lago Paranoá" fromLang="pt-BR" /></p>
                </div>
              </div>
            </motion.div>

            {/* Setor Noroeste */}
            <motion.div
              className="relative h-80 rounded-lg overflow-hidden cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              onClick={() => navigate('/Properties?location=noroeste')}
            >
              <img
                src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2940&auto=format&fit=crop"
                alt="Noroeste"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                <div className="text-white">
                  <h3 className="text-2xl font-light mb-2"><TranslatedText text="Setor Noroeste" fromLang="pt-BR" /></h3>
                  <p className="font-light opacity-80"><TranslatedText text="O bairro mais moderno da capital" fromLang="pt-BR" /></p>
                </div>
              </div>
            </motion.div>

            {/* Sudoeste */}
            <motion.div
              className="relative h-80 rounded-lg overflow-hidden cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              onClick={() => navigate('/Properties?location=sudoeste')}
            >
              <img
                src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2940&auto=format&fit=crop"
                alt="Sudoeste"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-8">
                <div className="text-white">
                  <h3 className="text-2xl font-light mb-2"><TranslatedText text="Sudoeste" fromLang="pt-BR" /></h3>
                  <p className="font-light opacity-80"><TranslatedText text="Qualidade de vida e localização privilegiada" fromLang="pt-BR" /></p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-light tracking-wide">
              <TranslatedText text="Por que escolher a Ferola Private Brokers?" fromLang="pt-BR" />
            </h2>
            <p className="text-gray-600 font-light text-lg">
              <TranslatedText text="Excelência e expertise no mercado imobiliário de alto padrão" fromLang="pt-BR" />
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {/* Expertise */}
            <motion.div
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-light"><TranslatedText text="Expertise Comprovada" fromLang="pt-BR" /></h3>
              <p className="text-gray-600 font-light">
                <TranslatedText text="Mais de 20 anos de experiência no mercado imobiliário de alto padrão em Brasília" fromLang="pt-BR" />
              </p>
            </motion.div>

            {/* Exclusive Portfolio */}
            <motion.div
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <Key className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-light"><TranslatedText text="Portfólio Exclusivo" fromLang="pt-BR" /></h3>
              <p className="text-gray-600 font-light">
                <TranslatedText text="Acesso às propriedades mais exclusivas e desejadas da capital federal" fromLang="pt-BR" />
              </p>
            </motion.div>

            {/* Personalized Service */}
            <motion.div
              className="text-center space-y-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <UserCheck className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-light"><TranslatedText text="Atendimento Personalizado" fromLang="pt-BR" /></h3>
              <p className="text-gray-600 font-light">
                <TranslatedText text="Consultoria especializada e acompanhamento dedicado em todas as etapas" fromLang="pt-BR" />
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 space-y-16">
          {/* Section Header */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-light tracking-wide">
              <TranslatedText text="Mapa de Oportunidades" fromLang="pt-BR" />
            </h2>
            <p className="text-gray-600 font-light text-lg">
              <TranslatedText text="Explore as regiões mais valorizadas e encontre seu imóvel ideal" fromLang="pt-BR" />
            </p>
          </div>

          {/* Map */}
          <PropertyMap height="600px" />
        </div>
      </section>

      {/* Featured Properties Section */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <div className="space-y-12">
          <PropertyList className="" />
          <div className="flex justify-center">
            <Button
              size="lg"
              className="text-lg px-12 py-6 bg-primary text-white hover:bg-primary/90 transition-all shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.15)]"
              onClick={() => navigate('/Properties')}
            >
              <TranslatedText text="Explorar Todos os Imóveis" fromLang="pt-BR" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Contact Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-light"><TranslatedText text="Contato" fromLang="pt-BR" /></h4>
              <ul className="space-y-2 font-light">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  +55 61 3364-8018
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  contato@ferola.com.br
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  CLSW 304 Bloco B Sala 216, Sudoeste
                  Brasília - DF
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h4 className="text-lg font-light"><TranslatedText text="Links Rápidos" fromLang="pt-BR" /></h4>
              <ul className="space-y-2 font-light">
                <li>
                  <a href="#" className="hover:text-primary transition-colors"><TranslatedText text="Sobre Nós" fromLang="pt-BR" /></a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors"><TranslatedText text="Nossos Serviços" fromLang="pt-BR" /></a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors"><TranslatedText text="Blog" fromLang="pt-BR" /></a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors"><TranslatedText text="Contato" fromLang="pt-BR" /></a>
                </li>
              </ul>
            </div>

            {/* Properties */}
            <div className="space-y-4">
              <h4 className="text-lg font-light"><TranslatedText text="Imóveis" fromLang="pt-BR" /></h4>
              <ul className="space-y-2 font-light">
                <li>
                  <a href="#" className="hover:text-primary transition-colors"><TranslatedText text="Coberturas" fromLang="pt-BR" /></a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors"><TranslatedText text="Mansões" fromLang="pt-BR" /></a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors"><TranslatedText text="Apartamentos" fromLang="pt-BR" /></a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors"><TranslatedText text="Vista para o Lago" fromLang="pt-BR" /></a>
                </li>
              </ul>
            </div>

            {/* Social Media */}
            <div className="space-y-4">
              <h4 className="text-lg font-light"><TranslatedText text="Redes Sociais" fromLang="pt-BR" /></h4>
              <div className="flex gap-4">
                <a href="#" className="hover:text-primary transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  <Linkedin className="w-6 h-6" />
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  <Youtube className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center font-light text-sm text-gray-400">
            © {new Date().getFullYear()} Ferola Private Brokers. <TranslatedText text="Todos os direitos reservados." fromLang="pt-BR" />
          </div>
        </div>
      </footer>

      {/* Add custom scroll animation */}
      <style>{`
        .bg-radial-gradient {
          background: radial-gradient(circle at center,
            transparent 0%,
            rgba(0, 0, 0, 0.1) 50%,
            rgba(0, 0, 0, 0.2) 100%
          );
        }

        @keyframes scroll {
          0% { transform: translateY(0); }
          50% { transform: translateY(100%); }
          100% { transform: translateY(0); }
        }
        .animate-scroll {
          animation: scroll 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AppContent />
      </LanguageProvider>
    </ErrorBoundary>
  );
}
