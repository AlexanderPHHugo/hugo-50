// Capa Services - Cliente Supabase desacoplado
// Patrón: Singleton del cliente para que solo rsvpRepository lo use
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
import { CONFIG } from "../../config.js";

let supabaseInstance = null;

export function getSupabase() {
  if (supabaseInstance) return supabaseInstance;
  
  const { url, anonKey } = CONFIG.supabase;
  if (!url || url.includes("TU-PROYECTO") || !anonKey || anonKey.includes("TU_ANON")) {
    console.warn("[Supabase] Credenciales no configuradas en config.js");
    return null;
  }
  supabaseInstance = createClient(url, anonKey);
  return supabaseInstance;
}
