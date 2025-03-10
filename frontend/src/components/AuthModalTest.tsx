import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthModal } from './AuthModal';
import { useAuthStore } from '../utils/auth-store';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('../utils/auth-store');
jest.mock('sonner');
jest.mock('./BrazilianPhoneInput', () => ({
  BrazilianPhoneInput: ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
    <input 
      data-testid="phone-input"
      value={value} 
      onChange={(e) => onChange(e.target.value)}
    />
  )
}));
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>
  }
}));
jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange }: any) => (
    <div data-testid="select-component">
      <select 
        data-testid="select-input" 
        value={value} 
        onChange={(e) => onValueChange(e.target.value)}
      >
        {children}
      </select>
    </div>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => <option value={value}>{children}</option>
}));
jest.mock('./TranslatedText', () => ({
  TranslatedText: ({ text }: { text: string }) => <span>{text}</span>
}));

describe('AuthModal', () => {
  const mockSignIn = jest.fn();
  const mockSignUp = jest.fn();
  const mockResetPassword = jest.fn();
  const mockOnClose = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
      signUp: mockSignUp,
      resetPassword: mockResetPassword,
      loading: false
    });
  });

  test('renders signin form by default', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Entrar')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Sua senha')).toBeInTheDocument();
  });

  test('does not render when isOpen is false', () => {
    render(<AuthModal isOpen={false} onClose={mockOnClose} />);
    
    expect(screen.queryByText('Entrar')).not.toBeInTheDocument();
  });

  test('switches to signup form when "Criar conta" is clicked', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByText('Criar conta'));
    
    expect(screen.getByText('Criar Conta')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Seu nome completo')).toBeInTheDocument();
    expect(screen.getByTestId('phone-input')).toBeInTheDocument();
  });

  test('switches to reset password form when "Esqueceu a senha?" is clicked', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);
    
    fireEvent.click(screen.getByText('Esqueceu a senha?'));
    
    expect(screen.getByText('Redefinir Senha')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('Sua senha')).not.toBeInTheDocument();
  });

  test('validates email format', async () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);
    
    const emailInput = screen.getByPlaceholderText('seu@email.com');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    
    expect(await screen.findByText('Email inválido')).toBeInTheDocument();
    
    // Fix the email and check if the error is cleared
    fireEvent.change(emailInput, { target: { value: 'valid@email.com' } });
    fireEvent.blur(emailInput);
    
    await waitFor(() => {
      expect(screen.queryByText('Email inválido')).not.toBeInTheDocument();
    });
  });

  test('validates required fields on signup form', async () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);
    
    // Switch to signup form
    fireEvent.click(screen.getByText('Criar conta'));
    
    // Try to submit with empty fields
    const submitButton = screen.getByRole('button', { name: 'Criar Conta' });
    fireEvent.click(submitButton);
    
    // Check for required field errors
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Por favor, corrija os erros no formulário');
    });
  });

  test('calls signIn with correct data on signin form submission', async () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);
    
    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Sua senha'), { 
      target: { value: 'password123' } 
    });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Entrar' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(toast.success).toHaveBeenCalledWith('Bem-vindo de volta!');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test('calls resetPassword with correct email on reset form submission', async () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);
    
    // Switch to reset password form
    fireEvent.click(screen.getByText('Esqueceu a senha?'));
    
    // Fill in the email
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { 
      target: { value: 'reset@example.com' } 
    });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Enviar Email' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('reset@example.com');
      expect(toast.success).toHaveBeenCalledWith('Verifique seu email para redefinir a senha');
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test('validates password length on signup form', async () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);
    
    // Switch to signup form
    fireEvent.click(screen.getByText('Criar conta'));
    
    // Fill password with too short value
    const passwordInput = screen.getByPlaceholderText('Mínimo 6 caracteres');
    fireEvent.change(passwordInput, { target: { value: '12345' } });
    fireEvent.blur(passwordInput);
    
    expect(await screen.findByText('A senha deve ter pelo menos 6 caracteres')).toBeInTheDocument();
    
    // Fix the password and check if the error is cleared
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.blur(passwordInput);
    
    await waitFor(() => {
      expect(screen.queryByText('A senha deve ter pelo menos 6 caracteres')).not.toBeInTheDocument();
    });
  });

  test('calls signUp with correct data on signup form submission', async () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);
    
    // Switch to signup form
    fireEvent.click(screen.getByText('Criar conta'));
    
    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('Seu nome completo'), { 
      target: { value: 'John Doe' } 
    });
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { 
      target: { value: 'john@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Mínimo 6 caracteres'), { 
      target: { value: 'password123' } 
    });
    fireEvent.change(screen.getByTestId('phone-input'), { 
      target: { value: '(11) 99999-9999' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Sua ocupação profissional'), { 
      target: { value: 'Developer' } 
    });
    
    // Select investment range
    const selectInput = screen.getByTestId('select-input');
    fireEvent.change(selectInput, { target: { value: 'R$ 1M - R$ 3M' } });
    
    // Select property types
    const propertyCheckboxes = screen.getAllByRole('checkbox').slice(0, 2);
    fireEvent.click(propertyCheckboxes[0]);
    
    // Select regions
    const regionCheckboxes = screen.getAllByRole('checkbox').slice(5, 7);
    fireEvent.click(regionCheckboxes[0]);
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Criar Conta' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        'john@example.com', 
        'password123', 
        expect.objectContaining({
          fullName: 'John Doe',
          phone: '(11) 99999-9999',
          occupation: 'Developer',
          investmentRange: 'R$ 1M - R$ 3M',
          propertyTypes: expect.arrayContaining([expect.any(String)]),
          preferredRegions: expect.arrayContaining([expect.any(String)])
        })
      );
      expect(toast.success).toHaveBeenCalledWith('Conta criada com sucesso! Por favor, verifique seu email.');
    });
  });

  test('displays loading state when authentication is in progress', async () => {
    (useAuthStore as jest.Mock).mockReturnValue({
      signIn: mockSignIn,
      signUp: mockSignUp,
      resetPassword: mockResetPassword,
      loading: true
    });
    
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);
    
    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Sua senha'), { 
      target: { value: 'password123' } 
    });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Entrar' });
    expect(submitButton).toBeDisabled();
    fireEvent.click(submitButton);
    
    // Loading indicator should be visible
    expect(screen.getByRole('status')).toBeInTheDocument();
    
    // signIn should not be called because of loading state
    expect(mockSignIn).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Por favor, aguarde...');
  });

  test('handles close button click', () => {
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);
    
    const closeButton = screen.getByLabelText('Close');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('handles authentication errors', async () => {
    mockSignIn.mockRejectedValueOnce(new Error('Invalid credentials'));
    
    render(<AuthModal isOpen={true} onClose={mockOnClose} />);
    
    // Fill in the form
    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.change(screen.getByPlaceholderText('Sua senha'), { 
      target: { value: 'wrong-password' } 
    });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: 'Entrar' });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
      expect(toast.error).toHaveBeenCalledWith('Invalid credentials');
      expect(mockOnClose).not.toHaveBeenCalled(); // Modal should stay open on error
    });
  });
});