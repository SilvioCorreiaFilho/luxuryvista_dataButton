import databutton from 'databutton';

interface PropertyImages {
  properties: {
    [key: string]: string[];
  };
  mapping: {
    [key: string]: string;
  };
}

let propertyImages: PropertyImages | null = null;

export async function getPropertyImages(propertyTitle: string): Promise<string[]> {
  // First try to get from Supabase
  try {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        id,
        property_images (url)
      `)
      .eq('title', propertyTitle)
      .maybeSingle();
      
    if (data && data.property_images && data.property_images.length > 0) {
      return data.property_images.map((img: any) => img.url);
    }
  } catch (err) {
    console.warn('Falling back to storage for images due to error:', err);
  }
  
  // Fallback to storage
  if (!propertyImages) {
    try {
      propertyImages = await databutton.storage.json.get('luxury_property_images.json');
    } catch (error) {
      console.error('Error loading property images:', error);
      return [];
    }
  }

  const imageSet = propertyImages?.mapping?.[propertyTitle];
  return imageSet ? propertyImages.properties[imageSet] : [];
}
