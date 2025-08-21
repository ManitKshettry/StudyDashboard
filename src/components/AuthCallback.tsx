import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Auth callback initiated...');
        console.log('Current URL:', window.location.href);
        
        if (window.location.hash) {
          console.log('Hash fragment detected, parsing auth data...');
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const refreshToken = hashParams.get('refresh_token');
          const expiresIn = hashParams.get('expires_in');
          
          if (accessToken) {
            console.log('Setting up session from hash parameters...');
            const { data: { user }, error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            
            if (setSessionError) {
              console.error('Error setting session:', setSessionError);
              throw setSessionError;
            }
            
            if (user) {
              console.log('User authenticated successfully:', user.email);
              navigate('/dashboard');
              return;
            }
          }
        }

        // If we get here, try to get an existing session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          throw sessionError;
        }

        if (session) {
          console.log('Session found:', session.user.email);
          navigate('/dashboard');
        } else {
          console.log('No valid session found');
          navigate('/auth');
        }
      } catch (err) {
        console.error('Unexpected error in auth callback:', err);
        navigate('/auth');
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      <span className="ml-3 text-gray-600">Authenticating...</span>
    </div>
  );
};

export default AuthCallback;
