import React, { useEffect, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import Map, { Marker, Popup } from 'react-map-gl';
import { Property } from '../utils/propertyTypes';
import { TranslatedText } from './TranslatedText';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MapPin, Landmark, Building2, TreePine, Coffee } from 'lucide-react';

interface Props {
  properties?: Property[];
  className?: string;
  showPopup?: boolean;
  center?: [number, number];
  zoom?: number;
  height?: string;
}

const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2lsdmlvbTJ3IiwiYSI6ImNtNzBzbjZxZTA1ZzEyb3ExdHY2djZhOGoifQ.D3a7jB1cxwzYZaF5uarL5Q';

const TURISTIC_SPOTS = [
  {
    id: 1,
    name: 'Catedral Metropolitana',
    description: 'Ícone arquitetônico de Brasília',
    coordinates: [-47.8756, -15.7983],
    type: 'landmark',
    image: '/public/f2781c83-f39f-466b-ab5d-e85c2f4ca111/1. catedral.jpg - Catedral Metropolitana .jpg'
  },
  {
    id: 2,
    name: 'Congresso Nacional',
    description: 'Sede do poder legislativo',
    coordinates: [-47.8644, -15.7997],
    type: 'landmark',
    image: '/public/f2781c83-f39f-466b-ab5d-e85c2f4ca111/2. congresso.jpg'
  },
  {
    id: 3,
    name: 'Pontão do Lago Sul',
    description: 'Área de lazer e gastronomia',
    coordinates: [-47.8672, -15.8283],
    type: 'leisure',
    image: '/public/f2781c83-f39f-466b-ab5d-e85c2f4ca111/3. pontao.jpg'
  },
  {
    id: 4,
    name: 'Parque da Cidade',
    description: 'Maior parque urbano do mundo',
    coordinates: [-47.9099, -15.7901],
    type: 'park',
    image: '/public/f2781c83-f39f-466b-ab5d-e85c2f4ca111/13.5.-Parque-da-Cidade.-Foto-Paulo-H-Carvalho-Agência-Brasília.jpg'
  },
  {
    id: 5,
    name: 'Setor de Restaurantes',
    description: 'Gastronomia internacional',
    coordinates: [-47.8821, -15.7936],
    type: 'food',
    image: '/public/f2781c83-f39f-466b-ab5d-e85c2f4ca111/5. restaurantes.jpg'
  }
];

const VALORIZATION_SPOTS = [
  {
    id: 1,
    name: 'Setor Noroeste',
    description: 'Bairro mais moderno da capital',
    coordinates: [-47.9121, -15.7336],
    growth: '+15% ao ano'
  },
  {
    id: 2,
    name: 'Lago Sul',
    description: 'Área nobre com vista para o lago',
    coordinates: [-47.8721, -15.8336],
    growth: '+12% ao ano'
  },
  {
    id: 3,
    name: 'Park Way',
    description: 'Mansões em amplos terrenos',
    coordinates: [-47.9521, -15.9036],
    growth: '+10% ao ano'
  },
  {
    id: 4,
    name: 'Sudoeste',
    description: 'Localização privilegiada',
    coordinates: [-47.9221, -15.7936],
    growth: '+8% ao ano'
  }
];

