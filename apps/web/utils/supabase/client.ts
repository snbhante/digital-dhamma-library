import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

export const createClient = () => {
  if (!supabaseUrl || !supabaseKey) {
    // Return a dummy client or handle it gracefully if needed, 
    // but @supabase/ssr createBrowserClient will throw if url/key are missing.
    // Wait, let's just pass dummy values during build?
    // Let's pass a dummy URL so it doesn't throw at build time.
    return createBrowserClient(
      supabaseUrl || "https://dummy.supabase.co",
      supabaseKey || "dummy_key",
    );
  }
  return createBrowserClient(
    supabaseUrl,
    supabaseKey,
  );
};
