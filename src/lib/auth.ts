import { supabase } from "@/integrations/supabase/client";

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
      flow: 'popup'
    },
  });

  if (error) throw error;
  return data;
}; 