import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TranslatedText } from '../components/TranslatedText';
import { toast } from 'sonner';
import brain from 'brain';
import { PropertyResponse } from '../types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, ArrowLeft, Trash2, X, Plus, Image, Home, BarChart3 } from 'lucide-react';

const PropertyEdit = () => {
  const navigate = useNavigate();
  const { id = 'new' } = useParams();
  const isNew = id === 'new';
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [property, setProperty] = useState<Partial<PropertyResponse>>({
    title: '',
    description: '',
    price: 0,
    area: 0,
    bedrooms: 0,
    bathrooms: 0,
    features: [],
    images: [],
    type: {
      name: 'House',
      description: 'Single-family house'
    },
    location: {
      name: 'Brasília',
      description: 'Capital of Brazil'
    },
    analysis: {
      investmentMetrics: [
        { type: 'Appreciation', value: '8%', percentage: '8%' },
        { type: 'ROI', value: '6.5%', percentage: '6.5%' },
        { type: 'Cap Rate', value: '5.2%', percentage: '5.2%' }
      ]
    }
  });
  
  const [newFeature, setNewFeature] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  
  // If editing an existing property, fetch it
  useEffect(() => {
    if (!isNew) {
      fetchProperty();
    }
  }, [id]);
  
  const fetchProperty = async () => {
    try {
      setLoading(true);
      const response = await brain.get_property2({ propertyId: id });
      const data = await response.json();
      
      setProperty(data);
    } catch (error) {
      console.error('Error fetching property:', error);
      toast.error('Failed to load property');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (field: string, value: any) => {
    // Ensure we're not setting empty strings as values
    const finalValue = value === '' ? undefined : value;
    setProperty(prev => ({
      ...prev,
      [field]: finalValue
    }));
  };
  
  const handleInvestmentMetricChange = (index: number, field: string, value: string) => {
    const newMetrics = [...(property.analysis?.investmentMetrics || [])];
    // Use undefined instead of empty string
    newMetrics[index] = { ...newMetrics[index], [field]: value.trim() === '' ? undefined : value };
    
    setProperty(prev => ({
      ...prev,
      analysis: {
        investmentMetrics: newMetrics
      }
    }));
  };
  
  const handleSave = async () => {
    // Basic validation
    if (!property.title?.trim() || !property.description?.trim() || !property.price) {
      toast.error('Please fill all required fields (title, description, price)');
      return;
    }
    
    try {
      setSaving(true);
      
      if (isNew) {
        const response = await brain.create_property({
          body: property as any
        });
        
        const data = await response.json();
        toast.success('Property created successfully');
        navigate(`/property/${data.id}`);
      } else {
        await brain.update_property({
          pathArgs: { property_id: id },
          body: property as any
        });
        
        toast.success('Property updated successfully');
        navigate(`/property/${id}`);
      }
    } catch (error) {
      console.error('Error saving property:', error);
      toast.error(`Failed to ${isNew ? 'create' : 'update'} property`);
    } finally {
      setSaving(false);
    }
  };
  
  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    
    setProperty(prev => ({
      ...prev,
      features: [...(prev.features || []), newFeature.trim()]
    }));
    
    setNewFeature('');
  };
  
  const handleRemoveFeature = (index: number) => {
    setProperty(prev => ({
      ...prev,
      features: (prev.features || []).filter((_, i) => i !== index)
    }));
  };
  
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    
    setProperty(prev => ({
      ...prev,
      images: [...(prev.images || []), { url: newImageUrl.trim() }]
    }));
    
    setNewImageUrl('');
  };
  
  const handleRemoveImage = (index: number) => {
    setProperty(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
          <p><TranslatedText text="Carregando propriedade..." fromLang="pt-BR" /></p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-light tracking-tight">
            {isNew ? (
              <TranslatedText text="Criar Nova Propriedade" fromLang="pt-BR" />
            ) : (
              <TranslatedText text="Editar Propriedade" fromLang="pt-BR" />
            )}
          </h1>
        </div>
        <Button 
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          <TranslatedText text="Salvar" fromLang="pt-BR" />
        </Button>
      </div>
      
      <Tabs defaultValue="basic">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            <TranslatedText text="Informações Básicas" fromLang="pt-BR" />
          </TabsTrigger>
          <TabsTrigger value="media" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            <TranslatedText text="Mídia" fromLang="pt-BR" />
          </TabsTrigger>
          <TabsTrigger value="analysis" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <TranslatedText text="Análise" fromLang="pt-BR" />
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>
                  <TranslatedText text="Detalhes da Propriedade" fromLang="pt-BR" />
                </CardTitle>
                <CardDescription>
                  <TranslatedText text="Informações essenciais sobre a propriedade" fromLang="pt-BR" />
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    <TranslatedText text="Título" fromLang="pt-BR" /> *
                  </Label>
                  <Input
                    id="title"
                    value={property.title || undefined}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Ex: Mansão de Luxo com Vista para o Lago"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">
                    <TranslatedText text="Descrição" fromLang="pt-BR" /> *
                  </Label>
                  <Textarea
                    id="description"
                    value={property.description || undefined}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Descreva a propriedade em detalhes..."
                    className="min-h-32"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">
                      <TranslatedText text="Preço (R$)" fromLang="pt-BR" /> *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={property.price || undefined}
                      onChange={(e) => handleChange('price', Number(e.target.value))}
                      placeholder="Ex: 5000000"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="area">
                      <TranslatedText text="Área (m²)" fromLang="pt-BR" /> *
                    </Label>
                    <Input
                      id="area"
                      type="number"
                      value={property.area || undefined}
                      onChange={(e) => handleChange('area', Number(e.target.value))}
                      placeholder="Ex: 500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms">
                      <TranslatedText text="Quartos" fromLang="pt-BR" /> *
                    </Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      value={property.bedrooms || undefined}
                      onChange={(e) => handleChange('bedrooms', Number(e.target.value))}
                      placeholder="Ex: 4"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms">
                      <TranslatedText text="Banheiros" fromLang="pt-BR" /> *
                    </Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      value={property.bathrooms || undefined}
                      onChange={(e) => handleChange('bathrooms', Number(e.target.value))}
                      placeholder="Ex: 3"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <TranslatedText text="Tipo e Localização" fromLang="pt-BR" />
                  </CardTitle>
                  <CardDescription>
                    <TranslatedText text="Defina o tipo de propriedade e localização" fromLang="pt-BR" />
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="property-type">
                      <TranslatedText text="Tipo de Propriedade" fromLang="pt-BR" />
                    </Label>
                    <Select 
                      value={property.type?.name || undefined}
                      onValueChange={(value) => handleChange('type', { name: value, description: value })}
                      defaultValue="House"
                    >
                      <SelectTrigger id="property-type">
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Mansion">Mansão</SelectItem>
                        <SelectItem value="Penthouse">Cobertura</SelectItem>
                        <SelectItem value="Villa">Vila</SelectItem>
                        <SelectItem value="Estate">Propriedade</SelectItem>
                        <SelectItem value="House">Casa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">
                      <TranslatedText text="Localização" fromLang="pt-BR" />
                    </Label>
                    <Select 
                      value={property.location?.name || undefined}
                      onValueChange={(value) => handleChange('location', { name: value, description: value })}
                      defaultValue="Brasília"
                    >
                      <SelectTrigger id="location">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Brasília">Brasília</SelectItem>
                        <SelectItem value="Miami">Miami</SelectItem>
                        <SelectItem value="Orlando">Orlando</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>
                    <TranslatedText text="Recursos e Características" fromLang="pt-BR" />
                  </CardTitle>
                  <CardDescription>
                    <TranslatedText text="Adicione recursos que destacam a propriedade" fromLang="pt-BR" />
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex">
                      <Input
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        placeholder="Ex: Piscina Infinity"
                        className="rounded-r-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddFeature()}
                      />
                      <Button 
                        onClick={handleAddFeature}
                        className="rounded-l-none"
                        type="button"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2 mt-2">
                      {property.features && property.features.length > 0 ? (
                        <ul className="space-y-1">
                          {property.features.map((feature, index) => (
                            <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                              <span>{feature}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full"
                                onClick={() => handleRemoveFeature(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">
                          <TranslatedText text="Nenhum recurso adicionado ainda" fromLang="pt-BR" />
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle>
                <TranslatedText text="Imagens da Propriedade" fromLang="pt-BR" />
              </CardTitle>
              <CardDescription>
                <TranslatedText text="Adicione fotos atraentes para destacar a propriedade" fromLang="pt-BR" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex">
                  <Input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="URL da imagem"
                    className="rounded-r-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddImage()}
                  />
                  <Button 
                    onClick={handleAddImage}
                    className="rounded-l-none"
                    type="button"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {property.images && property.images.length > 0 ? (
                    property.images.map((image, index) => (
                      <div key={index} className="relative group aspect-[4/3] bg-gray-100 rounded-md overflow-hidden">
                        <img 
                          src={image.url} 
                          alt={`Property image ${index + 1}`} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Error';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8 rounded-full"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center p-8 bg-gray-50 rounded-md">
                      <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">
                        <TranslatedText text="Nenhuma imagem adicionada ainda" fromLang="pt-BR" />
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  <TranslatedText text="Tour Virtual" fromLang="pt-BR" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    value={property.virtual_tour_url || undefined}
                    onChange={(e) => handleChange('virtual_tour_url', e.target.value)}
                    placeholder="URL do tour virtual"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  <TranslatedText text="Vídeo da Propriedade" fromLang="pt-BR" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    value={property.property_video_url || undefined}
                    onChange={(e) => handleChange('property_video_url', e.target.value)}
                    placeholder="URL do vídeo da propriedade"
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  <TranslatedText text="Filmagem com Drone" fromLang="pt-BR" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    value={property.drone_video_url || undefined}
                    onChange={(e) => handleChange('drone_video_url', e.target.value)}
                    placeholder="URL da filmagem com drone"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle>
                <TranslatedText text="Métricas de Investimento" fromLang="pt-BR" />
              </CardTitle>
              <CardDescription>
                <TranslatedText text="Configure métricas de análise de investimento para a propriedade" fromLang="pt-BR" />
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {(property.analysis?.investmentMetrics || []).map((metric, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`metric-type-${index}`}>
                        <TranslatedText text="Tipo de Métrica" fromLang="pt-BR" />
                      </Label>
                      <Input
                        id={`metric-type-${index}`}
                        value={metric.type || undefined}
                        onChange={(e) => handleInvestmentMetricChange(index, 'type', e.target.value)}
                        placeholder="Ex: ROI"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`metric-value-${index}`}>
                        <TranslatedText text="Valor" fromLang="pt-BR" />
                      </Label>
                      <Input
                        id={`metric-value-${index}`}
                        value={metric.value || undefined}
                        onChange={(e) => handleInvestmentMetricChange(index, 'value', e.target.value)}
                        placeholder="Ex: R$ 5.000"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor={`metric-percentage-${index}`}>
                        <TranslatedText text="Porcentagem" fromLang="pt-BR" />
                      </Label>
                      <Input
                        id={`metric-percentage-${index}`}
                        value={metric.percentage || undefined}
                        onChange={(e) => handleInvestmentMetricChange(index, 'percentage', e.target.value)}
                        placeholder="Ex: 8%"
                      />
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => {
                    const newMetrics = [...(property.analysis?.investmentMetrics || [])];
                    newMetrics.push({ type: undefined, value: undefined, percentage: undefined });
                    
                    setProperty(prev => ({
                      ...prev,
                      analysis: {
                        investmentMetrics: newMetrics
                      }
                    }));
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <TranslatedText text="Adicionar Métrica" fromLang="pt-BR" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PropertyEdit;