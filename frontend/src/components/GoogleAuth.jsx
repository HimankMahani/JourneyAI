import { useEffect } from 'react';
import { useAuth } from '@/contexts/useAuth';

const GoogleAuth = ({ onSuccess, onError, buttonText }) => {
  const { login } = useAuth();

  useEffect(() => {
    // Load the Google API script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    // Initialize Google Sign-In when the script is loaded
    window.handleGoogleSignIn = async (response) => {
      try {
        // The ID token is sent to your backend in the 'credential' field
        const { credential } = response;
        
        // Call your backend API to verify and authenticate with the token
        // This would typically be a new method in your authService that handles Google auth
        // For now, we'll console log the token and simulate a successful login
        console.log('Google Sign-In token:', credential);
        
        // Here you would normally call a backend API endpoint
        // const result = await authService.googleLogin(credential);
        
        // Simulate successful login
        onSuccess?.();
      } catch (error) {
        console.error('Google Sign-In error:', error);
        onError?.(error.message || 'Failed to authenticate with Google');
      }
    };

    return () => {
      delete window.handleGoogleSignIn;
    };
  }, [login, onSuccess, onError]);

  return (
    <div
      id="g_id_onload"
      data-client_id="YOUR_GOOGLE_CLIENT_ID" // Replace with your actual Google Client ID
      data-context="signin"
      data-ux_mode="popup"
      data-callback="handleGoogleSignIn"
      data-auto_prompt="false"
    >
      <div
        className="g_id_signin"
        data-type="standard"
        data-shape="rectangular"
        data-theme="outline"
        data-text={buttonText || "signin_with"}
        data-size="large"
        data-logo_alignment="left"
      ></div>
    </div>
  );
};

export default GoogleAuth;
