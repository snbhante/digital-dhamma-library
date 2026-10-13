import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser-only Supabase client factory.
 *
 * Never substitute a dummy URL/key: doing so hides missing GitHub Actions
 * configuration and produces requests to a non-existent project. Public pages
 * may build without Supabase, but code that requests this client must fail with
 * an actionable configuration error.
 */
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || "";

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and " +
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local for development " +
      "and GitHub Actions Variables for GitHub Pages."
    );
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
};
