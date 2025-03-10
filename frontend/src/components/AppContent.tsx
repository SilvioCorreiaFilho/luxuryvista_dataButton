import { ReactNode } from 'react';
import { I18nProvider } from './I18nProvider';

interface Props {
  children: ReactNode;
}

export function AppContent({ children }: Props) {
  return (
    <I18nProvider>
      {children}
    </I18nProvider>
  );
}
