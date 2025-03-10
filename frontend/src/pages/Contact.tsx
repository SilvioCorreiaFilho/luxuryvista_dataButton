import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MinimalNavbar } from 'components/MinimalNavbar';

export default function Contact() {
  return (
    <div className="min-h-screen bg-white">
      <MinimalNavbar />

      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden mt-28">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2940&auto=format&fit=crop"
            alt="Modern Building"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center space-y-6 px-4">
          <h1 className="text-5xl font-light text-white tracking-wide">
            Fale Conosco
          </h1>
          <p className="text-xl text-white/90 font-light max-w-2xl mx-auto">
            Estamos prontos para ajudar você a encontrar o imóvel dos seus sonhos
          </p>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-light tracking-wide">
                  Informações de Contato
                </h2>
                <p className="text-gray-600 font-light">
                  Entre em contato conosco para conhecer nossas opções exclusivas de imóveis ou para avaliar sua propriedade.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Endereço</h3>
                  <p className="text-gray-600 font-light">Brasília, DF</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Telefone</h3>
                  <p className="text-gray-600 font-light">(61) 99999-9999</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Email</h3>
                  <p className="text-gray-600 font-light">contato@m2w.com.br</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Horário de Atendimento</h3>
                  <p className="text-gray-600 font-light">Segunda a Sexta: 9h às 18h</p>
                  <p className="text-gray-600 font-light">Sábado: 9h às 13h</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <form className="space-y-6 bg-gray-50 p-8 rounded-lg">
              <div className="space-y-4">
                <h3 className="text-2xl font-light">Envie sua Mensagem</h3>
                <p className="text-gray-600 font-light">
                  Preencha o formulário abaixo e entraremos em contato em breve.
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="Nome Completo"
                  className="w-full bg-white"
                />
                <Input
                  type="email"
                  placeholder="Email"
                  className="w-full bg-white"
                />
                <Input
                  type="tel"
                  placeholder="Telefone"
                  className="w-full bg-white"
                />
                <Textarea
                  placeholder="Mensagem"
                  className="w-full h-32 bg-white"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full text-lg py-6 bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.23)]"
              >
                Enviar Mensagem
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-[400px] relative overflow-hidden">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d245795.8081623695!2d-48.0176054!3d-15.7217175!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x935a3d18df9ae275%3A0x738470e469754a24!2sBras%C3%ADlia%2C%20DF!5e0!3m2!1spt-BR!2sbr!4v1708574795673!5m2!1spt-BR!2sbr"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
    </div>
  );
}
