// Componente GuestList - Lista publica visible para todos
import { rsvpRepository } from "../repositories/rsvpRepository.js";

function escapeHtml(s) {
  return String(s).replace(/[&<>"'`=\/]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','`':'&#96;','=':'&#61;','/':'&#47;'}[c]));
}
function iniciales(nombre) {
  return escapeHtml(nombre.trim().split(/\s+/).slice(0,2).map(s=>s[0].toUpperCase()).join(""));
}
function tiempoHace(fecha) {
  const d = Math.floor((Date.now() - new Date(fecha).getTime())/1000);
  if (d < 60) return "hace un momento";
  if (d < 3600) return `hace ${Math.floor(d/60)} min`;
  if (d < 86400) return `hace ${Math.floor(d/3600)} h`;
  return `hace ${Math.floor(d/86400)} d`;
}
function cardHTML(item) {
  const acomp = item.acompanantes > 0 ? `+${item.acompanantes} acomp.` : "Solo";
  const msg = item.mensaje ? `<p class="text-sm text-white/70 mt-2 italic">"${escapeHtml(item.mensaje)}"</p>` : `<p class="lista-placeholder">¡Confirmó su asistencia!</p>`;
  return `<div class="lista-card">
    <div style="display:flex; gap:14px; align-items:center;">
      <div class="lista-avatar">${iniciales(item.nombre)}</div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="font-bold text-white">${escapeHtml(item.nombre)}</span>
          <span class="text-[10px] tracking-widest bg-gold text-black px-2 py-1 rounded-full font-bold">${acomp}</span>
        </div>
      </div>
    </div>
    ${msg}
    <p class="text-[11px] text-white/30 mt-2">${tiempoHace(item.created_at)}</p>
  </div>`;
}
export async function initGuestList() {
  const listEl = document.getElementById("invitados-lista");
  const countEl = document.getElementById("invitados-count");
  const emptyEl = document.getElementById("invitados-empty");
  if (!listEl) return;

  async function render() {
    try {
      const data = await rsvpRepository.listar();
      if (!data || data.length === 0) {
        countEl.textContent = "0 confirmados";
        emptyEl.textContent = "Aún no hay confirmaciones. ¡Sé el primero!";
        emptyEl.classList.remove("hidden");
        listEl.innerHTML = "";
        return;
      }
      emptyEl.classList.add("hidden");
      const totalPersonas = data.reduce((a,b)=> a + 1 + (b.acompanantes||0), 0);
      countEl.textContent = `${data.length} confirmaciones · ${totalPersonas} personas`;
      listEl.innerHTML = data.map(cardHTML).join("");
    } catch (e) {
      if (e.message?.includes("no configurado")) {
        emptyEl.textContent = "Configura Supabase en config.js para ver la lista en vivo.";
        emptyEl.classList.remove("hidden");
      } else {
        console.error(e);
        emptyEl.textContent = "No se pudo cargar la lista.";
        emptyEl.classList.remove("hidden");
      }
    }
  }

  await render();

  // Realtime: inserta al inicio sin recargar
  rsvpRepository.suscribirRealtime((nuevo) => {
    const totalTxt = countEl.textContent;
    // re-render simple para actualizar contador correctamente
    render();
    // feedback visual
    listEl.insertAdjacentHTML("afterbegin", cardHTML(nuevo));
    if (emptyEl) emptyEl.classList.add("hidden");
  });
}
