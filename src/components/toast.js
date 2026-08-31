// Componente Toast - Notificaciones
export function showToast(msg, type="success") {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.className = `fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-sm font-medium shadow-xl transition-all z-50 ${type==="success" ? "bg-[#D4AF37] text-black" : "bg-red-600 text-white"}`;
  el.classList.remove("hidden");
  setTimeout(()=> el.classList.add("hidden"), 4000);
}
