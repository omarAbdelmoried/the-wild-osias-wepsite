import { createClient } from "@supabase/supabase-js";
export const supabaseUrl = "https://cftadzrzusbqlgrakqdl.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmdGFkenJ6dXNicWxncmFrcWRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMyNjYxNzcsImV4cCI6MjA2ODg0MjE3N30._XP75CAjR4ChZgt39qFqaCI5jf2UNXbG7sUH3xabkpU";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
