import { memo, useState } from 'react';
import { Button, Input } from '@/components/atoms';
import { authService } from '@/services/authService';
import styles from './LoginForm.module.scss';

export interface LoginFormProps {
  onLoginSuccess: () => void;
  onError: (error: string) => void;
}

/**
 * Organism LoginForm component
 * User authentication form with email and password
 */
const LoginForm = memo(function LoginForm({ onLoginSuccess, onError }: LoginFormProps) {
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
    <div className={styles.loginFormContainer} role="main" aria-label="Login form">
      <div className={styles.loginFormWrapper}>
        <h2 className={styles.loginForm__title}>Glucose At A Glance</h2>
        <p className={styles.loginForm__subtitle}>Sign in with your LibreLinkUp account</p>

        <form onSubmit={handleSubmit} className={styles.loginForm} aria-describedby="login-help">
          <div className={styles.loginForm__group}>
            <label htmlFor="email" className={styles.loginForm__label}>
              Email
            </label>
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
              className={styles.loginForm__input}
            />
          </div>

          <div className={styles.loginForm__group}>
            <label htmlFor="password" className={styles.loginForm__label}>
              Password
            </label>
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
              className={styles.loginForm__input}
            />
          </div>

          {error && (
            <div className={styles.loginForm__error} role="alert" aria-live="assertive" aria-atomic="true">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className={styles.loginForm__button}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p id="login-help" className={styles.loginForm__help}>
          Your credentials are stored locally and never sent to third parties.
        </p>
      </div>
    </div>
  );
});

export default LoginForm;