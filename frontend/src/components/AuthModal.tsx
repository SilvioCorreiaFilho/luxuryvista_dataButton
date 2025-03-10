import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '../utils/auth-store';
import { BrazilianPhoneInput } from './BrazilianPhoneInput';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, X } from 'lucide-react';
import { TranslatedText } from './TranslatedText';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

type Mode = 'signin' | 'signup' | 'reset';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface AuthError extends Error {
  code?: string;
  message: string;
}

interface SignupData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  investmentRange: string;
  propertyTypes: string[];
  preferredRegions: string[];
  occupation: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  fullName?: string;
  phone?: string;
  investmentRange?: string;
  propertyTypes?: string;
  preferredRegions?: string;
  occupation?: string;
}

// Move constants outside component to improve performance
const INVESTMENT_RANGES = [
  'R$ 1M - R$ 3M',
  'R$ 3M - R$ 5M',
  'R$ 5M - R$ 10M',
  'Acima de R$ 10M'
];

const PROPERTY_TYPES = [
  'Apartamento de Luxo',
  'Casa de Alto Padrão',
  'Cobertura',
  'Mansão',
  'Terreno Premium'
];

const REGIONS = [
  'Lago Sul',
  'Lago Norte',
  'Setor Noroeste',
  'Sudoeste',
  'Park Sul',
  'Outras Regiões'
];

