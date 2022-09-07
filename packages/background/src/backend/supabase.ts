import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://tgwmsdpkornnpyxoeruj.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnd21zZHBrb3JubnB5eG9lcnVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjI1ODQ1OTIsImV4cCI6MTk3ODE2MDU5Mn0.t3rKnUyPnsJWXAk3GEgil-dXkFKeO4r-SazkV5BmJtY"
  // String(process.env.SUPABASE_URL),
  // String(process.env.SUPABASE_KEY)
);
