// src/components/shared/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, token, isLoading } = useAuth();

  // FIX: Show loading while checking auth to prevent flash of protected content
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Not authenticated
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  const userRole = user?.role?.role_name;
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    if (userRole === "bps_admin") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (userRole === "village_officer") {
      const getSubdomain = () => {
        const hostname = window.location.hostname;
        if (/^[0-9.]+$/.test(hostname)) return null;
        const parts = hostname.split('.');
        const isTwoPartTld = parts[parts.length - 2] === 'co' || parts[parts.length - 2] === 'web' || parts[parts.length - 2] === 'go';
        const minPartsForSubdomain = isTwoPartTld ? 4 : 3;
        if (parts.length < minPartsForSubdomain || parts[0] === 'www' || parts[0] === 'api') return null;
        return parts[0];
      };

      const subdomain = getSubdomain();
      if (subdomain) {
        return <Navigate to="/dashboard" replace />;
      } else {
        const slug = user?.village?.name ? user.village.name.toLowerCase().replace(/\s+/g, '-') : 'desa';
        return <Navigate to={`/${slug}/dashboard`} replace />;
      }
    }
    return <Navigate to="/login" replace />;
  }

  return children;
}
