import React from 'react';
import { ErrorBoundary } from './ErrorBoundary';

/**
 * A wrapper component that applies an ErrorBoundary around any children
 * This allows us to gracefully handle errors in the property detail rendering or other components
 */
interface PropertyDetailWrapperProps {
  children: React.ReactNode;
}

export function PropertyDetailWrapper({ children }: PropertyDetailWrapperProps) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
}
