import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const token = searchParams.get('token');
        if (!token) {
          setError('Token de verificação não encontrado');
          return;
        }

        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email',
        });

        if (error) throw error;

        toast.success('Email verificado com sucesso!');
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } catch (error) {
        console.error('Verification error:', error);
        setError('Erro ao verificar email. Por favor, tente novamente.');
      } finally {
        setVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"
      >
        <h1 className="mb-6 text-center text-2xl font-bold">
          Verificação de Email
        </h1>

        {verifying ? (
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-black mx-auto" />
            <p>Verificando seu email...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="mb-4 rounded-full bg-red-100 p-3 text-red-600 mx-auto w-fit">
              ❌
            </div>
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 rounded-lg bg-black px-4 py-2 text-white transition hover:bg-gray-800"
            >
              Voltar para a página inicial
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="mb-4 rounded-full bg-green-100 p-3 text-green-600 mx-auto w-fit">
              ✔️
            </div>
            <p className="text-green-600">Email verificado com sucesso!</p>
            <p className="mt-2 text-gray-600">
              Você será redirecionado para a página inicial em alguns segundos...
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
