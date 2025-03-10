import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export function TestAuth() {
  // Direct console output
  console.log('TestAuth component mounted');

  useEffect(() => {
    const testConnection = async () => {
      try {
      console.log('Attempting Supabase registration...');

        const { data, error } = await supabase.auth.getSession();
        console.log('Supabase connection test:', { data, error });
      } catch (error) {
        console.error('Supabase connection error:', error);
      }
    };
    testConnection();
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Starting registration process...');
    
    setError(undefined);
    setSuccess(undefined);
    setLoading(true);

    try {
      // Create user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
          data: {
            full_name: '',
            phone: '',
            investment_range: '',
            property_types: [],
            preferred_regions: [],
            occupation: '',
          },
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error('Failed to create account');

      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: data.user.id,
            email,
            full_name: '',
            phone: '',
            investment_range: '',
            property_types: [],
            preferred_regions: [],
            occupation: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);

      if (profileError) throw profileError;

      setSuccess('Registration successful! Please check your email for verification.');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl rounded-lg overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-light text-gray-800 mb-2">Welcome to LuxuryVista</h2>
            <p className="text-gray-600 font-light">Create your exclusive account</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-gray-200 focus:border-transparent transition-all duration-200"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-gray-200 focus:border-transparent transition-all duration-200"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-md transition-all duration-200 font-light tracking-wide"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating your account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="p-4 bg-green-50 border border-green-100 rounded-md">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}
          </form>

          <div className="mt-6">
            <Separator className="my-4" />
            <p className="text-center text-sm text-gray-500">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-gray-900 hover:underline">Terms of Service</a>{' '}
              and{' '}
              <a href="#" className="text-gray-900 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
