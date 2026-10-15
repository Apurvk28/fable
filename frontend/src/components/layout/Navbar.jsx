import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ShieldCheck, LogOut, Bot, LayoutDashboard, Play, Clock } from 'lucide-react';

export const Navbar = ({ backendStatus }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/', { replace: true });
    }
  };

  const isNavActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const brandDestination = user ? '/dashboard' : '/';

  return (
    <header className="border-b border-hairline bg-paper/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Left Nav */}
        <div className="flex items-center gap-6">
          <Link
            to={brandDestination}
            onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 group focus:outline-none cursor-pointer"
            title={user ? "Go to Dashboard" : "Go to Landing Page"}
          >
            <div className="w-8 h-8 rounded-sm bg-ink flex items-center justify-center text-fable-chartreuse font-mono font-bold text-lg shadow-editorial transition-transform group-hover:scale-105">
              F
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-xl tracking-tight text-ink">Fable</span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-ink-muted border border-hairline px-1.5 py-0.2 rounded-sm bg-paper-muted">
                  v1.0
                </span>
              </div>
              <p className="text-[11px] text-ink-secondary hidden sm:block">Imagine It. Automate It.</p>
            </div>
          </Link>

          {/* Primary In-App Navigation when Authenticated */}
          {user ? (
            <nav className="hidden sm:flex items-center gap-1 pl-4 border-l border-hairline">
              <Link
                to="/dashboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider transition-colors ${
                  isNavActive('/dashboard')
                    ? 'bg-ink text-white font-semibold'
                    : 'text-ink-secondary hover:text-ink hover:bg-paper-muted'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/agents"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider transition-colors ${
                  isNavActive('/agents')
                    ? 'bg-ink text-white font-semibold'
                    : 'text-ink-secondary hover:text-ink hover:bg-paper-muted'
                }`}
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Agents</span>
              </Link>

              <Link
                to="/executions"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider transition-colors ${
                  isNavActive('/executions')
                    ? 'bg-ink text-white font-semibold'
                    : 'text-ink-secondary hover:text-ink hover:bg-paper-muted'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Executions</span>
              </Link>

              <Link
                to="/playground"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-mono uppercase tracking-wider transition-colors ${
                  isNavActive('/playground')
                    ? 'bg-ink text-white font-semibold'
                    : 'text-ink-secondary hover:text-ink hover:bg-paper-muted'
                }`}
              >
                <Play className="w-3.5 h-3.5" />
                <span>Playground</span>
              </Link>
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-hairline font-mono text-xs uppercase tracking-wider text-ink-secondary">
              <a href="#how-it-works" className="px-3 py-1.5 rounded-sm hover:text-ink hover:bg-paper-muted transition-colors">
                How It Works
              </a>
              <a href="#blueprint" className="px-3 py-1.5 rounded-sm hover:text-ink hover:bg-paper-muted transition-colors">
                3D Blueprint
              </a>
              <a href="#tools" className="px-3 py-1.5 rounded-sm hover:text-ink hover:bg-paper-muted transition-colors">
                Tools
              </a>
              <a href="#simulation" className="px-3 py-1.5 rounded-sm hover:text-ink hover:bg-paper-muted transition-colors">
                Simulation
              </a>
            </nav>
          )}
        </div>

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
                onClick={handleLogout}
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
