// Componente Countdown - Lógica aislada
import { CONFIG } from "../../config.js";

export function initCountdown() {
  const target = new Date(CONFIG.evento.fecha).getTime();
  const els = {
    dias: document.getElementById("cd-dias"),
    horas: document.getElementById("cd-horas"),
    mins: document.getElementById("cd-mins"),
    segs: document.getElementById("cd-segs"),
  };
  if (!els.dias) return;

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      els.dias.textContent = "00";
      els.horas.textContent = "00";
      els.mins.textContent = "00";
      els.segs.textContent = "00";
      return;
    }
    const d = Math.floor(diff / (1000*60*60*24));
    const h = Math.floor((diff % (1000*60*60*24))/(1000*60*60));
    const m = Math.floor((diff % (1000*60*60))/(1000*60));
    const s = Math.floor((diff % (1000*60))/1000);
    els.dias.textContent = String(d).padStart(2,"0");
    els.horas.textContent = String(h).padStart(2,"0");
    els.mins.textContent = String(m).padStart(2,"0");
    els.segs.textContent = String(s).padStart(2,"0");
  }
  tick();
  setInterval(tick, 1000);
}
