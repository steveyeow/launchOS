import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — running in demo mode");
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export async function getAuthToken(): Promise<string | null> {
  if (!supabase) return "dev-token";
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? "dev-token";
}
