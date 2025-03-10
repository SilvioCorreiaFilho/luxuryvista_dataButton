import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const styles = {
  container: 'container mx-auto px-4',
  section: 'py-20',
  sectionTitle: 'text-4xl font-bold text-center mb-12',
  card: 'overflow-hidden rounded-lg bg-white shadow-lg transition-transform hover:-translate-y-1',
  buttonPrimary: 'rounded-lg bg-black px-6 py-2 font-semibold text-white transition hover:bg-gray-800',
  input: 'w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black',
  gradientText: 'bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600',
};
