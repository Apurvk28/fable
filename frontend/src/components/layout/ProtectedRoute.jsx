import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-ink-muted" />
          <p className="text-xs font-mono uppercase tracking-wider text-ink-secondary">
            Authenticating Session...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (sessionStorage.getItem('fable_logged_out')) {
      sessionStorage.removeItem('fable_logged_out');
      return <Navigate to="/" replace />;
    }
    // Redirect unauthenticated visitor to login page while saving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
