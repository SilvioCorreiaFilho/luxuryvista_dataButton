import React from 'react';
import { useForm } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Props {
  propertyId: string;
  propertyTitle: string;
  className?: string;
}

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export function PropertyContactForm({ propertyId, propertyTitle, className }: Props) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ContactFormData>();

  const onSubmit = async (data: ContactFormData) => {
    try {
      // TODO: Implement contact form submission
      console.log('Form data:', { propertyId, ...data });
      
      toast.success('Mensagem enviada com sucesso!');
      reset();
    } catch (error) {
      toast.error('Erro ao enviar mensagem. Tente novamente.');
    }
  };

  return (
    <Card className={className}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">Agendar Visita</h3>
          <p className="text-sm text-gray-500">
            Interessado em {propertyTitle}? Preencha o formulário abaixo para agendar uma visita.
          </p>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <Input
              placeholder="Seu nome"
              {...register('name', { required: 'Nome é obrigatório' })}
              error={errors.name?.message}
            />
          </div>

          {/* Email */}
          <div>
            <Input
              type="email"
              placeholder="Seu email"
              {...register('email', {
                required: 'Email é obrigatório',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido'
                }
              })}
              error={errors.email?.message}
            />
          </div>

          {/* Phone */}
          <div>
            <Input
              placeholder="Seu telefone"
              {...register('phone', { required: 'Telefone é obrigatório' })}
              error={errors.phone?.message}
            />
          </div>

          {/* Message */}
          <div>
            <Textarea
              placeholder="Sua mensagem"
              {...register('message', { required: 'Mensagem é obrigatória' })}
              error={errors.message?.message}
              className="min-h-[100px]"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
        </Button>
      </form>
    </Card>
  );
}
