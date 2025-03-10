import React, { useMemo } from 'react';
import { TranslatedText } from './TranslatedText';
import { PropertyResponse } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart3, TrendingUp, Map, ArrowUpRight, DollarSign, Home } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface PropertyAnalyticsProps {
  properties: PropertyResponse[];
}

export const PropertyAnalytics: React.FC<PropertyAnalyticsProps> = ({ properties }) => {
  // Prepare data for price range distribution chart
  const priceRangeData = useMemo(() => {
    const ranges = [
      { name: 'Até R$ 1M', min: 0, max: 1000000, count: 0 },
      { name: 'R$ 1M - R$ 3M', min: 1000000, max: 3000000, count: 0 },
      { name: 'R$ 3M - R$ 5M', min: 3000000, max: 5000000, count: 0 },
      { name: 'R$ 5M - R$ 8M', min: 5000000, max: 8000000, count: 0 },
      { name: 'R$ 8M - R$ 12M', min: 8000000, max: 12000000, count: 0 },
      { name: 'Acima de R$ 12M', min: 12000000, max: Infinity, count: 0 },
    ];
    
    properties.forEach(property => {
      const price = typeof property.price === 'string' 
        ? parseFloat(property.price.replace(/[^0-9.]/g, '')) 
        : property.price || 0;
        
      const range = ranges.find(r => price >= r.min && price < r.max);
      if (range) range.count++;
    });
    
    return ranges;
  }, [properties]);
  
  // Prepare property type distribution chart
  const propertyTypeData = useMemo(() => {
    const typeCount: Record<string, number> = {};
    
    properties.forEach(property => {
      const type = property.type?.name || 'Unknown';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    
    return Object.entries(typeCount).map(([name, value]) => ({ name, value }));
  }, [properties]);
  
  // Prepare location distribution chart
  const locationData = useMemo(() => {
    const locationCount: Record<string, number> = {};
    
    properties.forEach(property => {
      const location = property.location?.name || 'Unknown';
      locationCount[location] = (locationCount[location] || 0) + 1;
    });
    
    return Object.entries(locationCount).map(([name, value]) => ({ name, value }));
  }, [properties]);
  
  // Get average metrics
  const averageMetrics = useMemo(() => {
    if (properties.length === 0) return { price: 0, area: 0, bedrooms: 0, bathrooms: 0 };
    
    return properties.reduce(
      (acc, property) => {
        const price = typeof property.price === 'string' 
          ? parseFloat(property.price.replace(/[^0-9.]/g, '')) 
          : property.price || 0;
          
        const area = typeof property.area === 'string' 
          ? parseFloat(property.area.replace(/[^0-9.]/g, '')) 
          : property.area || 0;

        return {
          price: acc.price + price,
          area: acc.area + area,
          bedrooms: acc.bedrooms + (property.bedrooms || 0),
          bathrooms: acc.bathrooms + (property.bathrooms || 0)
        };
      },
      { price: 0, area: 0, bedrooms: 0, bathrooms: 0 }
    );
  }, [properties]);
  
  // Format metrics as averages
  const averages = useMemo(() => {
    const count = properties.length || 1; // Avoid division by zero
    
    return {
      price: (averageMetrics.price / count).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0
      }),
      area: Math.round(averageMetrics.area / count),
      bedrooms: (averageMetrics.bedrooms / count).toFixed(1),
      bathrooms: (averageMetrics.bathrooms / count).toFixed(1)
    };
  }, [averageMetrics, properties.length]);
  
  // Pie chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFC', '#FF6B8B'];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-light mb-2">
          <TranslatedText text="Análise de Portfólio" fromLang="pt-BR" />
        </h2>
        <p className="text-gray-500 mb-6">
          <TranslatedText 
            text="Visualize métricas e tendências do seu portfólio de propriedades de luxo" 
            fromLang="pt-BR" 
          />
        </p>
      </div>
      
      {properties.length === 0 ? (
        <Card className="text-center py-12 bg-gray-50">
          <CardContent>
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">
              <TranslatedText text="Sem dados para análise" fromLang="pt-BR" />
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              <TranslatedText 
                text="Adicione propriedades ao seu portfólio para visualizar análises e tendências de mercado." 
                fromLang="pt-BR" 
              />
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500 font-normal">
                  <TranslatedText text="Preço Médio" fromLang="pt-BR" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-semibold">{averages.price}</div>
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500 font-normal">
                  <TranslatedText text="Área Média" fromLang="pt-BR" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-semibold">{averages.area} m²</div>
                  <Home className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500 font-normal">
                  <TranslatedText text="Quartos (média)" fromLang="pt-BR" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-semibold">{averages.bedrooms}</div>
                  <Home className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500 font-normal">
                  <TranslatedText text="Banheiros (média)" fromLang="pt-BR" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="text-2xl font-semibold">{averages.bathrooms}</div>
                  <Home className="h-5 w-5 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts */}
          <Tabs defaultValue="price">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="price" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <TranslatedText text="Preço" fromLang="pt-BR" />
              </TabsTrigger>
              <TabsTrigger value="type" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <TranslatedText text="Tipo" fromLang="pt-BR" />
              </TabsTrigger>
              <TabsTrigger value="location" className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                <TranslatedText text="Localização" fromLang="pt-BR" />
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="price">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <TranslatedText text="Distribuição por Faixa de Preço" fromLang="pt-BR" />
                  </CardTitle>
                  <CardDescription>
                    <TranslatedText text="Número de propriedades por faixa de preço" fromLang="pt-BR" />
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={priceRangeData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                        <YAxis allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" name="Propriedades" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="type">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <TranslatedText text="Distribuição por Tipo de Propriedade" fromLang="pt-BR" />
                  </CardTitle>
                  <CardDescription>
                    <TranslatedText text="Proporção de cada tipo de propriedade no portfólio" fromLang="pt-BR" />
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={propertyTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {propertyTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Legend verticalAlign="bottom" height={36} />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="location">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <TranslatedText text="Distribuição por Localização" fromLang="pt-BR" />
                  </CardTitle>
                  <CardDescription>
                    <TranslatedText text="Número de propriedades por localização" fromLang="pt-BR" />
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={locationData} layout="vertical" margin={{ top: 20, right: 30, left: 60, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" allowDecimals={false} />
                        <YAxis type="category" dataKey="name" width={100} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#82ca9d" name="Propriedades" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};