export function PropertyMap({ 
  properties = [], 
  className = '', 
  showPopup = true,
  center = [-47.9292, -15.7801], // Brasília
  zoom = 11,
  height = '400px'
}: Props) {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<typeof VALORIZATION_SPOTS[0] | null>(null);
  const [selectedTuristicSpot, setSelectedTuristicSpot] = useState<typeof TURISTIC_SPOTS[0] | null>(null);

  const getSpotIcon = (type: string) => {
    switch (type) {
      case 'landmark':
        return <Landmark className="w-8 h-8" />;
      case 'leisure':
        return <Building2 className="w-8 h-8" />;
      case 'park':
        return <TreePine className="w-8 h-8" />;
      case 'food':
        return <Coffee className="w-8 h-8" />;
      default:
        return <Landmark className="w-8 h-8" />;
    }
  };

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: center[0],
          latitude: center[1],
          zoom: zoom
        }}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
      >
        {/* Property Markers */}
        {properties.map((property) => (
          <Marker
            key={property.id}
            longitude={property.coordinates[0]}
            latitude={property.coordinates[1]}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedProperty(property);
              setSelectedSpot(null);
            }}
          >
            <div className="cursor-pointer text-primary hover:text-primary/80 transition-colors transform hover:scale-110">
              <MapPin className="w-8 h-8" />
            </div>
          </Marker>
        ))}

        {/* Turistic Spots */}
        {TURISTIC_SPOTS.map((spot) => (
          <Marker
            key={spot.id}
            longitude={spot.coordinates[0]}
            latitude={spot.coordinates[1]}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedTuristicSpot(spot);
              setSelectedProperty(null);
              setSelectedSpot(null);
            }}
          >
            <div className="cursor-pointer text-blue-500 hover:text-blue-400 transition-colors transform hover:scale-110 hover:rotate-[15deg]">
              {getSpotIcon(spot.type)}
            </div>
          </Marker>
        ))}

        {/* Valorization Spots */}
        {VALORIZATION_SPOTS.map((spot) => (
          <Marker
            key={spot.id}
            longitude={spot.coordinates[0]}
            latitude={spot.coordinates[1]}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setSelectedSpot(spot);
              setSelectedProperty(null);
            }}
          >
            <div className="cursor-pointer text-green-500 hover:text-green-400 transition-colors transform hover:scale-110">
              <MapPin className="w-8 h-8" />
            </div>
          </Marker>
        ))}

        {/* Turistic Spot Popup */}
        {showPopup && selectedTuristicSpot && (
          <Popup
            longitude={selectedTuristicSpot.coordinates[0]}
            latitude={selectedTuristicSpot.coordinates[1]}
            anchor="bottom"
            onClose={() => setSelectedTuristicSpot(null)}
            className="z-50"
          >
            <div className="p-2 space-y-2 min-w-[200px] sm:min-w-[250px]">
              <img 
                src={selectedTuristicSpot.image} 
                alt={selectedTuristicSpot.name} 
                className="w-full sm:w-48 h-32 object-cover rounded-lg"
              />
              <h3 className="font-medium text-sm">{selectedTuristicSpot.name}</h3>
              <p className="text-sm text-gray-600">{selectedTuristicSpot.description}</p>
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => navigate(`/PropertyListing?location=${selectedTuristicSpot.name.toLowerCase().replace(' ', '-')}`)}
              >
                <TranslatedText text="Ver Imóveis Próximos" />
              </Button>
            </div>
          </Popup>
        )}

        {/* Property Popup */}
        {showPopup && selectedProperty && (
          <Popup
            longitude={selectedProperty.coordinates[0]}
            latitude={selectedProperty.coordinates[1]}
            anchor="bottom"
            onClose={() => setSelectedProperty(null)}
            className="z-50"
          >
            <div className="p-2 space-y-2">
              <img 
                src={selectedProperty.images[0]} 
                alt={selectedProperty.title} 
                className="w-full sm:w-48 h-32 object-cover rounded-lg"
              />
              <h3 className="font-medium text-sm">{selectedProperty.title}</h3>
              <p className="text-sm text-gray-600">{selectedProperty.price}</p>
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => navigate(`/PropertyListing/${selectedProperty.id}`)}
              >
                <TranslatedText text="Ver Detalhes" />
              </Button>
            </div>
          </Popup>
        )}

        {/* Valorization Spot Popup */}
        {showPopup && selectedSpot && (
          <Popup
            longitude={selectedSpot.coordinates[0]}
            latitude={selectedSpot.coordinates[1]}
            anchor="bottom"
            onClose={() => setSelectedSpot(null)}
            className="z-50"
          >
            <div className="p-2 space-y-2">
              <h3 className="font-medium text-sm">{selectedSpot.name}</h3>
              <p className="text-sm text-gray-600">{selectedSpot.description}</p>
              <p className="text-sm text-green-600 font-medium">
                Valorização: {selectedSpot.growth}
              </p>
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => navigate(`/PropertyListing?location=${selectedSpot.name.toLowerCase().replace(' ', '-')}`)}
              >
                <TranslatedText text="Ver Imóveis" />
              </Button>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
