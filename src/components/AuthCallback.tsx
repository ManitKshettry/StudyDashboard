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
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error in auth callback:', error);
          navigate('/auth');
          return;
        }

        if (session) {
          console.log('Session established successfully');
          navigate('/dashboard');
        } else {
          console.log('No session found in callback');
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
