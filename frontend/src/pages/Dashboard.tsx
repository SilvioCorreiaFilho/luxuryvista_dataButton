import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// State management and utilities
import { useAuthStore } from '../utils/auth-store';
import { toast } from 'sonner';
import { PropertyResponse } from '../types';
import { LanguageProvider } from '../utils/languageContext';

// Components
import { TranslatedText } from '../components/TranslatedText';
import { PropertyCard } from '../components/PropertyCard';
import { PropertyGenerator } from '../components/PropertyGenerator';
import { PropertySearch } from '../components/PropertySearch';
import { PropertyAnalytics } from '../components/PropertyAnalytics';
import { PropertyImageUpdater } from '../components/PropertyImageUpdater';
import { PropertyImageGenerator } from '../components/PropertyImageGenerator';
import { PropertyImageMigrator } from '../components/PropertyImageMigrator';

// UI components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

// Icons
import {
  PlusCircle,
  Search,
  BarChart3,
  Home,
  Trash2,
  Edit3,
  Filter,
  RefreshCw,
  Loader2,
  Image as ImageIcon,
  Wand2
} from 'lucide-react';

// Services
import brain from 'brain';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [properties, setProperties] = useState<PropertyResponse[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<PropertyResponse | null>(null);
  const [showImageGenerator, setShowImageGenerator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<PropertyResponse | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  
  // Load properties when component mounts
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    loadProperties();
  }, [user, navigate]);
  
  const loadProperties = async () => {
    try {
      setLoading(true);
      const response = await brain.get_properties2({ page: 1, size: 100 });
      const data = await response.json();
      setProperties(data.properties || []);
    } catch (error) {
      console.error('Error loading properties:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProperties();
    setRefreshing(false);
  };
  
  const openDeleteConfirmation = (property: PropertyResponse) => {
    setPropertyToDelete(property);
    setConfirmDialogOpen(true);
  };

  const handleDeleteProperty = async () => {
    if (!propertyToDelete || !propertyToDelete.id) return;
    
    try {
      setDeleting(propertyToDelete.id);
      await brain.delete_property({ property_id: propertyToDelete.id });
      toast.success('Property deleted successfully');
      setProperties(properties.filter(p => p.id !== propertyToDelete.id));
    } catch (error) {
      console.error('Error deleting property:', error);
      toast.error('Failed to delete property');
    } finally {
      setDeleting(null);
      setConfirmDialogOpen(false);
      setPropertyToDelete(null);
    }
  };
  
  const handleEditProperty = (property: PropertyResponse) => {
    navigate(`/property-edit/${property.id}`);
  };
  
  const handlePropertyCreated = (newProperty: PropertyResponse) => {
    setProperties([newProperty, ...properties]);
    toast.success('Property created successfully');
  };
  
  const handlePropertyView = (property: PropertyResponse) => {
    navigate(`/property/${property.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-light tracking-tight mb-2">
          <TranslatedText text="Painel de Gerenciamento de Propriedades" fromLang="pt-BR" />
        </h1>
        <p className="text-gray-500">
          <TranslatedText 
            text="Utilize ferramentas de IA para gerenciar propriedades de luxo com eficiência" 
            fromLang="pt-BR" 
          />
        </p>
      </header>
      
      <Tabs defaultValue="properties" className="w-full">
        <TabsList className="mb-8 grid grid-cols-5 h-auto gap-4">
          <TabsTrigger value="properties" className="py-3 flex gap-2 items-center">
            <Home className="h-4 w-4" />
            <TranslatedText text="Propriedades" fromLang="pt-BR" />
          </TabsTrigger>
          <TabsTrigger value="generate" className="py-3 flex gap-2 items-center">
            <PlusCircle className="h-4 w-4" />
            <TranslatedText text="Gerar" fromLang="pt-BR" />
          </TabsTrigger>
          <TabsTrigger value="search" className="py-3 flex gap-2 items-center">
            <Search className="h-4 w-4" />
            <TranslatedText text="Buscar" fromLang="pt-BR" />
          </TabsTrigger>
          <TabsTrigger value="analytics" className="py-3 flex gap-2 items-center">
            <BarChart3 className="h-4 w-4" />
            <TranslatedText text="Análises" fromLang="pt-BR" />
          </TabsTrigger>
          <TabsTrigger value="images" className="py-3 flex gap-2 items-center">
            <RefreshCw className="h-4 w-4" />
            <TranslatedText text="Atualizar Imagens" fromLang="pt-BR" />
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="properties" className="space-y-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium">
              <TranslatedText text="Gerenciar Propriedades" fromLang="pt-BR" />
            </h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/property-edit/new')}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                <TranslatedText text="Nova Propriedade" fromLang="pt-BR" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                {refreshing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                <TranslatedText text="Atualizar" fromLang="pt-BR" />
              </Button>
              <Button variant="ghost" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                <TranslatedText text="Filtrar" fromLang="pt-BR" />
              </Button>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                <TranslatedText text="Sem propriedades" fromLang="pt-BR" />
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                <TranslatedText 
                  text="Não há propriedades para gerenciar. Gere novas propriedades com IA ou crie manualmente." 
                  fromLang="pt-BR" 
                />
              </p>
              <Button onClick={() => navigate('/property-edit/new')}>
                <PlusCircle className="h-4 w-4 mr-2" />
                <TranslatedText text="Criar Propriedade" fromLang="pt-BR" />
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <div key={property.id} className="relative group">
                  <PropertyCard 
                    property={property} 
                    onClick={() => handlePropertyView(property)}
                    showFullDetails={false}
                  />
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      size="icon" 
                      variant="secondary"
                      className="h-8 w-8 rounded-full bg-white shadow-md hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditProperty(property);
                      }}
                    >
                      <Edit3 className="h-4 w-4 text-gray-700" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="secondary"
                      className="h-8 w-8 rounded-full bg-white shadow-md hover:bg-gray-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProperty(property);
                        setShowImageGenerator(true);
                      }}
                    >
                      <ImageIcon className="h-4 w-4 text-gray-700" />
                    </Button>
                    <Button 
                      size="icon" 
                      variant="destructive"
                      className="h-8 w-8 rounded-full bg-white shadow-md hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteConfirmation(property);
                      }}
                      disabled={deleting === property.id}
                    >
                      {deleting === property.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="generate">
          <PropertyGenerator onPropertyCreated={handlePropertyCreated} />
        </TabsContent>
        
        <TabsContent value="search">
          <PropertySearch onPropertySelected={setSelectedProperty} />
        </TabsContent>
        
        <TabsContent value="analytics">
          <PropertyAnalytics properties={properties} />
        </TabsContent>
        
        <TabsContent value="images">
          <div className="space-y-4">
            <h2 className="text-xl font-medium mb-4">
              <TranslatedText text="Atualizar Imagens de Propriedades" fromLang="pt-BR" />
            </h2>
            <p className="text-gray-500 mb-6">
              <TranslatedText 
                text="Regenere imagens para todas as propriedades de luxo em Brasília utilizando inteligência artificial. As imagens serão salvas automaticamente no Supabase." 
                fromLang="pt-BR" 
              />
            </p>
            
            <div className="grid grid-cols-1 gap-6">
              <PropertyImageMigrator />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PropertyImageUpdater />
                
                <Card className="w-full">
                <CardHeader>
                  <CardTitle>
                    <TranslatedText text="Assistente de Imagens IA" fromLang="pt-BR" />
                  </CardTitle>
                  <CardDescription>
                    <TranslatedText 
                      text="Melhore seus anúncios de propriedades com imagens geradas por IA" 
                      fromLang="pt-BR" 
                    />
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    <TranslatedText 
                      text="Nossas ferramentas de geração de imagens com IA podem ajudá-lo a criar imagens profissionais e de alta qualidade para seus anúncios de propriedades. Use o DALL-E 3 para gerar imagens fotorrealistas com base nas descrições das propriedades." 
                      fromLang="pt-BR" 
                    />
                  </p>
                  
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center space-x-2 rounded-md border p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <ImageIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          <TranslatedText text="Imagens de Propriedades Individuais" fromLang="pt-BR" />
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <TranslatedText text="Crie imagens personalizadas para propriedades específicas" fromLang="pt-BR" />
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 rounded-md border p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <Wand2 className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">
                          <TranslatedText text="Geração de Imagens em Massa" fromLang="pt-BR" />
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <TranslatedText text="Atualize todas as imagens de propriedades com um único clique" fromLang="pt-BR" />
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (properties.length > 0) {
                        setSelectedProperty(properties[0]);
                        setShowImageGenerator(true);
                      } else {
                        toast.error("No properties available for image generation");
                      }
                    }}
                  >
                    <ImageIcon className="mr-2 h-4 w-4" />
                    <TranslatedText text="Gerar Imagens para Propriedade" fromLang="pt-BR" />
                  </Button>
                </CardFooter>
              </Card>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Image Generator Dialog */}
      <Dialog open={showImageGenerator} onOpenChange={setShowImageGenerator}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Generate Images for {selectedProperty?.title}</DialogTitle>
            <DialogDescription>
              Create professional DALL-E AI images for this property
            </DialogDescription>
          </DialogHeader>
          
          {selectedProperty && (
            <PropertyImageGenerator 
              property={selectedProperty} 
              onImagesGenerated={(updatedProperty) => {
                // Update the property in the list
                setProperties(properties.map(p => 
                  p.id === updatedProperty.id ? updatedProperty : p
                ));
                toast.success("Property images updated successfully");
                setShowImageGenerator(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <TranslatedText text="Confirmar exclusão" fromLang="pt-BR" />
            </DialogTitle>
            <DialogDescription>
              <TranslatedText 
                text="Tem certeza que deseja excluir esta propriedade? Esta ação não pode ser desfeita." 
                fromLang="pt-BR" 
              />
              {propertyToDelete && (
                <p className="font-medium mt-2">{propertyToDelete.title}</p>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfirmDialogOpen(false)}
            >
              <TranslatedText text="Cancelar" fromLang="pt-BR" />
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteProperty}
              disabled={deleting === (propertyToDelete?.id || '')}
            >
              {deleting === (propertyToDelete?.id || '') ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              <TranslatedText text="Excluir" fromLang="pt-BR" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const DashboardWrapper = () => {
  return (
    <LanguageProvider>
      <Dashboard />
    </LanguageProvider>
  );
};

export default DashboardWrapper;