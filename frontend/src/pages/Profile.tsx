import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../utils/auth-store';
import { supabase } from '../utils/supabase';
import { toast } from 'sonner';
import { TranslatedText } from '../components/TranslatedText';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Loader2, Save } from 'lucide-react';
import type { UserProfile } from '../utils/types';
import { BrazilianPhoneInput } from '../components/BrazilianPhoneInput';

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    preferred_contact: 'email',
    language: 'pt-BR',
    investment_preferences: {
      min_price: 0,
      max_price: 0,
      property_types: [],
      regions: [],
      amenities: []
    }
  });

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setProfile(data);
          setFormData({
            full_name: data.full_name || '',
            phone: data.phone || '',
            preferred_contact: data.preferred_contact || 'email',
            language: data.language || 'pt-BR',
            investment_preferences: data.investment_preferences || {
              min_price: 0,
              max_price: 0,
              property_types: [],
              regions: [],
              amenities: []
            }
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(formData)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="container max-w-4xl">
        <h1 className="text-3xl font-light tracking-wide mb-8">
          <TranslatedText text="Meu Perfil" fromLang="pt-BR" />
        </h1>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-light tracking-wide">
                <TranslatedText text="Informações Pessoais" fromLang="pt-BR" />
              </h2>
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <TranslatedText text="Nome Completo" fromLang="pt-BR" />
                  </label>
                  <Input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <TranslatedText text="Email" fromLang="pt-BR" />
                  </label>
                  <Input
                    value={user?.email || ''}
                    disabled
                    className="w-full bg-gray-50"
                  />
                </div>
  
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <TranslatedText text="Telefone" fromLang="pt-BR" />
                  </label>
                  <BrazilianPhoneInput
                    value={formData.phone}
                    onChange={(value) => setFormData({ ...formData, phone: value })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <TranslatedText text="Contato Preferido" fromLang="pt-BR" />
                  </label>
                  <select
                    value={formData.preferred_contact}
                    onChange={(e) => setFormData({ ...formData, preferred_contact: e.target.value as 'email' | 'phone' | 'whatsapp' })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
                  >
                    <option value="email">Email</option>
                    <option value="phone">Telefone</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <TranslatedText text="Idioma" fromLang="pt-BR" />
                  </label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value as 'pt-BR' | 'en' })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-black focus:outline-none"
                  >
                    <option value="pt-BR">Português</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Investment Preferences */}
            <div className="space-y-4">
              <h2 className="text-xl font-light tracking-wide">
                <TranslatedText text="Preferências de Investimento" fromLang="pt-BR" />
              </h2>
              <Separator />
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <TranslatedText text="Preço Mínimo" fromLang="pt-BR" />
                  </label>
                  <Input
                    type="number"
                    value={formData.investment_preferences.min_price}
                    onChange={(e) => setFormData({
                      ...formData,
                      investment_preferences: {
                        ...formData.investment_preferences,
                        min_price: Number(e.target.value)
                      }
                    })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <TranslatedText text="Preço Máximo" fromLang="pt-BR" />
                  </label>
                  <Input
                    type="number"
                    value={formData.investment_preferences.max_price}
                    onChange={(e) => setFormData({
                      ...formData,
                      investment_preferences: {
                        ...formData.investment_preferences,
                        max_price: Number(e.target.value)
                      }
                    })}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <TranslatedText text="Tipos de Imóveis" fromLang="pt-BR" />
                </label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { value: 'mansion', label: 'Mansão' },
                    { value: 'penthouse', label: 'Cobertura' },
                    { value: 'apartment', label: 'Apartamento' },
                    { value: 'house', label: 'Casa' },
                    { value: 'land', label: 'Terreno' }
                  ].map(type => (
                    <label key={type.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={(formData.investment_preferences.property_types || []).includes(type.value)}
                        onChange={() => {
                          const currentTypes = formData.investment_preferences.property_types || [];
                          const newTypes = currentTypes.includes(type.value)
                            ? currentTypes.filter(t => t !== type.value)
                            : [...currentTypes, type.value];
                            
                          setFormData({
                            ...formData,
                            investment_preferences: {
                              ...formData.investment_preferences,
                              property_types: newTypes
                            }
                          });
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <TranslatedText text="Regiões" fromLang="pt-BR" />
                </label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { value: 'lago_sul', label: 'Lago Sul' },
                    { value: 'lago_norte', label: 'Lago Norte' },
                    { value: 'asa_sul', label: 'Asa Sul' },
                    { value: 'asa_norte', label: 'Asa Norte' },
                    { value: 'sudoeste', label: 'Sudoeste' },
                    { value: 'noroeste', label: 'Noroeste' },
                    { value: 'park_way', label: 'Park Way' }
                  ].map(region => (
                    <label key={region.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={(formData.investment_preferences.regions || []).includes(region.value)}
                        onChange={() => {
                          const currentRegions = formData.investment_preferences.regions || [];
                          const newRegions = currentRegions.includes(region.value)
                            ? currentRegions.filter(r => r !== region.value)
                            : [...currentRegions, region.value];
                            
                          setFormData({
                            ...formData,
                            investment_preferences: {
                              ...formData.investment_preferences,
                              regions: newRegions
                            }
                          });
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{region.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <TranslatedText text="Comodidades" fromLang="pt-BR" />
                </label>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { value: 'pool', label: 'Piscina' },
                    { value: 'gym', label: 'Academia' },
                    { value: 'garden', label: 'Jardim' },
                    { value: 'security', label: 'Segurança 24h' },
                    { value: 'garage', label: 'Garagem' },
                    { value: 'lake_view', label: 'Vista para o Lago' }
                  ].map(amenity => (
                    <label key={amenity.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={(formData.investment_preferences.amenities || []).includes(amenity.value)}
                        onChange={() => {
                          const currentAmenities = formData.investment_preferences.amenities || [];
                          const newAmenities = currentAmenities.includes(amenity.value)
                            ? currentAmenities.filter(a => a !== amenity.value)
                            : [...currentAmenities, amenity.value];
                            
                          setFormData({
                            ...formData,
                            investment_preferences: {
                              ...formData.investment_preferences,
                              amenities: newAmenities
                            }
                          });
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">{amenity.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-md py-2 px-6"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <TranslatedText text="Salvar Alterações" fromLang="pt-BR" />
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
