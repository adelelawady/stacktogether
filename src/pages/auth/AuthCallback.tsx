import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash from the URL
        const hash = window.location.hash;
        if (!hash) return;

        // Parse the hash to get the access token
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        
        if (!accessToken) {
          throw new Error('No access token found');
        }

        // Exchange the token
        const { data: { session }, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: params.get('refresh_token') || '',
        });

        if (error) throw error;

        if (session) {
          toast({
            title: "Success",
            description: "Successfully signed in!",
          });
          navigate('/');
        }
      } catch (error) {
        console.error('Error handling auth callback:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to complete authentication. Please try again.",
        });
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-lg text-gray-600">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback; 