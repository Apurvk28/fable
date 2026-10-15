import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Lock, Mail, User, ArrowRight, ShieldCheck } from 'lucide-react';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || name.trim().length < 2) {
      setFormError('Please enter a name (at least 2 characters).');
      return;
    }

    if (!email) {
      setFormError('Please provide a valid email address.');
      return;
    }

    if (!password || password.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setFormError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2 mb-6">
        <Link
          to="/"
          onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}
          className="inline-block group focus:outline-none cursor-pointer"
          title="Go to Fable Home"
        >
          <div className="w-10 h-10 rounded-sm bg-ink flex items-center justify-center text-fable-chartreuse font-mono font-bold text-xl shadow-editorial mx-auto transition-transform group-hover:scale-105">
            F
          </div>
          <h1 className="font-serif text-3xl font-medium tracking-tight text-ink mt-2 group-hover:text-ink-secondary transition-colors">
            Create Fable Account
          </h1>
        </Link>
        <p className="text-xs font-mono uppercase tracking-widest text-ink-secondary">
          Developer Agent Platform
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="bg-white">
          <CardHeader className="bg-paper-muted/30">
            <div>
              <CardTitle className="text-base">Builder Profile</CardTitle>
              <CardDescription>Register to configure, test, and orchestrate AI agents</CardDescription>
            </div>
            <Badge variant="accent" size="sm">New</Badge>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {formError && (
                <Alert variant="error" onClose={() => setFormError('')}>
                  {formError}
                </Alert>
              )}

              <Input
                label="Full Name"
                type="text"
                id="name"
                required
                icon={User}
                placeholder="Ada Lovelace"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />

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
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                helperText="Must be at least 8 characters long"
              />

              <Input
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                required
                icon={Lock}
                placeholder="Repeat password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={submitting}
                icon={ArrowRight}
              >
                Create Account & Sign In
              </Button>
            </CardContent>

            <CardFooter className="justify-center text-xs text-ink-secondary">
              <span>Already have an account?</span>
              <Link to="/login" className="font-semibold text-ink hover:underline ml-1">
                Sign in instead &rarr;
              </Link>
            </CardFooter>
          </form>
        </Card>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] font-mono text-ink-muted">
          <ShieldCheck className="w-3.5 h-3.5 text-status-success" />
          <span>Passwords securely hashed with bcrypt (salt rounds: 12)</span>
        </div>
      </div>
    </div>
  );
};