export const AuthModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<Mode>('signin');
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  
  // Unified form state for all authentication modes
  const [authData, setAuthData] = useState({
    email: '',
    password: '',
  });
  
  const [signupData, setSignupData] = useState<SignupData>({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    investmentRange: '',
    propertyTypes: [],
    preferredRegions: [],
    occupation: ''
  });

  const { signIn, signUp, resetPassword, loading } = useAuthStore();

  // Validate a single field and return error message if invalid
  const validateField = (field: keyof SignupData, value: any): string => {
    if (!value && field !== 'propertyTypes' && field !== 'preferredRegions') {
      return 'Este campo é obrigatório';
    }
    
    if (field === 'email' && value && !/^\S+@\S+\.\S+$/.test(value)) {
      return 'Email inválido';
    }
    
    if (field === 'password' && value && value.length < 6) {
      return 'A senha deve ter pelo menos 6 caracteres';
    }
    
    if ((field === 'propertyTypes' || field === 'preferredRegions') && 
        Array.isArray(value) && value.length === 0) {
      return 'Selecione pelo menos uma opção';
    }
    
    return '';
  };

  // Handle field blur for validation
  const handleFieldBlur = (field: keyof SignupData, value: any) => {
    const error = validateField(field, value);
    setFormErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleSignupDataChange = (field: keyof SignupData, value: any) => {
    const newValue = value;
    setSignupData(prev => ({
      ...prev,
      [field]: newValue
    }));
    
    // Clear error when field is updated
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleCheckboxChange = (field: 'propertyTypes' | 'preferredRegions', value: string) => {
    setSignupData(prev => {
      const updatedValue = prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value];
        
      // Validate after change
      if (updatedValue.length === 0) {
        setFormErrors(prevErrors => ({
          ...prevErrors,
          [field]: 'Selecione pelo menos uma opção'
        }));
      } else {
        setFormErrors(prevErrors => ({
          ...prevErrors,
          [field]: ''
        }));
      }
      
      return {
        ...prev,
        [field]: updatedValue
      };
    });
  };

  const isSignupValid = (): boolean => {
    if (mode !== 'signup') return true;
    
    // Validate all fields and collect errors
    let hasErrors = false;
    const errors: FormErrors = {};
    
    Object.entries(signupData).forEach(([key, value]) => {
      const fieldKey = key as keyof SignupData;
      const error = validateField(fieldKey, value);
      if (error) {
        errors[fieldKey as keyof FormErrors] = error;
        hasErrors = true;
      }
    });
    
    // Update error state
    setFormErrors(errors);
    
    return !hasErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) {
      toast.error('Por favor, aguarde...');
      return;
    }

    try {
      if (mode === 'signin') {
        // Validate signin fields
        if (!authData.email || !authData.password) {
          setFormErrors({
            email: !authData.email ? 'Este campo é obrigatório' : '',
            password: !authData.password ? 'Este campo é obrigatório' : ''
          });
          toast.error('Por favor, preencha todos os campos');
          return;
        }
        await signIn(authData.email, authData.password);
        toast.success('Bem-vindo de volta!');
        onClose();
      } else if (mode === 'signup') {
        if (!isSignupValid()) {
          toast.error('Por favor, corrija os erros no formulário');
          return;
        }
        
        const { email, password, ...profile } = signupData;
        await signUp(email, password, profile);
        toast.success('Conta criada com sucesso! Por favor, verifique seu email.');
        onClose();
      } else if (mode === 'reset') {
        if (!authData.email) {
          setFormErrors({
            email: 'Este campo é obrigatório'
          });
          toast.error('Por favor, insira seu email');
          return;
        }
        await resetPassword(authData.email);
        toast.success('Verifique seu email para redefinir a senha');
        onClose();
      }
    } catch (error: unknown) {
      console.error('Auth error:', error);
      let errorMessage = 'Erro ao processar sua solicitação. Por favor, tente novamente.';
      
      if (error instanceof Error) {
        const authError = error as AuthError;
        errorMessage = authError.message;
      }
      
      toast.error(errorMessage);
    }
  };

  // Reset forms when switching modes
  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setFormErrors({});
    
    if (newMode === 'signup') {
      setSignupData({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        investmentRange: '',
        propertyTypes: [],
        preferredRegions: [],
        occupation: ''
      });
    } else {
      setAuthData({
        email: '',
        password: ''
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative w-full max-w-md rounded-xl bg-white p-8 shadow-xl"
        >
          <h2 className="mb-6 text-2xl font-light tracking-wide">
            <TranslatedText 
              text={mode === 'signin' ? 'Entrar' : mode === 'signup' ? 'Criar Conta' : 'Redefinir Senha'}
              fromLang="pt-BR"
            />
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' ? (
              // Signup Form
              <>
                <div className="space-y-2">
                  <Label>
                    <TranslatedText text="Nome Completo" fromLang="pt-BR" />
                  </Label>
                  <Input
                    type="text"
                    value={signupData.fullName}
                    onChange={(e) => handleSignupDataChange('fullName', e.target.value)}
                    onBlur={() => handleFieldBlur('fullName', signupData.fullName)}
                    aria-invalid={!!formErrors.fullName}
                    placeholder="Seu nome completo"
                  />
                  {formErrors.fullName && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.fullName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    <TranslatedText text="Email" fromLang="pt-BR" />
                  </Label>
                  <Input
                    type="email"
                    value={signupData.email}
                    onChange={(e) => handleSignupDataChange('email', e.target.value)}
                    onBlur={() => handleFieldBlur('email', signupData.email)}
                    aria-invalid={!!formErrors.email}
                    placeholder="seu@email.com"
                  />
                  {formErrors.email && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    <TranslatedText text="Senha" fromLang="pt-BR" />
                  </Label>
                  <Input
                    type="password"
                    value={signupData.password}
                    onChange={(e) => handleSignupDataChange('password', e.target.value)}
                    onBlur={() => handleFieldBlur('password', signupData.password)}
                    aria-invalid={!!formErrors.password}
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                  />
                  {formErrors.password && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    <TranslatedText text="Telefone" fromLang="pt-BR" />
                  </Label>
                  <BrazilianPhoneInput
                    value={signupData.phone}
                    onChange={(value) => handleSignupDataChange('phone', value)}
                    onBlur={() => handleFieldBlur('phone', signupData.phone)}
                  />
                  {formErrors.phone && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.phone}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    <TranslatedText text="Ocupação" fromLang="pt-BR" />
                  </Label>
                  <Input
                    type="text"
                    value={signupData.occupation}
                    onChange={(e) => handleSignupDataChange('occupation', e.target.value)}
                    onBlur={() => handleFieldBlur('occupation', signupData.occupation)}
                    aria-invalid={!!formErrors.occupation}
                    placeholder="Sua ocupação profissional"
                  />
                  {formErrors.occupation && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.occupation}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    <TranslatedText text="Faixa de Investimento" fromLang="pt-BR" />
                  </Label>
                  <Select
                    value={signupData.investmentRange}
                    onValueChange={(value) => handleSignupDataChange('investmentRange', value)}
                    onOpenChange={(open) => {
                      if (!open) handleFieldBlur('investmentRange', signupData.investmentRange);
                    }}
                  >
                    <SelectTrigger aria-invalid={!!formErrors.investmentRange}>
                      <SelectValue placeholder="Selecione uma faixa" />
                    </SelectTrigger>
                    <SelectContent>
                      {INVESTMENT_RANGES.map((range) => (
                        <SelectItem key={range} value={range}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.investmentRange && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.investmentRange}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>
                    <TranslatedText text="Tipos de Imóveis de Interesse" fromLang="pt-BR" />
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PROPERTY_TYPES.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`property-${type}`}
                          checked={signupData.propertyTypes.includes(type)}
                          onCheckedChange={() => handleCheckboxChange('propertyTypes', type)}
                        />
                        <label 
                          htmlFor={`property-${type}`}
                          className="text-sm cursor-pointer"
                        >
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                  {formErrors.propertyTypes && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.propertyTypes}</p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>
                    <TranslatedText text="Regiões de Interesse" fromLang="pt-BR" />
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {REGIONS.map((region) => (
                      <div key={region} className="flex items-center space-x-2">
                        <Checkbox
                          id={`region-${region}`}
                          checked={signupData.preferredRegions.includes(region)}
                          onCheckedChange={() => handleCheckboxChange('preferredRegions', region)}
                        />
                        <label 
                          htmlFor={`region-${region}`}
                          className="text-sm cursor-pointer"
                        >
                          {region}
                        </label>
                      </div>
                    ))}
                  </div>
                  {formErrors.preferredRegions && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.preferredRegions}</p>
                  )}
                </div>
              </>
            ) : (
              // Login/Reset Form
              <>
                <div className="space-y-2">
                  <Label>
                    <TranslatedText text="Email" fromLang="pt-BR" />
                  </Label>
                  <Input
                    type="email"
                    value={authData.email}
                    onChange={(e) => setAuthData(prev => ({ ...prev, email: e.target.value }))}
                    onBlur={() => handleFieldBlur('email', authData.email)}
                    aria-invalid={!!formErrors.email}
                    placeholder="seu@email.com"
                  />
                  {formErrors.email && (
                    <p className="text-xs text-red-500 mt-1">{formErrors.email}</p>
                  )}
                </div>

                {mode === 'signin' && (
                  <div className="space-y-2">
                    <Label>
                      <TranslatedText text="Senha" fromLang="pt-BR" />
                    </Label>
                    <Input
                      type="password"
                      value={authData.password}
                      onChange={(e) => setAuthData(prev => ({ ...prev, password: e.target.value }))}
                      onBlur={() => handleFieldBlur('password', authData.password)}
                      aria-invalid={!!formErrors.password}
                      placeholder="Sua senha"
                    />
                    {formErrors.password && (
                      <p className="text-xs text-red-500 mt-1">{formErrors.password}</p>
                    )}
                  </div>
                )}
              </>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full mt-6"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              <TranslatedText 
                text={
                  mode === 'signin'
                  ? 'Entrar'
                  : mode === 'signup'
                  ? 'Criar Conta'
                  : 'Enviar Email'
                }
                fromLang="pt-BR"
              />
            </Button>
          </form>

          <div className="mt-6 text-sm text-center space-y-2">
            {mode === 'signin' ? (
              <>
                <div>
                  <TranslatedText text="Não tem uma conta?" fromLang="pt-BR" />{' '}
                  <button
                    onClick={() => switchMode('signup')}
                    className="font-medium text-black hover:underline"
                    type="button"
                  >
                    <TranslatedText text="Criar conta" fromLang="pt-BR" />
                  </button>
                </div>
                <div>
                  <button
                    onClick={() => switchMode('reset')}
                    className="font-medium text-black hover:underline"
                    type="button"
                  >
                    <TranslatedText text="Esqueceu a senha?" fromLang="pt-BR" />
                  </button>
                </div>
              </>
            ) : (
              <div>
                <TranslatedText text="Já tem uma conta?" fromLang="pt-BR" />{' '}
                <button
                  onClick={() => switchMode('signin')}
                  className="font-medium text-black hover:underline"
                  type="button"
                >
                  <TranslatedText text="Entrar" fromLang="pt-BR" />
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            aria-label="Close"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};