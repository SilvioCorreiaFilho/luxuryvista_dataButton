import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

export function TestSupabase() {
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [error, setError] = useState<string>();

  useEffect(() => {
    async function testConnection() {
      try {
        const { data, error } = await supabase
          .from('properties')
          .select('id')
          .limit(1);

        if (error) throw error;
        setStatus('success');
      } catch (err) {
        console.error('Supabase connection error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setStatus('error');
      }
    }

    testConnection();
  }, []);

  return (
    <div className="p-4 rounded-lg border">
      <h3 className="text-lg font-semibold mb-2">Supabase Connection Status</h3>
      {status === 'loading' && (
        <p className="text-gray-600">Testing connection...</p>
      )}
      {status === 'success' && (
        <p className="text-green-600">Successfully connected to Supabase!</p>
      )}
      {status === 'error' && (
        <div className="text-red-600">
          <p>Failed to connect to Supabase</p>
          {error && <p className="text-sm mt-1">{error}</p>}
        </div>
      )}
    </div>
  );
}
