import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
          <div className="max-w-md rounded-lg bg-white p-8 shadow-xl">
            <h1 className="mb-4 text-2xl font-bold">Ops! Algo deu errado</h1>
            <p className="mb-6 text-gray-600">
              Desculpe pelo inconveniente. Por favor, tente novamente ou entre em contato com o suporte
              se o problema persistir.
            </p>
            <div className="space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg bg-black px-4 py-2 text-white transition hover:bg-gray-800"
              >
                Tentar Novamente
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="rounded-lg border border-black px-4 py-2 text-black transition hover:bg-gray-100"
              >
                Voltar para Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
