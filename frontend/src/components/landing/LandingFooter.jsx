import React from 'react';
import { Link } from 'react-router-dom';

export const LandingFooter = () => {
  return (
    <footer className="bg-paper py-16 border-t border-hairline/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Brand & Technical Architecture Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 font-sans text-xs">
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
              Imagine It. Automate It.
            </div>
          </div>

          {/* Resources & Open Source */}
          <div className="space-y-2 font-mono">
            <span className="text-[10px] uppercase tracking-wider text-ink font-bold block">
              Resources
            </span>
            <ul className="space-y-1.5 text-ink-secondary text-[11px]">
              <li>
                <a
                  href="https://github.com/Apurvk28/fable"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ink hover:underline transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <Link to="/docs" className="hover:text-ink hover:underline transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/llms" className="hover:text-ink hover:underline transition-colors">
                  LLMs &amp; Models
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Security */}
          <div className="space-y-2 font-mono">
            <span className="text-[10px] uppercase tracking-wider text-ink font-bold block">
              Legal &amp; Security
            </span>
            <ul className="space-y-1.5 text-ink-secondary text-[11px]">
              <li>
                <Link to="/terms" className="hover:text-ink hover:underline transition-colors">
                  Terms &amp; Conditions
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-ink hover:underline transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-ink hover:underline transition-colors">
                  Privacy &amp; Security
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Colophon Strip */}
        <div className="pt-6 border-t border-hairline flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-ink-muted">
          <div>
            &copy; 2026 Fable Platform. 
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
