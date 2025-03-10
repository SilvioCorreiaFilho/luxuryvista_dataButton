import React from 'react';

interface Props {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

const COUNTRY_CODES = [
  { code: '+55', flag: '🇧🇷', name: 'Brasil' },
  { code: '+1', flag: '🇺🇸', name: 'Estados Unidos' },
  { code: '+351', flag: '🇵🇹', name: 'Portugal' },
  { code: '+34', flag: '🇪🇸', name: 'Espanha' },
  { code: '+33', flag: '🇫🇷', name: 'França' },
  { code: '+44', flag: '🇬🇧', name: 'Reino Unido' },
  { code: '+39', flag: '🇮🇹', name: 'Itália' },
  { code: '+49', flag: '🇩🇪', name: 'Alemanha' },
  { code: '+41', flag: '🇨🇭', name: 'Suíça' },
];

const formatPhoneNumber = (value: string) => {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');
  
  // Format according to Brazilian phone number pattern
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
};

export const PhoneInput: React.FC<Props> = ({ value, onChange, required, className }) => {
  // Split value into country code and number
  const [countryCode, number] = value.startsWith('+')
    ? [value.split(' ')[0], value.split(' ').slice(1).join(' ')]
    : ['+55', value]; // Default to Brazil

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(`${e.target.value} ${number}`);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    onChange(`${countryCode} ${formatted}`);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <select
        value={countryCode}
        onChange={handleCountryChange}
        className="w-32 rounded-lg border border-gray-300 p-2 focus:border-black focus:outline-none"
      >
        {COUNTRY_CODES.map(({ code, flag, name }) => (
          <option key={code} value={code}>
            {flag} {code}
          </option>
        ))}
      </select>
      <input
        type="tel"
        value={number}
        onChange={handleNumberChange}
        className="flex-1 rounded-lg border border-gray-300 p-2 focus:border-black focus:outline-none"
        placeholder="(00) 00000-0000"
        required={required}
      />
    </div>
  );
};
