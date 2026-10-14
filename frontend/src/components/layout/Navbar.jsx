import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ShieldCheck, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar = ({ backendStatus }) => {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-hairline bg-paper/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="w-8 h-8 rounded-sm bg-ink flex items-center justify-center text-fable-chartreuse font-mono font-bold text-lg shadow-editorial transition-transform group-hover:scale-105">
            F
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-xl tracking-tight text-ink">Fable</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-ink-muted border border-hairline px-1.5 py-0.2 rounded-sm bg-paper-muted">
                v1.0-Phase2
              </span>
            </div>
            <p className="text-[11px] text-ink-secondary hidden sm:block">Imagine It. Automate It.</p>
          </div>
        </Link>

        {/* Status Indicators & Auth Controls */}
        <div className="flex items-center gap-3">
          {backendStatus?.status === 'ok' ? (
            <Badge variant="success" dot={true} size="md" className="hidden sm:inline-flex">
              API (:5001)
            </Badge>
          ) : backendStatus?.status === 'error' ? (
            <Badge variant="error" dot={true} size="md" className="hidden sm:inline-flex">
              API Offline
            </Badge>
          ) : null}

          {user ? (
            <div className="flex items-center gap-3 pl-3 border-l border-hairline">
              <div className="flex items-center gap-2 text-left">
                <div className="w-7 h-7 rounded-sm bg-fable-chartreuse/25 border border-ink text-ink flex items-center justify-center font-mono font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <div className="text-xs font-medium text-ink leading-tight truncate max-w-[140px]">
                    {user.name}
                  </div>
                  <div className="text-[10px] font-mono text-ink-muted truncate max-w-[140px]">
                    {user.email}
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                icon={LogOut}
                onClick={logout}
                title="Sign out of your session"
              >
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-3 border-l border-hairline">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Create Account
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
