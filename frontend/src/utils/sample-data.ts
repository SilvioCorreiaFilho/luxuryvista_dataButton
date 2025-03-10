import { Property } from './property-types';

export const sampleProperties: Property[] = [
  {
  // Lago Sul Property
  id: '1',
  title: 'Mansão Contemporânea no Lago Sul',
  description: 'Luxuosa mansão contemporânea com acabamentos premium, vista deslumbrante para o Lago Paranoá e tecnologia de ponta. Localizada em uma das áreas mais nobres do Lago Sul, oferece privacidade total, píer privativo e conforto incomparável. Projeto arquitetônico premiado com integração perfeita entre áreas internas e externas.',
  price: 15800000,
  status: 'available',
  
  // Location
  address: 'SHIS QL 10 Conjunto 8',
  neighborhood: 'Lago Sul',
  city: 'Brasília',
  state: 'DF',
  country: 'Brasil',
  coordinates: { x: -15.8418, y: -47.8713 },
  
  // Details
  bedrooms: 5,
  bathrooms: 7,
  totalArea: 2800,
  builtArea: 1200,
  yearBuilt: 2022,
  
  // Additional Info
  propertyType: 'mansion',
  listingType: 'sale',
  
  // Timestamps
  createdAt: '2024-02-20T10:00:00Z',
  updatedAt: '2024-02-22T08:30:00Z',
  
  // Features
  features: [
    { id: '1', name: 'Píer Privativo', category: 'lazer', icon: '⛵', createdAt: '2024-02-20T10:00:00Z' },
    { id: '2', name: 'Piscina Infinita', category: 'lazer', icon: '🏊', createdAt: '2024-02-20T10:00:00Z' },
    { id: '3', name: 'Academia Privativa', category: 'lazer', icon: '🏋', createdAt: '2024-02-20T10:00:00Z' },
    { id: '4', name: 'Adega Climatizada', category: 'luxo', icon: '🍷', createdAt: '2024-02-20T10:00:00Z' },
    { id: '5', name: 'Sistema de Automação', category: 'tecnologia', icon: '📱', createdAt: '2024-02-20T10:00:00Z' },
    { id: '6', name: 'Elevador Privativo', category: 'conforto', icon: '🚉', createdAt: '2024-02-20T10:00:00Z' },
    { id: '7', name: 'Gerador Próprio', category: 'infraestrutura', icon: '⚡', createdAt: '2024-02-20T10:00:00Z' },
    { id: '8', name: 'Heliponto', category: 'luxo', icon: '🚁', createdAt: '2024-02-20T10:00:00Z' },
  ],
  
  // Images
  images: [
    {
      id: '1',
      propertyId: '1',
      url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2940&auto=format&fit=crop',
      description: 'Vista frontal da mansão com Lago Paranoá',
      isPrimary: true,
      orderIndex: 0,
      createdAt: '2024-02-20T10:00:00Z'
    },
    {
      id: '2',
      propertyId: '1',
      url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2940&auto=format&fit=crop',
      description: 'Área de lazer com vista para o Lago Paranoá',
      isPrimary: false,
      orderIndex: 1,
      createdAt: '2024-02-20T10:00:00Z'
    },
    {
      id: '3',
      propertyId: '1',
      url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=2940&auto=format&fit=crop',
      description: 'Sala de estar com pé direito duplo',
      isPrimary: false,
      orderIndex: 2,
      createdAt: '2024-02-20T10:00:00Z'
    },
  ],
  
  // Videos
  videos: [
    {
      id: '1',
      propertyId: '1',
      url: 'https://example.com/video1.mp4',
      title: 'Tour Virtual 360°',
      description: 'Explore cada detalhe desta mansão espetacular',
      type: 'virtual_tour',
      createdAt: '2024-02-20T10:00:00Z'
    },
  ],
  
  // Analysis Data
  analysis: {
    neighborhoodScores: [
      {
        category: 'Segurança',
        score: 9.8,
        description: 'Área diplomática com segurança reforçada 24h e controle de acesso'
      },
      {
        category: 'Localização',
        score: 9.9,
        description: 'Área nobre do Lago Sul, próximo aos principais centros diplomáticos'
      },
      {
        category: 'Infraestrutura',
        score: 9.5,
        description: 'Infraestrutura urbana de alto padrão e serviços exclusivos'
      },
      {
        category: 'Qualidade de Vida',
        score: 9.7,
        description: 'Área verde preservada, vista para o lago e baixa densidade populacional'
      },
    ],
    investmentMetrics: [
      {
        label: 'Valorização Anual',
        value: 'R$ 2.2M',
        trend: 'up',
        percentage: '+14%'
      },
      {
        label: 'Rentabilidade',
        value: 'R$ 65K/mês',
        trend: 'up',
        percentage: '+10%'
      },
      {
        label: 'Demanda de Mercado',
        value: 'Alta',
        trend: 'stable'
      },
      {
        label: 'ROI Projetado',
        value: '15%',
        trend: 'up',
        percentage: '+3%'
      },
    ],
    historicalData: [
      { year: '2019', value: 9800000 },
      { year: '2020', value: 11200000 },
      { year: '2021', value: 12800000 },
      { year: '2022', value: 14500000 },
      { year: '2023', value: 15800000 },
    ],
  },
}, {
  // Lago Norte Property
  id: '2',
  title: 'Residência de Alto Padrão no Lago Norte',
  description: 'Excepcional residência com vista privilegiada para o Lago Paranoá. Projeto arquitetônico moderno com materiais nobres, amplos espaços de convivência e acabamento refinado. Sistema de energia solar e automação completa.',
  price: 12800000,
  status: 'available',
  
  // Location
  address: 'SHIN QL 11 Conjunto 1',
  neighborhood: 'Lago Norte',
  city: 'Brasília',
  state: 'DF',
  country: 'Brasil',
  coordinates: { x: -15.7418, y: -47.8513 },
  
  // Details
  bedrooms: 4,
  bathrooms: 6,
  totalArea: 2200,
  builtArea: 980,
  yearBuilt: 2021,
  
  // Additional Info
  propertyType: 'house',
  listingType: 'sale',
  
  // Timestamps
  createdAt: '2024-02-20T10:00:00Z',
  updatedAt: '2024-02-22T08:30:00Z',
  
  // Features
  features: [
    { id: '1', name: 'Vista para o Lago', category: 'lazer', icon: '🌌', createdAt: '2024-02-20T10:00:00Z' },
    { id: '2', name: 'Energia Solar', category: 'sustentabilidade', icon: '☀️', createdAt: '2024-02-20T10:00:00Z' },
    { id: '3', name: 'Home Theater', category: 'lazer', icon: '🎥', createdAt: '2024-02-20T10:00:00Z' },
    { id: '4', name: 'Spa', category: 'luxo', icon: '🛀', createdAt: '2024-02-20T10:00:00Z' },
    { id: '5', name: 'Sistema de Automação', category: 'tecnologia', icon: '📱', createdAt: '2024-02-20T10:00:00Z' },
    { id: '6', name: 'Área Gourmet', category: 'lazer', icon: '🍽', createdAt: '2024-02-20T10:00:00Z' },
  ],
  
  // Images
  images: [
    {
      id: '1',
      propertyId: '2',
      url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2940&auto=format&fit=crop',
      description: 'Fachada contemporânea',
      isPrimary: true,
      orderIndex: 0,
      createdAt: '2024-02-20T10:00:00Z'
    },
    {
      id: '2',
      propertyId: '2',
      url: 'https://images.unsplash.com/photo-1600607687644-c7171b42498f?q=80&w=2940&auto=format&fit=crop',
      description: 'Sala de estar integrada',
      isPrimary: false,
      orderIndex: 1,
      createdAt: '2024-02-20T10:00:00Z'
    },
    {
      id: '3',
      propertyId: '2',
      url: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?q=80&w=2940&auto=format&fit=crop',
      description: 'Área de lazer',
      isPrimary: false,
      orderIndex: 2,
      createdAt: '2024-02-20T10:00:00Z'
    },
  ],
  
  // Analysis Data
  analysis: {
    neighborhoodScores: [
      {
        category: 'Segurança',
        score: 9.6,
        description: 'Área residencial exclusiva com segurança privada 24h'
      },
      {
        category: 'Localização',
        score: 9.7,
        description: 'Vista privilegiada para o Lago Paranoá e fácil acesso'
      },
      {
        category: 'Infraestrutura',
        score: 9.4,
        description: 'Completa infraestrutura urbana e serviços de qualidade'
      },
      {
        category: 'Qualidade de Vida',
        score: 9.8,
        description: 'Região arborizada com baixa densidade populacional'
      },
    ],
    investmentMetrics: [
      {
        label: 'Valorização Anual',
        value: 'R$ 1.8M',
        trend: 'up',
        percentage: '+15%'
      },
      {
        label: 'Rentabilidade',
        value: 'R$ 52K/mês',
        trend: 'up',
        percentage: '+9%'
      },
      {
        label: 'Demanda de Mercado',
        value: 'Alta',
        trend: 'stable'
      },
      {
        label: 'ROI Projetado',
        value: '14%',
        trend: 'up',
        percentage: '+2.5%'
      },
    ],
    historicalData: [
      { year: '2019', value: 7800000 },
      { year: '2020', value: 9100000 },
      { year: '2021', value: 10500000 },
      { year: '2022', value: 11900000 },
      { year: '2023', value: 12800000 },
    ],
  },
}, {
  // Park Way Property
  id: '3',
  title: 'Mansão Contemporânea no Park Way',
  description: 'Extraordinária mansão em terreno de 20.000m² no Park Way. Design contemporâneo com interiores sofisticados, paisagismo exuberante e privacidade total. Ideal para quem busca exclusividade e contato com a natureza sem abrir mão do conforto urbano.',
  price: 18500000,
  status: 'available',
  
  // Location
  address: 'SMPW Quadra 26 Conjunto 2',
  neighborhood: 'Park Way',
  city: 'Brasília',
  state: 'DF',
  country: 'Brasil',
  coordinates: { x: -15.9018, y: -47.9613 },
  
  // Details
  bedrooms: 6,
  bathrooms: 8,
  totalArea: 20000,
  builtArea: 1500,
  yearBuilt: 2023,
  
  // Additional Info
  propertyType: 'mansion',
  listingType: 'sale',
  
  // Timestamps
  createdAt: '2024-02-20T10:00:00Z',
  updatedAt: '2024-02-22T08:30:00Z',
  
  // Features
  features: [
    { id: '1', name: 'Campo de Tênis', category: 'lazer', icon: '🎾', createdAt: '2024-02-20T10:00:00Z' },
    { id: '2', name: 'Casa de Hóspedes', category: 'conforto', icon: '🏡', createdAt: '2024-02-20T10:00:00Z' },
    { id: '3', name: 'Adega Climatizada', category: 'luxo', icon: '🍷', createdAt: '2024-02-20T10:00:00Z' },
    { id: '4', name: 'Cinema Privativo', category: 'lazer', icon: '🍿', createdAt: '2024-02-20T10:00:00Z' },
    { id: '5', name: 'Heliponto', category: 'luxo', icon: '🚁', createdAt: '2024-02-20T10:00:00Z' },
    { id: '6', name: 'Pomar', category: 'lazer', icon: '🌾', createdAt: '2024-02-20T10:00:00Z' },
  ],
  
  // Images
  images: [
    {
      id: '1',
      propertyId: '3',
      url: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?q=80&w=2940&auto=format&fit=crop',
      description: 'Vista aérea da propriedade',
      isPrimary: true,
      orderIndex: 0,
      createdAt: '2024-02-20T10:00:00Z'
    },
    {
      id: '2',
      propertyId: '3',
      url: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?q=80&w=2940&auto=format&fit=crop',
      description: 'Área social integrada',
      isPrimary: false,
      orderIndex: 1,
      createdAt: '2024-02-20T10:00:00Z'
    },
    {
      id: '3',
      propertyId: '3',
      url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2940&auto=format&fit=crop',
      description: 'Sala de estar com pé direito duplo',
      isPrimary: false,
      orderIndex: 2,
      createdAt: '2024-02-20T10:00:00Z'
    },
  ],
  
  // Analysis Data
  analysis: {
    neighborhoodScores: [
      {
        category: 'Segurança',
        score: 9.7,
        description: 'Condomínio fechado com segurança reforçada'
      },
      {
        category: 'Localização',
        score: 9.5,
        description: 'Área nobre com lotes amplos e privacidade total'
      },
      {
        category: 'Infraestrutura',
        score: 9.3,
        description: 'Excelente infraestrutura e proximidade com amenidades'
      },
      {
        category: 'Qualidade de Vida',
        score: 9.9,
        description: 'Ambiente bucólico com muito verde e tranquilidade'
      },
    ],
    investmentMetrics: [
      {
        label: 'Valorização Anual',
        value: 'R$ 2.5M',
        trend: 'up',
        percentage: '+16%'
      },
      {
        label: 'Rentabilidade',
        value: 'R$ 75K/mês',
        trend: 'up',
        percentage: '+11%'
      },
      {
        label: 'Demanda de Mercado',
        value: 'Muito Alta',
        trend: 'up'
      },
      {
        label: 'ROI Projetado',
        value: '16%',
        trend: 'up',
        percentage: '+3.5%'
      },
    ],
    historicalData: [
      { year: '2019', value: 11200000 },
      { year: '2020', value: 13500000 },
      { year: '2021', value: 15200000 },
      { year: '2022', value: 17100000 },
      { year: '2023', value: 18500000 },
    ],
  },
}];

