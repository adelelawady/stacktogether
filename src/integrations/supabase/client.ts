// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = "https://mfrldwopjjsetjxatskv.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mcmxkd29wampzZXRqeGF0c2t2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI1NzUxNDIsImV4cCI6MjA0ODE1MTE0Mn0.cKzgzbBGjshihcEuEwmdZKh0lv595O8E_vnrfoiCwSM";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);