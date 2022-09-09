import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "http://localhost:54321",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24ifQ.625_WdcF3KHqz5amU0x2X5WWHP-OEs_4qj0ssLNHzTs"
  // "https://tgwmsdpkornnpyxoeruj.supabase.co",
  // "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnd21zZHBrb3JubnB5eG9lcnVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjI1ODQ1OTIsImV4cCI6MTk3ODE2MDU5Mn0.t3rKnUyPnsJWXAk3GEgil-dXkFKeO4r-SazkV5BmJtY"
  // String(process.env.SUPABASE_URL),
  // String(process.env.SUPABASE_KEY)
);
