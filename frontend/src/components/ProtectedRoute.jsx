import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  // Check if we're in test mode
  const isTestMode = window.location.search.includes('test=true') || 
                     localStorage.getItem('testMode') === 'true';
  
  // If authentication is still loading, show a loading indicator
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to login if user is not authenticated and not in test mode
  if (!isAuthenticated && !isTestMode) {
    return <Navigate to="/login" />;
  }
  
  // If authenticated or in test mode, render the protected content
  return children;
};

export default ProtectedRoute;
