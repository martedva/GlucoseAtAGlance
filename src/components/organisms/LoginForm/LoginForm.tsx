import { memo, useState } from 'react';
import { Button, Input } from '@/components/atoms';
import { AlertBanner } from '@/components/molecules';
import './LoginForm.css';

export interface LoginFormProps {
  onLoginSuccess: () => void;
  onError: () => void;
}

/**
 * Organism LoginForm component
 * Handles user authentication
 */
const LoginForm = memo(function LoginForm({ onLoginSuccess, onError }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please enter both email and password');
      onError();
      return;
    }

    setIsLoading(true);

    try {
      await new Promise<void>((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            action: 'Login',
            email,
            password,
          },
          (response: { success?: boolean; error?: string }) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else if (response.error) {
              reject(new Error(response.error));
            } else {
              resolve();
            }
          }
        );
      });

      onLoginSuccess();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      onError();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit} aria-label="Login form">
      <h1 className="login-form__title">Welcome Back</h1>
      <p className="login-form__description">
        Sign in to view your glucose data
      </p>

      <div className="login-form__fields">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          disabled={isLoading}
          autoComplete="email"
          aria-label="Email address"
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          disabled={isLoading}
          autoComplete="current-password"
          aria-label="Password"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        className="login-form__submit"
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>

      {error && (
        <div className="login-form__error">
          <AlertBanner variant="error" text={error} />
        </div>
      )}
    </form>
  );
});

export default LoginForm;