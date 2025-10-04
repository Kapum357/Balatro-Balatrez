import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Define and export the LeaderboardEntry type
export interface LeaderboardEntry {
  id: string;
  profile_id: string | null;
  display_name: string | null;
  score: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase URL or Key in environment variables.');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey);
