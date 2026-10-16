import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GrainGradient } from '@paper-design/shaders-react';
import { Alert } from '../../components/ui/Alert';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!email || !password) {
      setFormError('Please enter both email and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen bg-paper p-3 text-ink antialiased [font-synthesis:none]">
      <div className="grid min-h-[calc(100vh-1.5rem)] gap-6 lg:grid-cols-[0.94fr_1.06fr]">
        {/* Left Column: Login Form */}
        <div className="flex min-h-[760px] items-center rounded-md border border-ink/10 bg-white px-6 py-12 sm:px-10 lg:min-h-0 lg:px-14 lg:py-20 xl:px-20 shadow-sm">
          <div className="mx-auto w-full max-w-[590px]">
            {/* Header */}
            <div>
              <Link
                to="/"
                className="inline-flex items-center gap-2 mb-6 group text-xs font-mono uppercase tracking-widest text-ink-muted hover:text-ink transition-colors"
              >
                <div className="w-7 h-7 rounded-sm bg-ink flex items-center justify-center text-fable-chartreuse font-mono font-bold text-sm shadow-editorial transition-transform group-hover:scale-105">
                  F
                </div>
                <span>Back to Fable</span>
              </Link>

              <h1 className="text-3xl font-serif font-medium tracking-[-0.03em] sm:text-4xl lg:text-[40px] lg:leading-[1.1] text-ink">
                Sign in to Fable
              </h1>
              <p className="mt-2 text-base leading-snug text-ink-secondary sm:text-lg">
                Access your AI agents, tools, and execution traces
              </p>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="mt-6">
                <Alert variant="error" onClose={() => setFormError('')}>
                  {formError}
                </Alert>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <FieldInput
                id="email"
                label="Email Address"
                type="email"
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />

              <FieldInput
                id="password"
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-[10px] border border-ink bg-ink text-base font-medium text-white transition-all hover:bg-ink/85 disabled:opacity-50 cursor-pointer shadow-editorial"
              >
                {submitting ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-4 text-center text-xs font-mono text-ink-secondary">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-bold text-ink underline underline-offset-2 hover:text-ink-secondary"
                >
                  Create one now
                </Link>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Shaders Artwork */}
        <div className="relative flex min-h-[720px] overflow-hidden rounded-md bg-ink p-8 text-white sm:p-12 lg:min-h-0">
          <GrainGradient
            speed={1}
            scale={1}
            rotation={0}
            offsetX={0}
            offsetY={0}
            softness={0.5}
            intensity={0.5}
            noise={0.25}
            shape="corners"
            frame={2854.5}
            colors={["#FFFFFF", "#FC7819", "#FC7819", "#FFFFFF"]}
            colorBack="#00000000"
            className="absolute inset-0 bg-ink"
          />

          <div className="relative z-10 flex h-full w-full flex-col justify-between">
            <div className="pt-6 lg:pt-12">
              <h2 className="max-w-[620px] text-5xl font-serif font-medium tracking-[-0.04em] text-white sm:text-6xl lg:text-[64px] lg:leading-[1.02] xl:text-[70px]">
                Think fast,
                <br />
                Build faster
              </h2>
              <p className="mt-4 text-white/70 max-w-md font-sans text-base sm:text-lg">
                Turn your ideas into intelligent workflows. Build, configure, and simulate AI-powered automation.
              </p>
            </div>

            <Link
              to="/docs"
              className="mb-4 inline-flex h-12 max-w-fit items-center gap-3 rounded-[10px] border border-white/25 bg-black/20 px-5 text-sm font-medium text-white/90 backdrop-blur-md transition-all hover:border-white/45 hover:bg-black/30 hover:text-white"
            >
              <ShieldCheck className="size-5 shrink-0 text-fable-chartreuse" />
              <span className="truncate whitespace-nowrap">
                Explore Documentation
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

function FieldInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required = false,
  autoComplete,
}) {
  return (
    <div className="space-y-1">
      <label
        htmlFor={id}
        className="block text-[11px] font-mono uppercase tracking-wider text-ink-muted"
      >
        {label}
      </label>
      <div className="flex h-12 items-center rounded-[10px] border border-ink/20 bg-paper-light px-4 transition-all focus-within:border-ink focus-within:bg-white focus-within:ring-1 focus-within:ring-ink">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="w-full bg-transparent text-sm sm:text-base text-ink outline-none placeholder:text-ink/30"
        />
      </div>
    </div>
  );
}

export default Login;
