import { useNavigate } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Award, Building2, Crown, Download, Heart, MapPin, Share2, Square, Star, Target, TrendingUp } from "lucide-react";
import { VirtualTour } from './VirtualTour';
import { FloorPlan } from './FloorPlan';
import { SimilarProperties } from './SimilarProperties';
import { RecentlyViewed } from './RecentlyViewed';
import { ImageSlider } from "./ImageSlider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useLoadingState } from "utils/useLoadingState";
import { Property } from "utils/property-types";
import brain from "brain";
import { useCallback, useEffect, useState } from "react";
import { LightboxGallery } from "./LightboxGallery";
import { OptimizedImage } from './OptimizedImage';
import { VideoPlayer } from './VideoPlayer';
import { ScheduleModal } from './ScheduleModal';
import { toast } from "sonner";
import { isFavorite, toggleFavorite } from 'utils/favorites';
import { TranslatedText } from './TranslatedText';
import { useTranslation } from 'utils/useTranslation';
import { LanguageProvider } from 'utils/languageContext';
import { PropertyMap } from './PropertyMap';

import { Helmet } from 'react-helmet';
import media from 'utils/media';

interface Props {
  propertyId: string;
  className?: string;
}

export const PropertyDetailComponent = ({ propertyId, className = "" }: Props) => {
  return (
    <LanguageProvider>
      <PropertyDetailContent propertyId={propertyId} className={className} />
    </LanguageProvider>
  );
};

