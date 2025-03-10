// React and routing imports
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// Third-party libraries
import brain from "brain";

// Types
import { PropertyResponse } from "types";

// UI components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight, Play, MapPin, Home, AreaChart, Bath, Bed, Volume2, ExternalLink } from "lucide-react";
import { Navbar } from "components/Navbar";
import { Toaster } from "sonner";
import { ErrorBoundary } from "../components/ErrorBoundary";

// Context and hooks
import { LanguageProvider } from "../utils/languageContext";
import { TranslatedText } from "../components/TranslatedText";
import { useTranslation } from "../utils/useTranslation";
import { useDocumentTitle } from "../utils/useDocumentTitle";

// Utility functions
const formatCurrency = (value: string | number): string => {
  if (!value && value !== 0) return "";
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(numValue);
};

const getEmbedUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  if (url.includes("youtube")) {
    const videoId = url.split("v=")[1]?.split("&")[0];
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0`;
  }
  return url;
};

const getVirtualTourEmbedUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  return url;
};

// Property List Component
type PropertyListProps = {
  properties: PropertyResponse[];
  activePropertyId: string | null;
  onPropertyClick: (property: PropertyResponse) => void;
};

const PropertyList = ({ properties, activePropertyId, onPropertyClick }: PropertyListProps) => {
  return (
    <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2">
      {properties.map((property) => (
        <Card
          key={property.id}
          className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-md ${
            activePropertyId === property.id ? 'ring-1 ring-black' : ''
          }`}
          onClick={() => onPropertyClick(property)}
        >
          <div className="flex items-start space-x-4">
            <div className="w-20 h-20 overflow-hidden rounded-sm">
              {property.images && property.images.length > 0 && (
                <img
                  src={property.images[0].url}
                  alt={property.title || 'Property Image'}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium truncate">{property.title}</h3>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <MapPin className="h-3 w-3 mr-1" />
                <span>
                  {property.location?.name}, {property.location?.description?.split(' ')[2] || ''}
                </span>
              </div>
              <div className="mt-2 font-light text-sm">{formatCurrency(property.price)}</div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

// Investment Metrics Component
type InvestmentMetricsProps = {
  metrics: Array<{
    type: string;
    value: string;
    percentage: string;
  }>;
};

const InvestmentMetrics = ({ metrics }: InvestmentMetricsProps) => {
  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-2xl font-light tracking-tight"><TranslatedText text="Análise de Investimento" /></h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="p-4 backdrop-blur-sm bg-white/10 border-none shadow-xl">
            <div className="flex flex-col space-y-2">
              <span className="text-sm font-light text-gray-500">{metric.type}</span>
              <span className="text-2xl font-light">{metric.value}</span>
              <span className="text-sm font-medium text-emerald-500">{metric.percentage}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Simple Features Component that only accepts string arrays
type FeaturesProps = {
  features: string[];
};

const Features = ({ features }: FeaturesProps) => {
  return (
    <div className="mt-8 space-y-4">
      <h3 className="text-2xl font-light tracking-tight"><TranslatedText text="Características de Luxo" /></h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Array.isArray(features) && features.map((feature, index) => {
          // Final safety check - only render if feature is a string
          if (typeof feature !== 'string') return null;
          return (
            <div key={index} className="flex items-start space-x-2">
              <div className="h-1 w-1 rounded-full bg-black mt-2" />
              <span className="text-sm font-light">{feature}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Safe feature wrapper with error boundary
const FeaturesSafe = ({ features }: { features: any[] }) => {
  // Guaranteed string array conversion
  const safeFeatures: string[] = [];
  
  if (Array.isArray(features)) {
    features.forEach(feature => {
      if (typeof feature === 'string') {
        safeFeatures.push(feature);
      } else if (feature && typeof feature === 'object') {
        if (typeof feature.name === 'string') {
          safeFeatures.push(feature.name);
        } else {
          safeFeatures.push('Luxury Feature');
        }
      } else {
        safeFeatures.push('Luxury Feature');
      }
    });
  }
  
  return (
    <ErrorBoundary 
      componentName="Features"
      fallback={
        <div className="mt-8 space-y-4">
          <h3 className="text-2xl font-light tracking-tight">Características de Luxo</h3>
          <div className="text-sm">Características não disponíveis</div>
        </div>
      }
    >
      <Features features={safeFeatures} />
    </ErrorBoundary>
  );
};

// Feature Wrapper that handles all the complex feature formats
export const extractFeatureNames = (features: any): string[] => {
  if (!features || !Array.isArray(features)) {
    return [];
  }
  
  return features.map(feature => {
    if (typeof feature === 'string') {
      return feature;
    }
    
    if (feature && typeof feature === 'object') {
      if (typeof feature.name === 'string') {
        return feature.name;
      }
    }
    
    return 'Luxury Feature';
  });
}

// Property Specs Component
type PropertySpecsProps = {
  type?: { name: string };
  bedrooms: number;
  bathrooms: number;
  area: number | string;
};

const PropertySpecs = ({ type, bedrooms, bathrooms, area }: PropertySpecsProps) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4">
      <div className="flex flex-col items-center justify-center p-3 rounded-md bg-gray-50">
        <Home className="h-5 w-5 text-gray-700 mb-1" />
        <span className="text-xs text-gray-500"><TranslatedText text="Tipo" /></span>
        <span className="text-sm font-medium">{type?.name || '-'}</span>
      </div>
      <div className="flex flex-col items-center justify-center p-3 rounded-md bg-gray-50">
        <Bed className="h-5 w-5 text-gray-700 mb-1" />
        <span className="text-xs text-gray-500"><TranslatedText text="Quartos" /></span>
        <span className="text-sm font-medium">{bedrooms}</span>
      </div>
      <div className="flex flex-col items-center justify-center p-3 rounded-md bg-gray-50">
        <Bath className="h-5 w-5 text-gray-700 mb-1" />
        <span className="text-xs text-gray-500"><TranslatedText text="Banheiros" /></span>
        <span className="text-sm font-medium">{bathrooms}</span>
      </div>
      <div className="flex flex-col items-center justify-center p-3 rounded-md bg-gray-50">
        <AreaChart className="h-5 w-5 text-gray-700 mb-1" />
        <span className="text-xs text-gray-500"><TranslatedText text="Área" /></span>
        <span className="text-sm font-medium">{area} m²</span>
      </div>
    </div>
  );
};

// Media Gallery Component
type MediaGalleryProps = {
  property: PropertyResponse;
  activeImageIndex: number;
  showVideo: boolean;
  showDroneVideo: boolean;
  showVirtualTour: boolean;
  onPrevImage: () => void;
  onNextImage: () => void;
  onSetActiveImageIndex: (index: number) => void;
  onToggleVideo: (show: boolean) => void;
  onToggleDroneVideo: (show: boolean) => void;
  onToggleVirtualTour: (show: boolean) => void;
};

const MediaGallery = ({
  property,
  activeImageIndex,
  showVideo,
  showDroneVideo,
  showVirtualTour,
  onPrevImage,
  onNextImage,
  onSetActiveImageIndex,
  onToggleVideo,
  onToggleDroneVideo,
  onToggleVirtualTour
}: MediaGalleryProps) => {
  const videoRef = useRef<HTMLIFrameElement>(null);

  const handleBackToGallery = () => {
    onToggleVideo(false);
    onToggleDroneVideo(false);
    onToggleVirtualTour(false);
  };

  const renderMediaControls = () => {
    return (
      <div className="absolute bottom-6 left-0 right-0 z-10 flex justify-center space-x-4">
        {property.virtual_tour_url && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onToggleVideo(false);
              onToggleDroneVideo(false);
              onToggleVirtualTour(true);
            }}
            className="bg-white/20 backdrop-blur-md hover:bg-white/30 border-none text-white"
          >
            <ExternalLink className="mr-1 h-4 w-4" /> <TranslatedText text="Tour 360°" />
          </Button>
        )}
        {property.property_video_url && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onToggleVideo(true);
              onToggleDroneVideo(false);
              onToggleVirtualTour(false);
            }}
            className="bg-white/20 backdrop-blur-md hover:bg-white/30 border-none text-white"
          >
            <Play className="mr-1 h-4 w-4" /> <TranslatedText text="Tour em Vídeo" />
          </Button>
        )}
        {property.drone_video_url && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onToggleVideo(false);
              onToggleDroneVideo(true);
              onToggleVirtualTour(false);
            }}
            className="bg-white/20 backdrop-blur-md hover:bg-white/30 border-none text-white"
          >
            <Volume2 className="mr-1 h-4 w-4" /> <TranslatedText text="Vista Aérea" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Main media display */}
      <div className="relative w-full h-[500px] overflow-hidden rounded-lg">
        {!showVideo && !showDroneVideo && !showVirtualTour ? (
          <>  
            {property.images && property.images.length > 0 && (
              <img
                src={property.images[activeImageIndex].url}
                alt={property.title || "Property Image"}
                className="w-full h-full object-cover"
              />
            )}
            {/* Image navigation */}
            <div className="absolute inset-0 flex items-center justify-between px-4">
              <Button
                size="icon"
                variant="ghost"
                onClick={onPrevImage}
                className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={onNextImage}
                className="h-10 w-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/30 text-white"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </div>

            {/* Media controls */}
            {renderMediaControls()}
          </>
        ) : showVideo ? (
          <>
            <iframe
              ref={videoRef}
              width="100%"
              height="100%"
              src={getEmbedUrl(property.property_video_url)}
              title="Property Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToGallery}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-md hover:bg-white/30 border-none text-white"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> <TranslatedText text="Voltar à Galeria" />
            </Button>
          </>
        ) : showDroneVideo ? (
          <>
            <iframe
              width="100%"
              height="100%"
              src={getEmbedUrl(property.drone_video_url)}
              title="Drone Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToGallery}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-md hover:bg-white/30 border-none text-white"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> <TranslatedText text="Voltar à Galeria" />
            </Button>
          </>
        ) : showVirtualTour ? (
          <>
            <iframe
              width="100%"
              height="100%"
              src={getVirtualTourEmbedUrl(property.virtual_tour_url)}
              title="Virtual Tour"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToGallery}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-md hover:bg-white/30 border-none text-white"
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> <TranslatedText text="Voltar à Galeria" />
            </Button>
          </>
        ) : null}
      </div>

      {/* Thumbnail navigation */}
      {property.images && property.images.length > 1 && !showVideo && !showDroneVideo && !showVirtualTour && (
        <div className="flex space-x-2 overflow-x-auto pb-2 mt-4">
          {property.images.map((image, index) => (
            <div
              key={index}
              className={`w-20 h-20 rounded-sm overflow-hidden cursor-pointer transition-all ${index === activeImageIndex ? 'ring-2 ring-black' : 'opacity-70'}`}
              onClick={() => onSetActiveImageIndex(index)}
            >
              <img
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

// Main component
const LuxuryShowcaseContent = () => {
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProperty, setActiveProperty] = useState<PropertyResponse | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [showDroneVideo, setShowDroneVideo] = useState(false);
  const [showVirtualTour, setShowVirtualTour] = useState(false);
  const videoRef = useRef<HTMLIFrameElement>(null);
  const navigate = useNavigate();
  const { translate } = useTranslation();
  
  // Set document title
  useDocumentTitle("Experiência Imersiva");

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const response = await brain.get_properties2({ page: 1, size: 5 });
        const data = await response.json();
        console.log("Properties:", data);
        if (data.properties && data.properties.length > 0) {
          setProperties(data.properties);
          setActiveProperty(data.properties[0]);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleGenerateProperties = async () => {
    setLoading(true);
    try {
      const response = await brain.generate_properties({
        count: 5,
        location: "Brasília",
        property_type: ""
      });
      const data = await response.json();
      console.log("Generated properties:", data);
      if (data.properties && data.properties.length > 0) {
        setProperties(prev => [...data.properties, ...prev]);
        setActiveProperty(data.properties[0]);
        setActiveImageIndex(0);
      }
    } catch (error) {
      console.error("Error generating properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyClick = (property: PropertyResponse) => {
    setActiveProperty(property);
    setActiveImageIndex(0);
    setShowVideo(false);
    setShowDroneVideo(false);
    setShowVirtualTour(false);
  };

  const handlePrevImage = () => {
    if (!activeProperty || !activeProperty.images) return;
    setActiveImageIndex((prev) =>
      prev === 0 ? activeProperty.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!activeProperty || !activeProperty.images) return;
    setActiveImageIndex((prev) =>
      prev === activeProperty.images.length - 1 ? 0 : prev + 1
    );
  };

  // Utility functions moved outside the component

  const renderInvestmentMetrics = () => {
    if (!activeProperty?.investment_metrics && !activeProperty?.analysis?.investmentMetrics) return null;
    
    // Use investment_metrics directly if available, otherwise use analysis.investmentMetrics
    const metrics = activeProperty.investment_metrics || 
                   (activeProperty.analysis?.investmentMetrics) || [];
    
    return <InvestmentMetrics metrics={metrics} />;
  };

  const renderFeatures = () => {
    if (!activeProperty?.features) return null;
    
    // Using the safe wrapper component with error boundary
    return <FeaturesSafe features={activeProperty.features} />;
  };

  // Handle media view toggling
  const handleBackToGallery = () => {
    setShowVideo(false);
    setShowDroneVideo(false);
    setShowVirtualTour(false);
  };

  // Media controls moved to MediaGallery component

  // URL utility functions moved outside the component

  if (loading && properties.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-2xl font-light"><TranslatedText text="Carregando imóveis de luxo..." /></div>
        <Button onClick={handleGenerateProperties} className="mt-8">
          <TranslatedText text="Gerar Imóveis de Luxo" />
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Toaster position="top-center" richColors />
      <Navbar variant="transparent" />
      
      {/* Custom top navigation */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="text-black hover:bg-black/5"
          >
            <ChevronLeft className="mr-1 h-4 w-4" /> <TranslatedText text="Voltar à Página Inicial" />
          </Button>
          <Button onClick={handleGenerateProperties} variant="outline" className="border-black text-black hover:bg-black/5">
            <TranslatedText text="Gerar Mais Imóveis" />
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-20 pb-10 px-4">
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property list */}
          <div className="lg:col-span-1 space-y-6">
            <h2 className="text-3xl font-light tracking-tight"><TranslatedText text="Imóveis de Luxo" /></h2>
            <p className="text-gray-600 font-light"><TranslatedText text="Descubra os mais exclusivos imóveis de luxo em Brasília" /></p>
            
            <PropertyList 
              properties={properties} 
              activePropertyId={activeProperty?.id || null} 
              onPropertyClick={handlePropertyClick} 
            />
          </div>

          {/* Property details */}
          <div className="lg:col-span-2">
            {activeProperty && (
              <div className="space-y-6">
                {/* Media Gallery Component */}
                <MediaGallery
                  property={activeProperty}
                  activeImageIndex={activeImageIndex}
                  showVideo={showVideo}
                  showDroneVideo={showDroneVideo}
                  showVirtualTour={showVirtualTour}
                  onPrevImage={handlePrevImage}
                  onNextImage={handleNextImage}
                  onSetActiveImageIndex={setActiveImageIndex}
                  onToggleVideo={setShowVideo}
                  onToggleDroneVideo={setShowDroneVideo}
                  onToggleVirtualTour={setShowVirtualTour}
                />

                {/* Property info */}
                <div className="space-y-4">
                  <h1 className="text-3xl font-light tracking-tight">{activeProperty.title}</h1>
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    {activeProperty.location?.description}
                  </div>
                  <div className="text-2xl font-light">{formatCurrency(activeProperty.price)}</div>

                  {/* Property specs */}
                  <PropertySpecs
                    type={activeProperty.type}
                    bedrooms={activeProperty.bedrooms}
                    bathrooms={activeProperty.bathrooms}
                    area={activeProperty.area}
                  />
                  
                  <Separator className="my-6" />
                  
                  {/* Description */}
                  <div>
                    <h3 className="text-2xl font-light tracking-tight"><TranslatedText text="Descrição" /></h3>
                    <div className="mt-2 font-light leading-relaxed text-gray-700 whitespace-pre-line">
                      {activeProperty.description}
                    </div>
                  </div>
                  
                  {/* Features */}
                  {renderFeatures()}
                  
                  {/* Investment metrics */}
                  {renderInvestmentMetrics()}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Default export
export default function LuxuryShowcase() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <LuxuryShowcaseContent />
      </LanguageProvider>
    </ErrorBoundary>
  );
}