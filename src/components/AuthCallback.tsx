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
        
        // First try to get the session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          throw sessionError;
        }

        if (!session) {
          console.log('No session found, attempting to exchange token...');
          const params = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = params.get('access_token');
          
          if (accessToken) {
            console.log('Found access token, setting session...');
            const { error: setSessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: params.get('refresh_token') || '',
            });
            
            if (setSessionError) {
              console.error('Error setting session:', setSessionError);
              throw setSessionError;
            }
          }
        }

        // Check session one more time
        const { data: { session: finalSession } } = await supabase.auth.getSession();
        
        if (finalSession) {
          console.log('Session established successfully');
          navigate('/dashboard');
        } else {
          console.log('No session found after all attempts');
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