const PropertyDetailContent = ({ propertyId, className = "" }: Props) => {
  // State for retry mechanism
  const [retryCount, setRetryCount] = useState(0);

  const navigate = useNavigate();
  const { data: property, isLoading, error, setLoading, setError, setData } = 
    useLoadingState<Property>();

  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [galleryState, setGalleryState] = useState<{ open: boolean; initialIndex: number }>({ open: false, initialIndex: 0 });

  // Section loading states
  const [sectionLoading, setSectionLoading] = useState({
    marketTrends: false,
    appreciation: false,
    profitability: false,
    neighborhoodScore: false,
    virtualTour: false,
    floorPlans: false,
    similarProperties: false,
    recentlyViewed: false
  });

  useEffect(() => {
    if (!propertyId) return;
    setIsFavorited(isFavorite(propertyId));
  }, [propertyId]);

  const { translate } = useTranslation();

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      const title = await translate(property?.attributes.title || 'Imóvel de Luxo');
      const text = await translate(`Confira este imóvel incrível${property?.attributes.title ? `: ${property.attributes.title}` : ''}`);
      navigator.share({
        title,
        text,
        url: window.location.href,
      });
    }
  }, [property?.attributes.title, translate]);

  const handleSave = useCallback(() => {
    const isNowFavorited = toggleFavorite(propertyId);
    setIsFavorited(isNowFavorited);
    toast.success(
      <TranslatedText
        text={isNowFavorited ? 'Imóvel salvo nos favoritos' : 'Imóvel removido dos favoritos'}
      />
    );
  }, [propertyId]);

  const handleSchedule = useCallback(() => {
    setScheduleModalOpen(true);
  }, []);

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      setSectionLoading({
        marketTrends: true,
        appreciation: true,
        profitability: true,
        neighborhoodScore: true,
        virtualTour: true,
        floorPlans: true,
        similarProperties: true,
        recentlyViewed: true
      });
      try {
        const response = await brain.get_property2({property_id: propertyId});
        const data = await response.json();
        setData(data);
      } catch (err: any) {
        setError(err);
      } finally {
        setLoading(false);
        setSectionLoading({
          marketTrends: false,
          appreciation: false,
          profitability: false,
          neighborhoodScore: false,
          virtualTour: false,
          floorPlans: false
        });
      }
    };

    fetchProperty();
  }, [propertyId, setData, setError, setLoading, retryCount]);

  const handleRetry = useCallback(() => {
    setRetryCount(prev => prev + 1);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50" role="alert" aria-busy="true" aria-label="Carregando detalhes do imóvel">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500" role="alert" aria-live="assertive">
        <p className="text-lg font-semibold">
          <TranslatedText text="Erro ao carregar detalhes do imóvel" />
        </p>
        <p className="text-sm">{error?.message || 'Um erro inesperado ocorreu'}</p>
        <div className="flex gap-4 mt-4">
          <Button onClick={handleRetry} aria-label="Tentar carregar os dados novamente">
            <TranslatedText text="Tentar novamente" />
          </Button>
        </div>
          <Button variant="outline" onClick={() => navigate(-1)} aria-label="Voltar para página anterior">
          <TranslatedText text="Voltar" />
        </Button>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center h-64" role="alert" aria-live="polite">
        <p className="text-lg text-gray-500">
          <TranslatedText text="Imóvel não encontrado" />
        </p>
        <Button className="mt-4" onClick={() => navigate(-1)}>
          <TranslatedText text="Voltar" />
        </Button>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto px-6 ${className}`} role="main" aria-label="Detalhes do imóvel">
      {/* Back Button */}
      {/* SEO */}
      <Helmet>
        <title>{property.attributes.title} | Ferola Private Brokers</title>
        <meta name="description" content={property.attributes.description} />
        <meta property="og:title" content={property.attributes.title} />
        <meta property="og:description" content={property.attributes.description} />
        {property.attributes.images?.data?.[0] && (
          <meta
            property="og:image"
            content={media.getMediaUrl(property.attributes.images.data[0].attributes.url)}
          />
        )}
      </Helmet>

      {/* Back Button */}
      <Button
        variant="outline"
        onClick={() => navigate(-1)}
        className="mb-6 hover:bg-gray-100"
        aria-label="Voltar para página anterior"
      >
        ← <TranslatedText text="Voltar" />
      </Button>

      {/* Hero Section */}
      {property.attributes.coordinates && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">
            <TranslatedText text="Localização" />
          </h2>
          <PropertyMap
            properties={[{
              id: propertyId,
              title: property.attributes.title,
              price: property.attributes.price?.toLocaleString() || '0',
              images: property.attributes.images?.data?.map(img => media.getMediaUrl(img.attributes.url)) || [],
              coordinates: property.attributes.coordinates
            }]}
            center={property.attributes.coordinates}
            zoom={14}
            height="400px"
            className="rounded-xl overflow-hidden"
          />
        </div>
      )}

      {/* Hero Section */}
      {property.attributes.images?.data && property.attributes.images.data.length > 0 && (
        <div className="mb-12">
          <ImageSlider
            images={property.attributes.images.data}
            getImageUrl={media.getMediaUrl}
            propertyTitle={property.attributes.title}
            onSlideClick={() => setGalleryState({ open: true, initialIndex: 0 })}
            className="rounded-2xl"
            stats={{
              price: property.attributes.price,
              bedrooms: property.attributes.bedrooms,
              bathrooms: property.attributes.bathrooms,
              area: property.attributes.totalArea,
            }}
            status="Imóvel Premium"
            onShare={handleShare}
            onSave={handleSave}
            onSchedule={handleSchedule}
          />

          <div className="mt-8">
            <h1 className="text-4xl font-bold mb-4 tracking-tight">{property.attributes.title}</h1>
            <div className="flex items-center gap-6 text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{property.attributes.neighborhood}, {property.attributes.city}</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                <span>{property.attributes.propertyType}</span>
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              <div className="flex items-center gap-2">
                <Square className="w-5 h-5" />
                <span>{property.attributes.totalArea}m²</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Virtual Tour */}
      {property.attributes.virtualTourUrl && (
        <VirtualTour
          tourUrl={property.attributes.virtualTourUrl}
          isLoading={sectionLoading.virtualTour}
          className="mb-12"
        />
      )}

      {/* Floor Plans */}
      {property.attributes.floorPlans?.data && property.attributes.floorPlans.data.length > 0 && (
        <FloorPlan
          floorPlans={property.attributes.floorPlans.data.map(plan => ({
            id: plan.id,
            url: media.getMediaUrl(plan.attributes.url),
            title: plan.attributes.title || '',
            description: plan.attributes.description
          }))}
          isLoading={sectionLoading.floorPlans}
          className="mb-12"
        />
      )}

      {/* Video Tour */}
      {property.attributes.videoUrl && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">
            <TranslatedText text="Tour Virtual" />
          </h2>
          <VideoPlayer
            url={property.attributes.videoUrl}
            className="rounded-xl overflow-hidden"
            aspectRatio="16/9"
          />
        </div>
      )}

      {/* Gallery Grid */}
      {property.attributes.images?.data && property.attributes.images.data.length > 1 && (
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">
            <TranslatedText text="Galeria de Fotos" />
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {property.attributes.images.data.map((image, index) => (
              <div 
                key={image.id} 
                className="group relative aspect-[4/3] overflow-hidden rounded-xl cursor-pointer transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                role="button"
                tabIndex={0}
                onClick={() => setGalleryState({ open: true, initialIndex: index })}
                onKeyDown={(e) => e.key === 'Enter' && setGalleryState({ open: true, initialIndex: index })}
                aria-label={`Ver foto ${index + 1} em tela cheia: ${image.attributes.alternativeText || property.attributes.title}`}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 z-10" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20">
                  <p className="text-sm font-medium truncate">{image.attributes.alternativeText || 'Ver em tela cheia'}</p>
                </div>
                <OptimizedImage
                  src={media.getMediaUrl(image.attributes.url)}
                  alt={image.attributes.alternativeText || property.attributes.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  aspectRatio="4/3"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Gallery */}
      {property.attributes.images?.data && (
        <LightboxGallery
          images={property.attributes.images.data}
          getImageUrl={media.getMediaUrl}
          open={galleryState.open}
          initialIndex={galleryState.initialIndex}
          onClose={() => setGalleryState({ open: false, initialIndex: 0 })}
        />
      )}

      {/* Download Brochure */}
      {property.attributes.brochureUrl && (
        <div className="mb-12">
          <Button
            variant="outline"
            size="lg"
            className="w-full sm:w-auto flex items-center gap-2 hover:bg-primary/5"
            onClick={() => window.open(media.getMediaUrl(property.attributes.brochureUrl), '_blank')}
          >
            <Download className="w-5 h-5" />
            <TranslatedText text="Baixar Brochura do Imóvel" />
          </Button>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 mb-12">
        {/* Left Column: Property Details */}
        <div className="col-span-2 space-y-8">
          <Card className="overflow-hidden bg-white border-gray-100">
            <CardHeader>
              <CardTitle className="text-2xl">
                <TranslatedText text="Detalhes do Imóvel" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    <TranslatedText text="Preço" />
                  </span>
                  <span className="font-semibold">R$ {property.attributes.price?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    <TranslatedText text="Tipo" />
                  </span>
                  <span className="font-semibold">{property.attributes.propertyType}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    <TranslatedText text="Status" />
                  </span>
                  <span className="font-semibold">{property.attributes.status}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    <TranslatedText text="Área Total" />
                  </span>
                  <span className="font-semibold">{property.attributes.totalArea || 0}m²</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    <TranslatedText text="Área Construída" />
                  </span>
                  <span className="font-semibold">{property.attributes.builtArea || 0}m²</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">
                    <TranslatedText text="Ano de Construção" />
                  </span>
                  <span className="font-semibold">{property.attributes.yearBuilt || 'Não informado'}</span>
                </div>
              </div>

              {property.attributes.features?.data && property.attributes.features.data.length > 0 && (
                <div>
                  <Separator className="my-8" />
                  <h3 className="text-2xl font-semibold mb-6">
                    <TranslatedText text="Comodidades" />
                  </h3>
                  <div className="grid grid-cols-2 gap-x-16 gap-y-6">
                    {property.attributes.features.data.map((feature) => (
                      <div key={feature.id} className="flex items-center gap-4">
                        <Award className="w-6 h-6 text-primary" />
                        <div>
                          <h4 className="font-semibold">{feature.attributes.name}</h4>
                          <p className="text-sm text-gray-600">{feature.attributes.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Analysis */}
        <div className="space-y-8">
          {/* Market Trends Chart */}
          {property.attributes.analysis?.marketTrends && property.attributes.analysis.marketTrends.length > 0 && (
            <Card className="overflow-hidden bg-white border-gray-100">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <CardTitle>
                    <TranslatedText text="Tendências de Mercado" />
                  </CardTitle>
                </div>
                <CardDescription>
                  <TranslatedText text="Evolução do valor do imóvel" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sectionLoading.marketTrends ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-[200px] w-full" />
                  </div>
                ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={property.attributes.analysis.marketTrends}
                      margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                    >
                    <defs>
                      <linearGradient id="marketTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(79, 70, 229)" stopOpacity={0.4}/>
                        <stop offset="50%" stopColor="rgb(99, 102, 241)" stopOpacity={0.2}/>
                        <stop offset="100%" stopColor="rgb(129, 140, 248)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      vertical={false}
                      stroke="#E5E7EB"
                      strokeDasharray="8 8"
                      opacity={0.5}
                    />
                    <XAxis
                      dataKey="period"
                      stroke="#6B7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                      tick={{ fill: '#6B7280' }}
                    />
                    <YAxis
                      stroke="#6B7280"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                      tickFormatter={(value) => `R$ ${(value / 1000000).toFixed(1)}M`}
                      tick={{ fill: '#6B7280' }}
                    />
                    <Tooltip
                      formatter={(value: any) => [`R$ ${value.toLocaleString()}`, 'Valor do Imóvel']}
                      labelFormatter={(label) => `Ano ${label}`}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: 'none',
                        borderRadius: '0.75rem',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
                        padding: '1rem',
                        fontFamily: 'inherit',
                      }}
                      itemStyle={{
                        color: '#4F46E5',
                        fontWeight: 500,
                      }}
                      labelStyle={{
                        color: '#374151',
                        fontWeight: 600,
                        marginBottom: '0.5rem',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="rgb(79, 70, 229)"
                      strokeWidth={3}
                      fill="url(#marketTrend)"
                      dot={{
                        stroke: 'rgb(79, 70, 229)',
                        strokeWidth: 2,
                        r: 4,
                        fill: 'white',
                      }}
                      activeDot={{
                        stroke: 'rgb(79, 70, 229)',
                        strokeWidth: 2,
                        r: 6,
                        fill: 'white',
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
                )}
            </CardContent>
          </Card>
          )}

          {/* Appreciation Card */}
          {(sectionLoading.appreciation || property.attributes.appreciation !== undefined) && (
            <Card className="overflow-hidden bg-white border-gray-100">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <CardTitle>
                    <TranslatedText text="Valorização" />
                  </CardTitle>
                </div>
                <CardDescription>
                  <TranslatedText text="Crescimento anual do imóvel" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sectionLoading.appreciation ? (
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-[100px]" />
                    <Skeleton className="h-4 w-[60px]" />
                  </div>
                ) : (
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-green-600">{property.attributes.appreciation || 0}%</span>
                  <span className="text-base text-gray-600 ml-2">
                    <TranslatedText text="ao ano" />
                  </span>
                </div>
                )}
              </CardContent>
            </Card>
          )}

          {(sectionLoading.profitability || property.attributes.profitability !== undefined) && (
            <Card className="overflow-hidden bg-white border-gray-100">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <CardTitle>
                    <TranslatedText text="Rentabilidade" />
                  </CardTitle>
                </div>
                <CardDescription>
                  <TranslatedText text="Retorno mensal estimado" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sectionLoading.profitability ? (
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-[100px]" />
                    <Skeleton className="h-4 w-[60px]" />
                  </div>
                ) : (
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-blue-600">{property.attributes.profitability || 0}%</span>
                  <span className="text-base text-gray-600 ml-2">
                    <TranslatedText text="ao mês" />
                  </span>
                </div>
                )}
              </CardContent>
            </Card>
          )}

          {(sectionLoading.neighborhoodScore || property.attributes.neighborhoodScore) && (
            <Card className="overflow-hidden bg-white border-gray-100">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-600" />
                  <CardTitle>
                    <TranslatedText text="Avaliação do Bairro" />
                  </CardTitle>
                </div>
                <CardDescription>
                  <TranslatedText text="Análise da região" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sectionLoading.neighborhoodScore ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[80%]" />
                    <Skeleton className="h-4 w-[60%]" />
                    <Skeleton className="h-4 w-[70%]" />
                  </div>
                ) : (
                <div className="space-y-6">
                  {property.attributes.neighborhoodScore.safety !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        <TranslatedText text="Segurança" />
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress value={property.attributes.neighborhoodScore.safety || 0} className="w-24 h-1.5 bg-gray-100" />
                        <span className="text-sm text-gray-600">{property.attributes.neighborhoodScore.safety}/10</span>
                      </div>
                    </div>
                  )}
                  {property.attributes.neighborhoodScore.mobility !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        <TranslatedText text="Mobilidade" />
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress value={property.attributes.neighborhoodScore.mobility || 0} className="w-24 h-1.5 bg-gray-100" />
                        <span className="text-sm text-gray-600">{property.attributes.neighborhoodScore.mobility}/10</span>
                      </div>
                    </div>
                  )}
                  {property.attributes.neighborhoodScore.leisure !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        <TranslatedText text="Lazer" />
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress value={property.attributes.neighborhoodScore.leisure || 0} className="w-24 h-1.5 bg-gray-100" />
                        <span className="text-sm text-gray-600">{property.attributes.neighborhoodScore.leisure}/10</span>
                      </div>
                    </div>
                  )}
                  {property.attributes.neighborhoodScore.commerce !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">
                        <TranslatedText text="Comércio" />
                      </span>
                      <div className="flex items-center gap-2">
                        <Progress value={property.attributes.neighborhoodScore.commerce || 0} className="w-24 h-1.5 bg-gray-100" />
                        <span className="text-sm text-gray-600">{property.attributes.neighborhoodScore.commerce}/10</span>
                      </div>
                    </div>
                  )}
                </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Similar Properties */}
      <SimilarProperties
        currentPropertyId={propertyId}
        neighborhood={property.attributes.neighborhood}
        propertyType={property.attributes.propertyType}
        priceRange={[property.attributes.price * 0.8, property.attributes.price * 1.2]}
        isLoading={sectionLoading.similarProperties}
        className="mb-12"
      />

      {/* Recently Viewed */}
      <RecentlyViewed
        currentPropertyId={propertyId}
        isLoading={sectionLoading.recentlyViewed}
        className="mb-12"
      />

      {/* Schedule Modal */}
      <ScheduleModal
        open={scheduleModalOpen}
        onOpenChange={setScheduleModalOpen}
        propertyTitle={property.attributes.title}
      />
    </div>
  );
}
