import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Wrench,
  Bot
} from 'lucide-react';

export const LandingFooter = ({ isAuthenticated = false }) => {
  return (
    <footer className="bg-paper border-t border-hairline py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-16">
        {/* Pre-footer Call to Action Banner */}
        <div className="p-8 sm:p-12 bg-white rounded-sm border border-hairline shadow-editorial-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-xl space-y-2">
            <h2 className="font-serif text-3xl sm:text-4xl font-normal text-ink tracking-tight">
              Ready to construct your agent?
            </h2>
            <p className="text-sm text-ink-secondary font-sans leading-relaxed">
              Start building autonomous AI agents with deterministic tools, server-controlled permissions, and persistent audit logs today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button variant="primary" size="lg" icon={ArrowRight} className="font-mono text-xs">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button variant="primary" size="lg" icon={ArrowRight} className="font-mono text-xs">
                    Create Account Free
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="font-mono text-xs">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Brand & Technical Architecture Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-4 border-t border-hairline font-sans text-xs">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-sm bg-ink text-fable-chartreuse flex items-center justify-center font-mono font-bold text-base shadow-editorial">
                F
              </div>
              <span className="font-serif font-bold text-xl text-ink">Fable</span>
            </div>
            <p className="text-xs text-ink-secondary max-w-sm leading-relaxed">
              Fable is a developer platform for creating, configuring, and running autonomous AI agents with deterministic sandboxes and observable execution history.
            </p>
            <div className="text-[11px] font-mono text-ink-muted">
              Tagline: "Imagine It. Automate It."
            </div>
          </div>

          {/* Platform Capabilities */}
          <div className="space-y-2 font-mono">
            <span className="text-[10px] uppercase tracking-wider text-ink font-bold block">
              Core Capabilities
            </span>
            <ul className="space-y-1.5 text-ink-secondary text-[11px]">
              <li>• Groq LLM Inference</li>
              <li>• Recursive Math Calculator</li>
              <li>• Text Processing Sandbox</li>
              <li>• Date &amp; Time Utilities</li>
              <li>• Immutable Run Snapshots</li>
            </ul>
          </div>

          {/* Security & Isolation */}
          <div className="space-y-2 font-mono">
            <span className="text-[10px] uppercase tracking-wider text-ink font-bold block">
              Security Architecture
            </span>
            <ul className="space-y-1.5 text-ink-secondary text-[11px]">
              <li>• Zero Arbitrary Code (No eval)</li>
              <li>• HttpOnly Secure Cookies</li>
              <li>• Signed HMAC CSRF Validation</li>
              <li>• Strict User Data Isolation</li>
              <li>• 3-Turn Loop Hard Cap</li>
            </ul>
          </div>
        </div>

        {/* Bottom Colophon Strip */}
        <div className="pt-6 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-ink-muted">
          <div>
            &copy; 2026 Fable Platform. Workshop Editorial Architecture.
          </div>
          <div className="flex items-center gap-4">
            <a href="#how-it-works" className="hover:text-ink transition-colors">How It Works</a>
            <a href="#blueprint" className="hover:text-ink transition-colors">3D Blueprint</a>
            <a href="#tools" className="hover:text-ink transition-colors">Tool Sandbox</a>
            <a href="#simulation" className="hover:text-ink transition-colors">Interactive Demo</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
