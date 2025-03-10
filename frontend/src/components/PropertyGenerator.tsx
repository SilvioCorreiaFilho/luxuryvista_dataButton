import React, { useState } from 'react';
import { TranslatedText } from './TranslatedText';
import { toast } from 'sonner';
import brain from 'brain';
import { PropertyResponse } from '../types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Wand2, Cpu, Camera, Home, MapPin, Globe } from 'lucide-react';

interface PropertyGeneratorProps {
  onPropertyCreated: (property: PropertyResponse) => void;
}

export const PropertyGenerator: React.FC<PropertyGeneratorProps> = ({ onPropertyCreated }) => {
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(1);
  const [location, setLocation] = useState('Brasília');
  const [propertyType, setPropertyType] = useState('');
  const [language, setLanguage] = useState('pt-BR');
  const [useAdvanced, setUseAdvanced] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  
  const handleGenerate = async () => {
    try {
      setLoading(true);
      const response = await brain.generate_properties({
        body: {
          count,
          location,
          property_type: propertyType,
          language
        }
      });
      
      const data = await response.json();
      
      if (data.properties && data.properties.length > 0) {
        onPropertyCreated(data.properties[0]);
        toast.success(`Generated ${data.properties.length} properties successfully`);
      } else {
        toast.error('No properties were generated');
      }
    } catch (error) {
      console.error('Error generating properties:', error);
      toast.error('Failed to generate properties');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-light mb-2">
          <TranslatedText text="Gerador de Propriedades com IA" fromLang="pt-BR" />
        </h2>
        <p className="text-gray-500 mb-6">
          <TranslatedText 
            text="Crie listagens de propriedades de luxo detalhadas com nossa inteligência artificial. A IA gerará descrições, características, imagens e métricas de investimento." 
            fromLang="pt-BR" 
          />
        </p>
      </div>
      
      <Tabs defaultValue="basic">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            <TranslatedText text="Básico" fromLang="pt-BR" />
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            <TranslatedText text="Avançado" fromLang="pt-BR" />
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Home className="h-5 w-5 text-primary" />
                  <TranslatedText text="Propriedade" fromLang="pt-BR" />
                </div>
              </CardTitle>
              <CardDescription>
                <TranslatedText text="Configure os parâmetros básicos para a geração da propriedade" fromLang="pt-BR" />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="property-type">
                  <TranslatedText text="Tipo de Propriedade" fromLang="pt-BR" />
                </Label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger id="property-type">
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Qualquer tipo</SelectItem>
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
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger id="location">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Brasília">Brasília</SelectItem>
                    <SelectItem value="Miami">Miami</SelectItem>
                    <SelectItem value="Orlando">Orlando</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="language">
                  <TranslatedText text="Idioma" fromLang="pt-BR" />
                </Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                    <SelectItem value="fr-FR">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="count">
                    <TranslatedText text="Quantidade" fromLang="pt-BR" />
                  </Label>
                  <span className="text-sm text-gray-500">{count}</span>
                </div>
                <Slider
                  id="count"
                  value={[count]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={(value) => setCount(value[0])}
                  className="w-full"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleGenerate} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-2" />
                )}
                <TranslatedText text="Gerar Propriedade" fromLang="pt-BR" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-6 pt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-primary" />
                  <TranslatedText text="Configurações Avançadas" fromLang="pt-BR" />
                </div>
              </CardTitle>
              <CardDescription>
                <TranslatedText text="Personalize os parâmetros avançados para geração de propriedades" fromLang="pt-BR" />
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-prompt">
                  <TranslatedText text="Prompt Personalizado" fromLang="pt-BR" />
                </Label>
                <textarea
                  id="custom-prompt"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Descreva a propriedade que você deseja gerar..."
                  className="min-h-32 w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="use-advanced"
                  checked={useAdvanced}
                  onCheckedChange={setUseAdvanced}
                />
                <Label htmlFor="use-advanced">
                  <TranslatedText text="Usar prompt personalizado" fromLang="pt-BR" />
                </Label>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    <TranslatedText text="Configurações de Imagem" fromLang="pt-BR" />
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Switch id="high-quality-images" defaultChecked />
                    <Label htmlFor="high-quality-images" className="text-sm">
                      <TranslatedText text="Gerar imagens de alta qualidade" fromLang="pt-BR" />
                    </Label>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>
                    <TranslatedText text="Recursos Adicionais" fromLang="pt-BR" />
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="virtual-tour" defaultChecked />
                      <Label htmlFor="virtual-tour" className="text-sm">
                        <TranslatedText text="Tour Virtual" fromLang="pt-BR" />
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="property-video" defaultChecked />
                      <Label htmlFor="property-video" className="text-sm">
                        <TranslatedText text="Vídeo da Propriedade" fromLang="pt-BR" />
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="drone-footage" defaultChecked />
                      <Label htmlFor="drone-footage" className="text-sm">
                        <TranslatedText text="Filmagem com Drone" fromLang="pt-BR" />
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="investment-metrics" defaultChecked />
                      <Label htmlFor="investment-metrics" className="text-sm">
                        <TranslatedText text="Métricas de Investimento" fromLang="pt-BR" />
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleGenerate} 
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4 mr-2" />
                )}
                <TranslatedText text="Gerar Propriedade Personalizada" fromLang="pt-BR" />
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};