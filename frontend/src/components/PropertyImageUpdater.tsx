import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import brain from "brain";

interface UpdateResult {
  success: boolean;
  message: string;
  property_ids?: string[];
}

export function PropertyImageUpdater() {
  const [isUpdating, setIsUpdating] = useState(false);
  const [result, setResult] = useState<UpdateResult | null>(null);

  const updateAllImages = async () => {
    setIsUpdating(true);
    setResult(null);
    
    try {
      toast.info("Starting update of all property images for Brasília properties");
      
      // Get all properties to update
      let propertyIds: string[] = [];
      
      try {
        // First try to get properties using the facade API
        const propertiesResponse = await brain.get_properties_facade({
          neighborhood: "Lago Sul"
        });
        
        const properties = await propertiesResponse.json();
        if (Array.isArray(properties)) {
          propertyIds = properties.map(p => p.id?.toString() || "").filter(id => id !== "");
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
        // Fallback - try the fallback API
        try {
          const fallbackResponse = await brain.get_properties_fallback({});
          const fallbackData = await fallbackResponse.json();
          
          if (fallbackData.properties && Array.isArray(fallbackData.properties)) {
            propertyIds = fallbackData.properties.map(p => p.id?.toString() || "").filter(id => id !== "");
          }
        } catch (fallbackError) {
          console.error("Error with fallback API too:", fallbackError);
        }
      }
      
      if (propertyIds.length === 0) {
        throw new Error("No properties found to update");
      }
      
      // Call the batch image generation API
      const response = await brain.batch_generate_images({
        property_ids: propertyIds,
        count_per_property: 5,
        force_regenerate: true
      });
      
      const data = await response.json();
      
      setResult(data);
      
      if (data.success) {
        toast.success(`${data.message}`);
      } else {
        toast.error(`Failed to update images: ${data.message}`);
      }
    } catch (error) {
      console.error("Error updating property images:", error);
      toast.error("An error occurred while updating property images");
      setResult({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Update Property Images</CardTitle>
        <CardDescription>
          Generate new high-quality images for all luxury properties in Brasília using AI.
          Images will be persisted in Supabase.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {result && (
          <div className={`p-4 rounded-md ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
              {result.message}
            </p>
            {result.property_ids && result.property_ids.length > 0 && (
              <p className="mt-2 text-sm">
                Processing {result.property_ids.length} properties
              </p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={updateAllImages} 
          disabled={isUpdating}
          className="w-full"
        >
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating Images...
            </>
          ) : (
            "Update All Property Images for Brasília"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
