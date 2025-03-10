import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { TranslatedText } from 'components/TranslatedText';
import { MinimalNavbar } from 'components/MinimalNavbar';
import { LanguageProvider } from 'utils/languageContext';
import brain from 'brain';
import type { PropertyType, Location, PropertyDetails, GeneratedProperty } from 'types';

function PropertyGenerator() {
  const navigate = useNavigate();
  const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatedProperties, setGeneratedProperties] = useState<GeneratedProperty[]>([]);
  
  const [formData, setFormData] = useState<PropertyDetails>({
    title: '',
    description: '',
    type: {
      name: '',
      description: ''
    },
    location: {
      name: '',
      description: ''
    },
    price: 0,
    bedrooms: 0,
    bathrooms: 0,
    area: 0,
    features: []
  });

  // Load property types and locations
  useState(() => {
    const fetchData = async () => {
      try {
        const typesResponse = await brain.get_property_types();
        const types = await typesResponse.json();
        setPropertyTypes(types);

        const locationsResponse = await brain.get_locations();
        const locations = await locationsResponse.json();
        setLocations(locations);

        const propertiesResponse = await brain.get_generated_properties();
        const properties = await propertiesResponse.json();
        setGeneratedProperties(properties);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await brain.generate_property({
        property_details: formData,
        num_images: 4
      });
      const newProperty = await response.json();
      setGeneratedProperties([...generatedProperties, newProperty]);
    } catch (error) {
      console.error('Error generating property:', error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <MinimalNavbar />
      <div className="container mx-auto px-4 py-24">
        <h1 className="text-4xl font-light mb-8">
          <TranslatedText text="Property Mockup Generator" />
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6">
            <h2 className="text-2xl font-light mb-6">
              <TranslatedText text="Generate New Property" />
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <Input
                  placeholder="Property Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />

                <Textarea
                  placeholder="Property Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />

                <Select
                  value={formData.type.name}
                  onValueChange={(value) => {
                    const type = propertyTypes.find((t) => t.name === value);
                    if (type) {
                      setFormData({ ...formData, type });
                    }
                  }}
                >
                  <option value="">Select Property Type</option>
                  {propertyTypes.map((type) => (
                    <option key={type.name} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                </Select>

                <Select
                  value={formData.location.name}
                  onValueChange={(value) => {
                    const location = locations.find((l) => l.name === value);
                    if (location) {
                      setFormData({ ...formData, location });
                    }
                  }}
                >
                  <option value="">Select Location</option>
                  {locations.map((location) => (
                    <option key={location.name} value={location.name}>
                      {location.name}
                    </option>
                  ))}
                </Select>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Price"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                  />
                  <Input
                    type="number"
                    placeholder="Area (m²)"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Bedrooms"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) })}
                  />
                  <Input
                    type="number"
                    placeholder="Bathrooms"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) })}
                  />
                </div>

                <Input
                  placeholder="Features (comma separated)"
                  value={formData.features.join(', ')}
                  onChange={(e) => setFormData({ ...formData, features: e.target.value.split(',').map((f) => f.trim()) })}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <TranslatedText text="Generating..." />
                ) : (
                  <TranslatedText text="Generate Property" />
                )}
              </Button>
            </form>
          </Card>

          <div className="space-y-6">
            <h2 className="text-2xl font-light">
              <TranslatedText text="Generated Properties" />
            </h2>

            {generatedProperties.map((property, index) => (
              <Card key={index} className="p-6 space-y-4">
                <h3 className="text-xl font-medium">{property.property_details.title}</h3>
                <p className="text-gray-600">{property.property_details.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  {property.image_urls.map((url, imgIndex) => (
                    <img
                      key={imgIndex}
                      src={url}
                      alt={`Property ${index + 1} - Image ${imgIndex + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Type:</strong> {property.property_details.type.name}</p>
                    <p><strong>Location:</strong> {property.property_details.location.name}</p>
                    <p><strong>Price:</strong> R$ {property.property_details.price.toLocaleString()}</p>
                  </div>
                  <div>
                    <p><strong>Area:</strong> {property.property_details.area} m²</p>
                    <p><strong>Bedrooms:</strong> {property.property_details.bedrooms}</p>
                    <p><strong>Bathrooms:</strong> {property.property_details.bathrooms}</p>
                  </div>
                </div>

                <p className="text-sm">
                  <strong>Features:</strong> {property.property_details.features.join(', ')}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PropertyGeneratorContent() {
  return (
    <LanguageProvider>
      <PropertyGenerator />
    </LanguageProvider>
  );
}