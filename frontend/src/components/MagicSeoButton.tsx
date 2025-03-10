import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import brain from 'brain';

interface MagicSeoButtonProps {
  propertyType: string;
  location: string;
  onSelect: (title: string, subtitle: string) => void;
  className?: string;
}

interface SeoSuggestion {
  title: string;
  subtitle: string;
}

export function MagicSeoButton({ propertyType, location, onSelect, className = '' }: MagicSeoButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<SeoSuggestion[]>([]);

  const generateSuggestions = async () => {
    setIsGenerating(true);
    toast.info('Gerando sugestões SEO otimizadas...');

    try {
      // First try: Use direct deepseek wrapper as most reliable method
      try {
        const response = await brain.deepseek_wrapper_generate_prompt_endpoint({
          prompt: `Generate 5 SEO optimized title and subtitle pairs in Brazilian Portuguese for a ${propertyType} in ${location}. Research the most strategic keywords from Instagram, Reddit, and Pinterest to identify trends in luxury real estate. Each suggestion should include a title (5-8 words) and a longer subtitle (10-15 words). Format as JSON array with title and subtitle properties. Focus on luxury real estate market in Brasil.`,
          model: "gpt-4o-mini"
        });
        
        const data = await response.json();
        if (data && data.success && data.text) {
          try {
            // Try to parse as JSON first
            const extractedJson = data.text.match(/\[\s*\{.*\}\s*\]/s)?.[0] || data.text;
            const parsed = JSON.parse(extractedJson);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSuggestions(parsed);
              setIsGenerating(false);
              toast.success('Sugestões geradas com sucesso!');
              return;
            }
          } catch (parseError) {
            console.log('Could not parse as JSON, using regex extraction:', parseError);
            // If JSON parsing fails, try to extract with regex
            const titles = data.text.match(/Título:\s*(.+?)(?=[\n\r]|Subtítulo:)/g)?.map(t => t.replace(/Título:\s*/, '').trim()) || [];
            const subtitles = data.text.match(/Subtítulo:\s*(.+?)(?=[\n\r]|$|\d+\.|SUGESTÃO)/g)?.map(s => s.replace(/Subtítulo:\s*/, '').trim()) || [];
            
            if (titles.length > 0 && subtitles.length > 0) {
              const parsedSuggestions = titles.map((title, i) => ({
                title,
                subtitle: subtitles[i] || `Experiência exclusiva em ${location} com design contemporâneo e acabamentos premium`
              }));
              setSuggestions(parsedSuggestions);
              setIsGenerating(false);
              toast.success('Sugestões geradas com sucesso!');
              return;
            }
          }
        }
      } catch (directError) {
        console.error("Direct method error:", directError);
      }

      // Second try: Use the SEO endpoints if available
      try {
        // First try the enhanced SEO endpoint (v2) if available
        const enhancedSeoAvailable = typeof brain.seo_title_subtitle2 === 'function';
        const originalSeoAvailable = typeof brain.seo_title_subtitle === 'function';
        
        // Try enhanced endpoint first (if available)
        if (enhancedSeoAvailable) {
          try {
            const response = await brain.seo_title_subtitle2({
              property_type: propertyType,
              location: location,
              language: 'pt'
            });
            
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.suggestions && data.suggestions.length > 0) {
                setSuggestions(data.suggestions);
                setIsGenerating(false);
                toast.success('Sugestões geradas com v2!');
                return;
              }
            }
          } catch (enhancedError) {
            console.log('Enhanced SEO endpoint error:', enhancedError);
            // Continue to original endpoint
          }
        }
        
        // Fall back to original SEO endpoint
        if (originalSeoAvailable) {
          const response = await brain.seo_title_subtitle({
            property_type: propertyType,
            location: location,
            platforms: ["instagram", "reddit", "pinterest"],
            language: 'pt'
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              if (data.suggestions && data.suggestions.length > 0) {
                setSuggestions(data.suggestions);
                setIsGenerating(false);
                toast.success('Sugestões geradas com sucesso!');
                return;
              } else if (data.text) {
                // Try to parse text response
                try {
                  // Try to extract JSON from text
                  const extractedJson = data.text.match(/\[\s*\{.*\}\s*\]/s)?.[0];
                  if (extractedJson) {
                    const parsed = JSON.parse(extractedJson);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                      setSuggestions(parsed);
                      setIsGenerating(false);
                      toast.success('Sugestões geradas com sucesso!');
                      return;
                    }
                  }
                  
                  // If JSON parsing fails, try to extract with regex
                  const titles = data.text.match(/Título:\s*(.+?)(?=[\n\r]|Subtítulo:)/g)?.map(t => t.replace(/Título:\s*/, '').trim()) || [];
                  const subtitles = data.text.match(/Subtítulo:\s*(.+?)(?=[\n\r]|$|\d+\.|SUGESTÃO)/g)?.map(s => s.replace(/Subtítulo:\s*/, '').trim()) || [];
                  
                  if (titles.length > 0 && subtitles.length > 0) {
                    const parsedSuggestions = titles.map((title, i) => ({
                      title,
                      subtitle: subtitles[i] || `Experiência exclusiva em ${location} com design contemporâneo e acabamentos premium`
                    }));
                    setSuggestions(parsedSuggestions);
                    setIsGenerating(false);
                    toast.success('Sugestões geradas com sucesso!');
                    return;
                  }
                } catch (parseError) {
                  console.error("Error parsing text response:", parseError);
                }
              }
            }
          }
        }
      } catch (seoError) {
        console.error("SEO API error:", seoError);
      }

      // Fallback: Use hardcoded suggestions
      setSuggestions([
        { 
          title: `Exclusiva ${propertyType} em ${location}`, 
          subtitle: "Sofisticação e luxo em uma localização privilegiada com acabamentos premium" 
        },
        { 
          title: `Elegante ${propertyType} com Vista Panorâmica`, 
          subtitle: `Experiência de vida incomparável com conforto e exclusividade em ${location}` 
        },
        { 
          title: `Luxuosa ${propertyType} de Alto Padrão`, 
          subtitle: `Projeto arquitetônico único com amplos espaços e acabamentos refinados em ${location}` 
        },
        { 
          title: `${propertyType} Exclusiva no Coração de ${location}`, 
          subtitle: `Design contemporâneo com materiais nobres e tecnologia de ponta para o mais exigente comprador` 
        },
        { 
          title: `Requintada ${propertyType} com Vista Privilegiada`, 
          subtitle: `O ápice da sofisticação imobiliária com privacidade e conforto em ${location}` 
        }
      ]);
      toast.success('Sugestões geradas com método alternativo!');
    } catch (error) {
      console.error('Error generating SEO suggestions:', error);
      toast.error('Erro ao gerar sugestões de SEO');
      
      // Set fallback suggestions even on error
      setSuggestions([
        { 
          title: `${propertyType} Luxuosa em ${location}`, 
          subtitle: "Design exclusivo e acabamentos de primeira linha" 
        },
        { 
          title: `${propertyType} Premium no Coração de ${location}`, 
          subtitle: "Elegância e sofisticação em cada detalhe" 
        }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelect = (suggestion: SeoSuggestion) => {
    onSelect(suggestion.title, suggestion.subtitle);
    setOpen(false);
    toast.success('Título e subtítulo aplicados com sucesso!');
    // Give the state update a moment to propagate
    setTimeout(() => {
      // Add an extra check to make UI more responsive
      console.log('SEO suggestion applied:', suggestion);
    }, 100);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          onClick={() => {
            setOpen(true);
            if (suggestions.length === 0) {
              generateSuggestions();
            }
          }} 
          variant="outline" 
          size="sm"
          className={`flex items-center gap-1.5 ${className}`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Título Mágico
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Sugestões de Título e Subtítulo</DialogTitle>
          <DialogDescription>
            Selecione um par de título e subtítulo otimizado para SEO para sua propriedade de luxo
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 max-h-[60vh] overflow-y-auto">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Gerando sugestões otimizadas para SEO...</p>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-3">
              {suggestions.map((suggestion, index) => (
                <Card key={index} className="hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => handleSelect(suggestion)}>
                  <CardHeader className="p-3 pb-0">
                    <CardTitle className="text-base font-medium">{suggestion.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-1">
                    <p className="text-sm text-muted-foreground">{suggestion.subtitle}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Nenhuma sugestão disponível</p>
          )}
        </div>
        
        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button 
            onClick={generateSuggestions} 
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Gerando...
              </>
            ) : (
              <>Regenerar Sugestões</>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
