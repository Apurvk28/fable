import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2 mb-6">
        <div className="w-10 h-10 rounded-sm bg-ink flex items-center justify-center text-fable-chartreuse font-mono font-bold text-xl shadow-editorial mx-auto">
          F
        </div>
        <h1 className="font-serif text-3xl font-medium tracking-tight text-ink">
          Sign In to Fable
        </h1>
        <p className="text-xs font-mono uppercase tracking-widest text-ink-secondary">
          Developer Agent Platform
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="bg-white">
          <CardHeader className="bg-paper-muted/30">
            <div>
              <CardTitle className="text-base">Account Credentials</CardTitle>
              <CardDescription>Enter your email and password to access your agents</CardDescription>
            </div>
            <Badge variant="outline" size="sm">Phase 2</Badge>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {formError && (
                <Alert variant="error" onClose={() => setFormError('')}>
                  {formError}
                </Alert>
              )}

              <Input
                label="Email Address"
                type="email"
                id="email"
                required
                icon={Mail}
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />

              <Input
                label="Password"
                type="password"
                id="password"
                required
                icon={Lock}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={submitting}
                icon={ArrowRight}
              >
                Sign In
              </Button>
            </CardContent>

            <CardFooter className="justify-center text-xs text-ink-secondary">
              <span>Don't have an account yet?</span>
              <Link to="/register" className="font-semibold text-ink hover:underline ml-1">
                Create one now &rarr;
              </Link>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] font-mono text-ink-muted">
          <ShieldCheck className="w-3.5 h-3.5 text-status-success" />
          <span>HttpOnly session cookies &middot; bcrypt hashed passwords</span>
        </div>
      </div>
    </div>
  );
};
