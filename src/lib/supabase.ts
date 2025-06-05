import { createClient } from "@supabase/supabase-js";

// Since we have a .env file, TypeScript knows these values exist
export const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
