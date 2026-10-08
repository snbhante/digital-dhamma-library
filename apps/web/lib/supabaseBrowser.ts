import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || "";

export const supabaseConfigured = Boolean(url && publishableKey);

let browserClient: SupabaseClient | null = null;

export function supabaseBrowserClient() {
  if (!supabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY."
    );
  }
  if (!browserClient) {
    browserClient = createBrowserClient(url, publishableKey);
  }
  return browserClient;
}
