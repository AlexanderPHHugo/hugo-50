// Capa Repository - Único punto de acceso a datos
// Patrón Repositorio: si cambias de Supabase a otro backend, solo editas este archivo
import { getSupabase } from "../services/supabaseClient.js";

export const rsvpRepository = {
  async confirmar({ nombre, telefono, asistencia, acompanantes, mensaje }) {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error("Supabase no configurado. Edita config.js con tu URL y anonKey.");
    }
    const { data, error } = await supabase
      .from("confirmaciones")
      .insert([{ 
        nombre: nombre.trim(), 
        telefono: telefono?.trim() || null, 
        asistencia, 
        acompanantes: parseInt(acompanantes) || 0, 
        mensaje: mensaje?.trim() || null 
      }])
      .select();
    if (error) throw error;
    return data[0];
  },

  async listar() {
    const supabase = getSupabase();
    if (!supabase) return [];
    const { data, error } = await supabase
      .from("confirmaciones")
      .select("id,nombre,asistencia,acompanantes,mensaje,created_at")
      .eq("asistencia", "si")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return data || [];
  },

  suscribirRealtime(onInsert) {
    const supabase = getSupabase();
    if (!supabase) return { unsubscribe: () => {} };
    const channel = supabase
      .channel("lista-publica")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "confirmaciones" }, (payload) => {
        if (payload.new?.asistencia === "si") onInsert(payload.new);
      })
      .subscribe();
    return { unsubscribe: () => supabase.removeChannel(channel) };
  }
};
