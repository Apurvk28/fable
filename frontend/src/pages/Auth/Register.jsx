import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GrainGradient } from '@paper-design/shaders-react';
import { Alert } from '../../components/ui/Alert';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';

export const Register = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

    if (!fullName || fullName.length < 2) {
      setFormError('Please enter your first and last name.');
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

    if (!agreedToTerms) {
      setFormError('You must agree to the Terms and Services and Privacy Policy to create an account.');
      return;
    }

    setSubmitting(true);
    try {
      await register(fullName, email.trim(), password);
      navigate('/profile', { replace: true, state: { justRegistered: true } });
    } catch (err) {
      setFormError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen bg-paper p-3 text-ink antialiased [font-synthesis:none]">
      <div className="grid min-h-[calc(100vh-1.5rem)] gap-6 lg:grid-cols-[0.94fr_1.06fr]">
        {/* Left Column: Form */}
        <div className="flex min-h-[760px] items-center rounded-md border border-ink/10 bg-white px-6 py-12 sm:px-10 lg:min-h-0 lg:px-14 lg:py-16 xl:px-20 shadow-sm">
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
                Create an account
              </h1>
              <p className="mt-2 text-base leading-snug text-ink-secondary sm:text-lg">
                Brainstorm in chat, build in cowork
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
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldInput
                  id="firstName"
                  label="First Name"
                  placeholder="Ada"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  autoComplete="given-name"
                />
                <FieldInput
                  id="lastName"
                  label="Last Name"
                  placeholder="Lovelace"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  autoComplete="family-name"
                />
              </div>

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

              <div className="grid gap-4 sm:grid-cols-2">
                <FieldInput
                  id="password"
                  label="Password"
                  type="password"
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
                <FieldInput
                  id="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>

              {/* Single Checkbox as requested */}
              <div className="pt-2 text-sm leading-5 text-ink-secondary">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <span className="relative mt-0.5 size-4 shrink-0">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="peer size-full appearance-none rounded-[3px] border border-ink/30 bg-white checked:border-ink checked:bg-ink transition-colors"
                    />
                    <svg
                      viewBox="0 0 12 12"
                      className="pointer-events-none absolute inset-0 hidden size-full p-0.5 text-white peer-checked:block"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M3 6.2 5 8.1 9 3.9"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="text-xs sm:text-[13px] leading-relaxed">
                    By creating an account, you agree to our{' '}
                    <Link
                      to="/terms"
                      className="font-medium text-ink underline underline-offset-2 hover:text-ink-secondary"
                    >
                      Terms and Services
                    </Link>{' '}
                    and{' '}
                    <Link
                      to="/privacy"
                      className="font-medium text-ink underline underline-offset-2 hover:text-ink-secondary"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-[10px] border border-ink bg-ink text-base font-medium text-white transition-all hover:bg-ink/85 disabled:opacity-50 cursor-pointer shadow-editorial"
              >
                {submitting ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-4 text-center text-xs font-mono text-ink-secondary">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-bold text-ink underline underline-offset-2 hover:text-ink-secondary"
                >
                  Sign in
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
                Deterministic execution engine, LLM tools, and real-time observability built for developers.
              </p>
            </div>

            <Link
              to="/docs"
              className="mb-4 inline-flex h-12 max-w-fit items-center gap-3 rounded-[10px] border border-white/25 bg-black/20 px-5 text-sm font-medium text-white/90 backdrop-blur-md transition-all hover:border-white/45 hover:bg-black/30 hover:text-white"
            >
              <ShieldCheck className="size-5 shrink-0 text-fable-chartreuse" />
              <span className="truncate whitespace-nowrap">
                Explore Platform Architecture
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

export default Register;
