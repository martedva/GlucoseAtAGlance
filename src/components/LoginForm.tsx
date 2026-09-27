import { useState } from 'react';
import { authService } from '@/services/authService';
import './LoginForm.css';

interface LoginFormProps {
  onLoginSuccess: () => void;
  onError: (error: string) => void;
}

const LoginForm = ({ onLoginSuccess, onError }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await authService.login(email, password);
      onLoginSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Login failed. Please check your credentials.';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-form-container" role="main" aria-label="Login form">
      <div className="login-form-wrapper">
        <h2 className="login-title">Glucose At A Glance</h2>
        <p className="login-subtitle">Sign in with your LibreLinkUp account</p>

        <form onSubmit={handleSubmit} className="login-form" aria-describedby="login-help">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={isLoading}
              autoComplete="username"
              aria-required="true"
              aria-invalid={!!error}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              disabled={isLoading}
              autoComplete="current-password"
              aria-required="true"
              aria-invalid={!!error}
            />
          </div>

          {error && (
            <div className="error-message" role="alert" aria-live="assertive" aria-atomic="true">
              {error}
            </div>
          )}

          <button type="submit" className="login-button" disabled={isLoading} aria-busy={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p id="login-help" className="login-help">
          Your credentials are stored locally and never sent to third parties.
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
