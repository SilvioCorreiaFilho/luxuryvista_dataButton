import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { usePropertyStore } from "utils/propertyStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Bath,
  Bed,
  Building2,
  Check,
  Crown,
  ExternalLink,
  HeartIcon,
  Info,
  MapPin,
  Maximize2,
  Share2,
  Sparkles,
  TrendingUp,
  Video,
  Map as MapIcon,
  CircleDollarSign,
} from "lucide-react";
import { ImageGallery } from "components/ImageGallery";
import { Property } from "utils/property-types";
import React, { useState, useEffect } from "react";
import { TranslatedText } from "components/TranslatedText";
import { PropertyDetailWrapper } from "components/PropertyDetailWrapper";
import brain from "../brain";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface InvestmentMetricProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  percentage: string;
  color: "green" | "blue" | "purple" | "amber";
  subtitle: string;
}

function InvestmentMetric({
  icon,
  title,
  value,
  percentage,
  color,
  subtitle,
}: InvestmentMetricProps) {
  let textColor = "text-blue-500";
  let valueColor = "text-blue-600";
  let bgColor = "bg-blue-50";
  
  if (color === "green") {
    textColor = "text-green-500";
    valueColor = "text-green-600";
    bgColor = "bg-green-50";
  } else if (color === "purple") {
    textColor = "text-purple-500";
    valueColor = "text-purple-600";
    bgColor = "bg-purple-50";
  } else if (color === "amber") {
    textColor = "text-amber-500";
    valueColor = "text-amber-600";
    bgColor = "bg-amber-50";
  }

  return (
    <div className={`p-6 ${bgColor} rounded-lg hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-100`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={textColor}>{icon}</span>
          <span className="font-light tracking-wide">{title}</span>
        </div>
        <div className={`${textColor} font-medium tracking-wide`}>{percentage}</div>
      </div>
      <div className={`text-2xl font-light tracking-wider ${valueColor}`}>{value}</div>
      <div className="text-sm text-gray-500 font-light tracking-wide mt-1">{subtitle}</div>
    </div>
  );
}

// Main component with error boundary wrapper
export default function PropertyDetail() {
  return (
    <PropertyDetailWrapper>
      <PropertyDetailContent />
    </PropertyDetailWrapper>
  );
}

function PropertyDetailContent() {
  const [searchParams] = useSearchParams();
  const propertyId = searchParams.get("id");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"details" | "market" | "location">("details");

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all properties and filter by ID
  React.useEffect(() => {
    if (!propertyId) return;
    
    const fetchProperty = async () => {
      setLoading(true);
      try {
        // First try to fetch the property directly by ID
        try {
          console.log('Fetching property by ID:', propertyId);
          const directResponse = await brain.get_property2({ propertyId: propertyId });
          const directData = await directResponse.json();
          console.log('Direct property data:', directData);
          
          if (directData) {
            setProperty(directData);
            setLoading(false);
            return;
          }
        } catch (directErr) {
          console.log('Direct property fetch failed, trying fallback method', directErr);
        }
        
        // Fallback: Fetch all properties and find the one matching our ID
        console.log('Using fallback method to fetch property');
        const response = await brain.get_properties2({ page: 1, size: 50 });
        const data = await response.json();
        console.log('Properties data:', data);
        
        if (data.properties && data.properties.length > 0) {
          // Convert propertyId to string for comparison if necessary
          const foundProperty = data.properties.find(p => String(p.id) === String(propertyId));
          if (foundProperty) {
            console.log('Found property in results:', foundProperty);
            setProperty(foundProperty);
          } else {
            console.error('Property not found in results');
            setError('Property not found');
          }
        } else {
          console.error('No properties returned');
          setError('No properties available');
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to fetch property details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProperty();
  }, [propertyId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-xl mx-auto">
          <h1 className="text-2xl font-light tracking-wide mb-4">Carregando...</h1>
          <p className="text-gray-600 mb-8 font-light tracking-wide">Por favor aguarde enquanto carregamos os detalhes da propriedade.</p>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-xl mx-auto">
          <h1 className="text-2xl font-light tracking-wide mb-4">Propriedade não encontrada</h1>
          <p className="text-gray-600 mb-8 font-light tracking-wide">A propriedade que você está procurando não existe ou foi removida.</p>
          <Button 
            onClick={() => navigate("/")} 
            className="px-6 rounded-md py-2"
          >
            Voltar para a página inicial
          </Button>
        </div>
      </div>
    );
  }

  // Safely extract properties with fallbacks
  const title = property.title || 'Propriedade de Luxo';
  const description = property.description || 'Detalhes indisponíveis';
  const location = property.location || { name: 'Localização não especificada' };
  const property_type = property.property_type || { name: 'Imóvel de Luxo' };
  const price = property.price || 0;
  const bedrooms = property.bedrooms || 0;
  const bathrooms = property.bathrooms || 0;
  const area = property.area || 0;
  const features = Array.isArray(property.features) ? property.features : [];
  const images = property.images || [];
  const analysis = property.analysis || {};
  const virtual_tour_url = property.virtual_tour_url || '';
  const property_video_url = property.property_video_url || '';
  const drone_video_url = property.drone_video_url || '';

  const investmentMetrics = analysis?.investmentMetrics || [];
  
  // Create default metrics if none exist
  const defaultMetrics = [
    { type: "appreciation", value: "15% a.a.", percentage: "+15%" },
    { type: "rental", value: "R$ 95,000", percentage: "+8%" }
  ];
  
  // Use actual metrics or defaults
  const appreciationMetric = investmentMetrics[0] || defaultMetrics[0];
  const rentalMetric = investmentMetrics[1] || defaultMetrics[1];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Navigation */}
      <div className="mb-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-300 font-light tracking-wide"
        >
          <ArrowLeft className="h-4 w-4" />
          <TranslatedText text="Voltar" fromLang="pt-BR" />
        </button>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 gap-16 mb-16">
        {/* Image Gallery */}
        <div className="overflow-hidden rounded-xl bg-gray-50 relative">
          <div className="absolute top-4 left-4 z-10">
            <Badge variant="secondary" className="bg-white/90 text-primary hover:bg-white flex items-center 
              gap-1.5 backdrop-blur-sm border-none shadow px-2 py-1 font-light text-xs tracking-wider">
              <Crown className="w-3 h-3" />
              <TranslatedText text="Coleção Luxo" fromLang="pt-BR" />
            </Badge>
          </div>
          
          <div className="absolute top-4 right-4 z-10 flex space-x-2">
            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm border-none shadow">
              <Share2 className="h-4 w-4 text-gray-700" />
            </Button>
            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm border-none shadow">
              <HeartIcon className="h-4 w-4 text-gray-700" />
            </Button>
          </div>
          
          <ImageGallery images={images} className="rounded-none" />
        </div>

        {/* Property Details */}
        <div className="space-y-10">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5 font-light tracking-wider px-2 py-0.5">
                {property_type?.name || "Luxury Property"}
              </Badge>
              
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              
              <div className="text-gray-500 font-light tracking-wide flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {location.name}
              </div>
            </div>
            
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-light tracking-wide">{title}</h1>
              <div className="text-right">
                <div className="text-sm text-gray-500 font-light tracking-wide mb-1">Preço</div>
                <div className="text-2xl font-light tracking-wider text-primary">
                  R$ {typeof price === 'number' ? price.toLocaleString() : parseInt(price).toLocaleString()}
                </div>
              </div>
            </div>
            
            {/* Property quick stats */}
            <div className="flex gap-8 pt-2">
              <div className="flex items-center gap-1.5">
                <Bed className="h-4 w-4 text-primary/70" />
                <span className="font-light tracking-wide text-gray-700">{bedrooms} quartos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bath className="h-4 w-4 text-primary/70" />
                <span className="font-light tracking-wide text-gray-700">{bathrooms} banheiros</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Maximize2 className="h-4 w-4 text-primary/70" />
                <span className="font-light tracking-wide text-gray-700">{typeof area === 'number' ? area : parseInt(area)} m²</span>
              </div>
            </div>
          </div>

          {/* Interactive Media Links */}
          {(virtual_tour_url || property_video_url || drone_video_url) && (
            <div className="flex flex-wrap gap-4">
              {virtual_tour_url && (
                <Button 
                  variant="outline" 
                  className="px-4 py-2 h-10 font-light tracking-wide border-gray-200 text-gray-700 hover:bg-gray-50"
                  onClick={() => window.open(virtual_tour_url, '_blank')}
                >
                  <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                  Tour Virtual 360°
                </Button>
              )}
              
              {property_video_url && (
                <Button 
                  variant="outline" 
                  className="px-4 py-2 h-10 font-light tracking-wide border-gray-200 text-gray-700 hover:bg-gray-50"
                  onClick={() => window.open(property_video_url, '_blank')}
                >
                  <Video className="h-4 w-4 mr-2 text-blue-500" />
                  Vídeo do Imóvel
                </Button>
              )}
              
              {drone_video_url && (
                <Button 
                  variant="outline" 
                  className="px-4 py-2 h-10 font-light tracking-wide border-gray-200 text-gray-700 hover:bg-gray-50"
                  onClick={() => window.open(drone_video_url, '_blank')}
                >
                  <MapIcon className="h-4 w-4 mr-2 text-green-500" />
                  Vista Aérea
                </Button>
              )}
            </div>
          )}

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex space-x-8">
              <button
                className={`pb-2 px-1 font-light tracking-wide ${activeTab === "details" ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setActiveTab("details")}
              >
                <TranslatedText text="Detalhes" fromLang="pt-BR" />
              </button>
              <button
                className={`pb-2 px-1 font-light tracking-wide ${activeTab === "market" ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setActiveTab("market")}
              >
                <TranslatedText text="Análise de Mercado" fromLang="pt-BR" />
              </button>
              <button
                className={`pb-2 px-1 font-light tracking-wide ${activeTab === "location" ? "text-primary border-b-2 border-primary" : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setActiveTab("location")}
              >
                <TranslatedText text="Localização" fromLang="pt-BR" />
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {/* Details Tab */}
            {activeTab === "details" && (
              <div className="space-y-8">
                <div className="prose max-w-none font-light tracking-wide text-gray-700 leading-relaxed">
                  <p>{description}</p>
                </div>

                <div>
                  <h2 className="text-xl font-light tracking-wide mb-6"><TranslatedText text="Características" fromLang="pt-BR" /></h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                    {features.map((feature, index) => {
                      // Handle both string features and object features with name property
                      const featureName = typeof feature === 'string' 
                        ? feature 
                        : (feature && typeof feature === 'object' && 'name' in feature) 
                          ? feature.name 
                          : String(feature);
                      
                      return (
                        <div
                          key={`feature-${index}-${featureName?.substring(0, 20)}`}
                          className="flex items-center gap-2 text-gray-600 font-light tracking-wide"
                        >
                          <Check className="h-4 w-4 text-green-500" />
                          {featureName}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Market Analysis Tab */}
            {activeTab === "market" && (
              <div className="space-y-10">
                <div className="prose max-w-none font-light tracking-wide text-gray-700 leading-relaxed">
                  <p className="text-xl"><TranslatedText text="Análise Estratégica de Investimento" fromLang="pt-BR" /></p>
                  <p><TranslatedText text="Esta propriedade exclusiva representa uma oportunidade premium em um mercado de alta valorização. Nossa análise detalhada demonstra projeções financeiras e potencial de retorno sobre investimento excepcional." fromLang="pt-BR" /></p>
                </div>

                {/* Key Metrics Dashboard */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InvestmentMetric
                    icon={<TrendingUp className="h-5 w-5" />}
                    title={<TranslatedText text="Valorização Anual" fromLang="pt-BR" />}
                    value={appreciationMetric.value}
                    percentage={appreciationMetric.percentage}
                    color="green"
                    subtitle={<TranslatedText text="ao ano" fromLang="pt-BR" />}
                  />

                  <InvestmentMetric
                    icon={<CircleDollarSign className="h-5 w-5" />}
                    title={<TranslatedText text="Rentabilidade Mensal" fromLang="pt-BR" />}
                    value={rentalMetric.value}
                    percentage={rentalMetric.percentage}
                    color="blue"
                    subtitle={<TranslatedText text="ao mês" fromLang="pt-BR" />}
                  />
                  
                  <InvestmentMetric
                    icon={<Info className="h-5 w-5" />}
                    title={<TranslatedText text="Preço por m²" fromLang="pt-BR" />}
                    value={`R$ ${Math.round(parseFloat(price.toString()) / parseFloat(area.toString())).toLocaleString()}`}
                    percentage="Valorizado"
                    color="purple"
                    subtitle={<TranslatedText text="valor atual" fromLang="pt-BR" />}
                  />
                  
                  <InvestmentMetric
                    icon={<Building2 className="h-5 w-5" />}
                    title={<TranslatedText text="Potencial de Desenvolvimento" fromLang="pt-BR" />}
                    value="Excelente"
                    percentage="95%"
                    color="amber"
                    subtitle={<TranslatedText text="índice de confiança" fromLang="pt-BR" />}
                  />
                </div>
                
                {/* Appreciation Forecast Chart */}
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-light tracking-wide mb-6"><TranslatedText text="Projeção de Valorização em 5 Anos" fromLang="pt-BR" /></h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart
                      data={[
                        { year: '2025', value: parseInt(price.toString()) },
                        { year: '2026', value: parseInt(price.toString()) * 1.15 },
                        { year: '2027', value: parseInt(price.toString()) * 1.32 },
                        { year: '2028', value: parseInt(price.toString()) * 1.52 },
                        { year: '2029', value: parseInt(price.toString()) * 1.75 },
                        { year: '2030', value: parseInt(price.toString()) * 2.01 },
                      ]}
                      margin={{ top: 10, right: 30, left: 30, bottom: 10 }}
                    >
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis dataKey="year" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                      <YAxis 
                        tickFormatter={(value) => `R$ ${(value / 1000000).toFixed(1)}M`} 
                        tick={{ fontSize: 12 }} 
                        tickLine={false} 
                        axisLine={{ stroke: '#e5e7eb' }} 
                        domain={['dataMin - 1000000', 'dataMax + 2000000']}
                      />
                      <Tooltip 
                        formatter={(value) => [`R$ ${parseInt(value).toLocaleString()}`, 'Valor Projetado']} 
                        labelFormatter={(label) => `Ano: ${label}`}
                        contentStyle={{ borderRadius: '6px', borderColor: '#e5e7eb', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#6366f1" 
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                        strokeWidth={2} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Market Comparison Chart */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-light tracking-wide mb-6"><TranslatedText text="Comparativo de Mercado" fromLang="pt-BR" /></h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart
                        data={[
                          { name: 'Média do Bairro', value: parseInt(price.toString()) * 0.85 },
                          { name: 'Esta Propriedade', value: parseInt(price.toString()) },
                          { name: 'Imóveis Premium', value: parseInt(price.toString()) * 1.2 },
                        ]}
                        margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
                      >
                        <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9}/>
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.8}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                        <YAxis 
                          tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} 
                          tick={{ fontSize: 12 }} 
                          tickLine={false} 
                          axisLine={{ stroke: '#e5e7eb' }} 
                        />
                        <Tooltip 
                          formatter={(value) => [`R$ ${parseInt(value).toLocaleString()}`, 'Valor']} 
                          contentStyle={{ borderRadius: '6px', borderColor: '#e5e7eb', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
                        />
                        <Bar dataKey="value" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* ROI Comparison */}
                  <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-light tracking-wide mb-6"><TranslatedText text="Retorno Sobre Investimento" fromLang="pt-BR" /></h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <defs>
                          <linearGradient id="pieGradient1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#059669" stopOpacity={1}/>
                          </linearGradient>
                          <linearGradient id="pieGradient2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#4f46e5" stopOpacity={1}/>
                          </linearGradient>
                          <linearGradient id="pieGradient3" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
                            <stop offset="100%" stopColor="#d97706" stopOpacity={1}/>
                          </linearGradient>
                        </defs>
                        <Pie
                          data={[
                            { name: 'Valorização', value: 65 },
                            { name: 'Aluguel', value: 25 },
                            { name: 'Outros', value: 10 }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                          cornerRadius={5}
                        >
                          <Cell fill="url(#pieGradient1)" />
                          <Cell fill="url(#pieGradient2)" />
                          <Cell fill="url(#pieGradient3)" />
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value}%`, '']} 
                          contentStyle={{ borderRadius: '6px', borderColor: '#e5e7eb', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center mt-2 space-x-6">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 mr-2"></div>
                        <span className="text-sm text-gray-600"><TranslatedText text="Valorização" fromLang="pt-BR" /></span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 mr-2"></div>
                        <span className="text-sm text-gray-600"><TranslatedText text="Aluguel" fromLang="pt-BR" /></span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 mr-2"></div>
                        <span className="text-sm text-gray-600"><TranslatedText text="Outros" fromLang="pt-BR" /></span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Investment Timeline */}
                <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-light tracking-wide mb-6"><TranslatedText text="Evolução da Rentabilidade em 5 Anos" fromLang="pt-BR" /></h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart
                      data={[
                        { year: '2025', rental: 7200, passive: 0 },
                        { year: '2026', rental: 7776, passive: 5000 },
                        { year: '2027', rental: 8398, passive: 11000 },
                        { year: '2028', rental: 9070, passive: 18000 },
                        { year: '2029', rental: 9795, passive: 26000 },
                        { year: '2030', rental: 10579, passive: 35000 },
                      ]}
                      margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                    >
                      <defs>
                        <linearGradient id="colorRental" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#8b5cf6" stopOpacity={1}/>
                        </linearGradient>
                        <linearGradient id="colorPassive" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#10b981" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#059669" stopOpacity={1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                      <XAxis dataKey="year" tick={{ fontSize: 12 }} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                      <YAxis 
                        tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} 
                        tick={{ fontSize: 12 }} 
                        tickLine={false} 
                        axisLine={{ stroke: '#e5e7eb' }} 
                      />
                      <Tooltip 
                        formatter={(value, name) => [
                          `R$ ${parseInt(value).toLocaleString()}`, 
                          name === 'rental' ? 'Rendimento Mensal' : 'Valorização Realizada'
                        ]} 
                        contentStyle={{ borderRadius: '6px', borderColor: '#e5e7eb', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="rental" 
                        stroke="url(#colorRental)" 
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 1, stroke: '#6366f1', fill: '#ffffff' }}
                        activeDot={{ r: 6, strokeWidth: 1, stroke: '#6366f1', fill: '#ffffff' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="passive" 
                        stroke="url(#colorPassive)" 
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 1, stroke: '#10b981', fill: '#ffffff' }}
                        activeDot={{ r: 6, strokeWidth: 1, stroke: '#10b981', fill: '#ffffff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center mt-2 space-x-6">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 mr-2"></div>
                      <span className="text-sm text-gray-600"><TranslatedText text="Rendimento Mensal" fromLang="pt-BR" /></span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-green-600 mr-2"></div>
                      <span className="text-sm text-gray-600"><TranslatedText text="Valorização Realizada" fromLang="pt-BR" /></span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-6 rounded-lg border border-green-100">
                  <h3 className="text-lg font-medium text-green-700 mb-2"><TranslatedText text="Nota do Especialista" fromLang="pt-BR" /></h3>
                  <p className="text-green-700 font-light leading-relaxed"><TranslatedText text="Esta propriedade representa uma excelente oportunidade de investimento com potencial de valorização acima da média do mercado. A localização privilegiada e as características exclusivas do imóvel contribuem para uma perspectiva de alta valorização nos próximos anos." fromLang="pt-BR" /></p>
                </div>
              </div>
            )}

            {/* Location Tab */}
            {activeTab === "location" && (
              <div className="space-y-8">
                <div className="prose max-w-none font-light tracking-wide text-gray-700 leading-relaxed">
                  <p><TranslatedText text="Esta propriedade está localizada em uma região privilegiada com fácil acesso a restaurantes, parques, escolas e todas as conveniências urbanas." fromLang="pt-BR" /></p>
                </div>

                <div className="aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                  <div className="text-gray-400 font-light tracking-wide flex flex-col items-center">
                    <MapIcon className="h-8 w-8 mb-2" />
                    <span><TranslatedText text="Mapa indisponível no momento" fromLang="pt-BR" /></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button className="rounded-md flex-1 py-6 font-light tracking-wide">
              <TranslatedText text="Agendar Visita" fromLang="pt-BR" />
            </Button>
            <Button variant="outline" className="rounded-md flex-1 py-6 border-gray-200 font-light tracking-wide hover:bg-gray-50">
              <TranslatedText text="Solicitar Informações" fromLang="pt-BR" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
