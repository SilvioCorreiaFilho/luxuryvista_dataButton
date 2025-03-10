import { useState, useCallback } from 'react';

interface LoadingState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

interface UseLoadingState<T> extends LoadingState<T> {
  setData: (data: T | null) => void;
  setError: (error: Error | null) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export function useLoadingState<T>(initialData: T | null = null): UseLoadingState<T> {
  const [state, setState] = useState<LoadingState<T>>({
    data: initialData,
    isLoading: false,
    error: null,
  });

  const setData = useCallback((data: T | null) => {
    setState(prev => ({
      ...prev,
      data,
    }));
  }, []);

  const setError = useCallback((error: Error | null) => {
    setState(prev => ({
      ...prev,
      error,
    }));
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({
      ...prev,
      isLoading,
    }));
  }, []);

  const reset = useCallback(() => {
    setState({
      data: initialData,
      isLoading: false,
      error: null,
    });
  }, [initialData]);

  return {
    ...state,
    setData,
    setError,
    setLoading,
    reset,
  };
}
