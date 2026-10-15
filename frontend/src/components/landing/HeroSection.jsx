import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Bot,
  Play,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Wrench,
  Layers,
  Sparkles,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const HeroSection = ({ isAuthenticated = false }) => {
  const fullText = 'Automate It.';
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(85);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayText(fullText);
      return;
    }

    let timer;
    if (!isDeleting && displayText === fullText) {
      // Pause on completed text for 2 seconds (1.4x faster cycle)
      timer = setTimeout(() => {
        setIsDeleting(true);
        setTypingSpeed(42);
      }, 2000);
    } else if (isDeleting && displayText === '') {
      // Pause briefly when empty before re-typing
      setIsDeleting(false);
      setTypingSpeed(85);
      timer = setTimeout(() => {}, 280);
    } else {
      timer = setTimeout(() => {
        const nextText = isDeleting
          ? fullText.substring(0, displayText.length - 1)
          : fullText.substring(0, displayText.length + 1);
        setDisplayText(nextText);
      }, typingSpeed);
    }

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, typingSpeed, fullText]);

  return (
    <section className="relative pt-12 pb-20 border-b border-hairline overflow-hidden">
      {/* Background Subtle Grid Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#12131608_1px,transparent_1px),linear-gradient(to_bottom,#12131608_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 space-y-12">
        {/* Eyebrow & Live Status Pill */}
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="accent" size="sm" className="font-mono text-[11px] tracking-wider uppercase font-semibold">
            GenAI Developer Platform
          </Badge>
          <span className="text-xs font-mono text-ink-muted">·</span>
          <div className="flex items-center gap-1.5 text-xs font-mono text-ink-secondary">
            <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
            <span>MERN &amp; Groq Provider Active</span>
          </div>
        </div>

        {/* Hero Typography & Core Value Proposition */}
        <div className="max-w-4xl space-y-6">
          <h1
            className="font-serif text-5xl sm:text-6xl lg:text-7xl font-normal tracking-tight text-ink leading-[1.08]"
            aria-label="Imagine It. Automate It."
          >
            Imagine It. <br />
            <span className="italic font-normal inline-flex items-baseline">
              <span>{displayText || '\u00A0'}</span>
              <span
                className="inline-block w-[3px] sm:w-[4px] h-[0.75em] bg-ink ml-1.5 align-baseline animate-pulse"
                aria-hidden="true"
              />
            </span>
          </h1>

          <p className="text-base sm:text-lg text-ink-secondary max-w-2xl font-sans leading-relaxed">
            Describe what you want your AI agent to achieve. Fable configures its instructions, sandboxes its tools, and executes multi-turn tasks with complete observability and immutable audit traces.
          </p>

          {/* Primary & Secondary Call to Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="primary" size="lg" icon={ArrowRight} className="font-mono text-xs">
                  Enter Agent Workshop
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button variant="primary" size="lg" icon={ArrowRight} className="font-mono text-xs">
                  Create Your First Agent
                </Button>
              </Link>
            )}

            <a href="#blueprint">
              <Button variant="outline" size="lg" icon={Layers} className="font-mono text-xs">
                Inspect 3D Blueprint
              </Button>
            </a>

            <a href="#simulation">
              <Button variant="ghost" size="lg" icon={Sparkles} className="font-mono text-xs text-ink-secondary hover:text-ink">
                Try Live Simulation
              </Button>
            </a>
          </div>
        </div>

        {/* Technical Architectural Spec Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-hairline font-mono text-xs">
          <div className="p-3 bg-white rounded-sm border border-hairline shadow-editorial space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-ink-muted block">Deterministic Tools</span>
            <div className="flex items-center gap-1.5 text-ink font-semibold">
              <Wrench className="w-3.5 h-3.5 text-status-success" />
              <span>Zero Arbitrary Code</span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-sm border border-hairline shadow-editorial space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-ink-muted block">Inference Engine</span>
            <div className="flex items-center gap-1.5 text-ink font-semibold">
              <Cpu className="w-3.5 h-3.5 text-ink" />
              <span>Groq Ultra-Low Latency</span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-sm border border-hairline shadow-editorial space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-ink-muted block">Loop Protection</span>
            <div className="flex items-center gap-1.5 text-ink font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-ink" />
              <span>3-Turn Max Hard Cap</span>
            </div>
          </div>

          <div className="p-3 bg-white rounded-sm border border-hairline shadow-editorial space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-ink-muted block">Audit Reliability</span>
            <div className="flex items-center gap-1.5 text-ink font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-status-success" />
              <span>Immutable Snapshots</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
