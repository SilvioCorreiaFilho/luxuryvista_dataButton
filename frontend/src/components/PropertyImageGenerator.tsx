import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import brain from "brain";
import { PropertyResponse } from "../types";

interface PropertyImageGeneratorProps {
  property: PropertyResponse;
  onImagesGenerated?: (property: PropertyResponse) => void;
}

export function PropertyImageGenerator({ property, onImagesGenerated }: PropertyImageGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptTemplate, setPromptTemplate] = useState(
    `Luxury ${property.property_type?.name || 'property'} in ${property.location?.name || 'Brasília'}, featuring ${property.bedrooms} bedrooms, ${property.bathrooms} bathrooms, and ${property.area}m². ${property.features?.slice(0, 3).join(', ')}. Professional photography, architectural showcase, daytime lighting.`
  );
  const [imageCount, setImageCount] = useState(3);

  const generateImages = async () => {
    if (!property.id) {
      toast.error("Property ID is required");
      return;
    }

    setIsGenerating(true);
    
    try {
      toast.info("Generating property images with DALL-E...");
      
      // Call the API endpoint to generate images for a specific property
      const response = await brain.generate_images({
        property_id: property.id,
        count: imageCount,
        force_regenerate: true
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Successfully generated ${data.images?.length || 0} images`);
        // Callback with updated property data if available
        if (onImagesGenerated && data.property) {
          onImagesGenerated(data.property);
        }
      } else {
        toast.error(`Failed to generate images: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error generating property images:", error);
      toast.error("An error occurred while generating property images");
    } finally {
      setIsGenerating(false);
    }
  };

  // Predefined templates for quick selection
  const promptTemplates = [
    {
      name: "Exterior - Modern",
      prompt: `Luxury ${property.property_type?.name || 'property'} in ${property.location?.name || 'Brasília'}, modern architecture, featuring floor-to-ceiling windows, clean lines, and minimalist design. Daytime, perfect blue sky. Professional architectural photography, ultra high-end real estate, 8k quality.`
    },
    {
      name: "Exterior - Classic",
      prompt: `Elegant ${property.property_type?.name || 'property'} in ${property.location?.name || 'Brasília'} with classic architecture, featuring Mediterranean influences, terracotta roof, and lush landscaping. Golden hour lighting. Professional real estate photography, luxury property showcase.`
    },
    {
      name: "Interior - Living Room",
      prompt: `Luxurious living room interior of a ${property.property_type?.name || 'property'} in ${property.location?.name || 'Brasília'}, featuring high ceilings, designer furniture, and panoramic views. Natural lighting, marble floors, and sophisticated decor. Architectural digest style photography.`
    },
    {
      name: "Interior - Kitchen",
      prompt: `High-end gourmet kitchen in a luxury ${property.property_type?.name || 'property'} in ${property.location?.name || 'Brasília'}, featuring Italian marble countertops, professional-grade appliances, and custom cabinetry. Bright, airy atmosphere with perfect lighting. Professional interior design photography.`
    },
    {
      name: "Pool & Garden",
      prompt: `Stunning infinity pool and landscaped garden of a luxury ${property.property_type?.name || 'property'} in ${property.location?.name || 'Brasília'}, featuring outdoor living areas, tropical plants, and water features. Sunset lighting with vibrant colors. High-end real estate photography.`
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generate AI Images</CardTitle>
        <CardDescription>
          Create professional-quality images for this property using DALL-E AI technology
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="image-count">Number of Images</Label>
          <Input
            id="image-count"
            type="number"
            min={1}
            max={5}
            value={imageCount}
            onChange={(e) => setImageCount(parseInt(e.target.value) || 1)}
            className="w-20"
          />
          <p className="text-xs text-gray-500">
            Generate between 1-5 images (each image consumes API credits)
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={generateImages} 
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Images...
            </>
          ) : (
            <>
              <ImageIcon className="mr-2 h-4 w-4" />
              Generate {imageCount} Image{imageCount !== 1 ? 's' : ''} with DALL-E
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
