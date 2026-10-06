import React, { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { AuthView } from '../pages/auth/AuthView.tsx';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center bg-light">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Validating JWT session...</span>
        </div>
        <p className="text-secondary small fw-medium">Validating JWT Session & Authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return <>{children}</>;
};
