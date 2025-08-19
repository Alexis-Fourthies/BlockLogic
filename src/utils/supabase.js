import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://xrcjrxtnuzfashhbuykd.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyY2pyeHRudXpmYXNoaGJ1eWtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI4MjYyNjMsImV4cCI6MjA2ODQwMjI2M30.Qvazk3Pxrfoxej1fMNJ_E-xttaYUscb_Dwy-33Z84e0";

export const supabase = createClient(supabaseUrl, supabaseKey);
