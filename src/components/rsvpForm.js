// Componente RSVP Form - validación tiempo real + mensajes estilo página
import { validarCampo, validarRSVP } from "../utils/validators.js";
import { rsvpRepository } from "../repositories/rsvpRepository.js";
import { showToast } from "./toast.js";

export function initRsvpForm() {
  const form = document.getElementById("rsvp-form");
  const btn = document.getElementById("btn-enviar");
  if (!form) return;

  const errEls = {
    nombre: document.getElementById("err-nombre"),
    telefono: document.getElementById("err-telefono"),
    asistencia: document.getElementById("err-asistencia"),
    acompanantes: document.getElementById("err-acompanantes"),
    mensaje: document.getElementById("err-mensaje"),
  };
  const inputs = {
    nombre: form.querySelector('[name="nombre"]'),
    telefono: form.querySelector('[name="telefono"]'),
    mensaje: form.querySelector('[name="mensaje"]'),
    acompanantes: form.querySelector('[name="acompanantes"]'),
  };

  function setError(campo, msg) {
    const el = errEls[campo];
    const input = inputs[campo];
    if (el) el.textContent = msg || "";
    if (input) {
      if (msg) input.classList.add("input-error");
      else input.classList.remove("input-error");
    }
    if (campo === "asistencia" || campo === "acompanantes") {
      const radios = form.querySelectorAll('[name="asistencia"]');
      radios.forEach(r => {
        const box = r.nextElementSibling;
        if (box) {
          if (msg) box.classList.add("input-error");
          else box.classList.remove("input-error");
        }
      });
      if (inputs.acompanantes) {
        if (msg && campo === "acompanantes") inputs.acompanantes.classList.add("input-error");
        else if (campo === "acompanantes") inputs.acompanantes.classList.remove("input-error");
      }
    }
  }

  function clearAll() {
    Object.keys(errEls).forEach(k => setError(k, ""));
  }

  // Filtrado teléfono solo números en tiempo real
  if (inputs.telefono) {
    inputs.telefono.addEventListener("input", (e) => {
      const v = e.target.value.replace(/\D/g, '').slice(0,9);
      if (e.target.value !== v) e.target.value = v;
      const msg = validarCampo("telefono", v);
      setError("telefono", msg || "");
    });
  }

  // Validación tiempo real nombre
  if (inputs.nombre) {
    inputs.nombre.addEventListener("input", (e) => {
      const msg = validarCampo("nombre", e.target.value);
      // No mostrar error mientras escribe menos de 3 y no ha salido del campo, pero sí si contiene guion/números
      if (e.target.value.includes('-') || /\d/.test(e.target.value)) {
        setError("nombre", msg || "");
      } else if (!e.target.value.trim()) {
        setError("nombre", "");
      } else {
        // muestra solo si ya es inválido y tiene 3+ chars o al blur
        if (e.target.value.trim().length >= 3) setError("nombre", msg || "");
        else setError("nombre", "");
      }
    });
    inputs.nombre.addEventListener("blur", (e) => {
      const msg = validarCampo("nombre", e.target.value);
      setError("nombre", msg || "");
    });
  }

  if (inputs.mensaje) {
    inputs.mensaje.addEventListener("blur", (e) => {
      const msg = validarCampo("mensaje", e.target.value);
      setError("mensaje", msg || "");
    });
    inputs.mensaje.addEventListener("input", () => setError("mensaje", ""));
  }

  // Submit
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAll();
    const fd = new FormData(form);
    const payload = {
      nombre: fd.get("nombre") || "",
      telefono: fd.get("telefono") || "",
      asistencia: fd.get("asistencia") || "",
      acompanantes: fd.get("acompanantes") || "0",
      mensaje: fd.get("mensaje") || ""
    };

    // Validar cada campo y mostrar inline
    let hasError = false;
    const checks = [
      ["nombre", payload.nombre],
      ["telefono", payload.telefono],
      ["asistencia", payload.asistencia],
      ["acompanantes", payload.acompanantes],
      ["mensaje", payload.mensaje],
    ];
    for (const [campo, valor] of checks) {
      const msg = validarCampo(campo, valor);
      if (msg) {
        setError(campo, msg);
        hasError = true;
      }
    }

    if (hasError) {
      const first = Object.keys(errEls).find(k => errEls[k]?.textContent);
      showToast(errEls[first]?.textContent || "Revisa los campos marcados", "error");
      return;
    }

    // Validación global extra
    const errores = validarRSVP(payload);
    if (errores.length) {
      showToast(errores[0], "error");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Enviando...";
    try {
      await rsvpRepository.confirmar(payload);
      form.reset();
      clearAll();
      document.getElementById("success-modal")?.classList.remove("hidden");
      showToast("¡Confirmación registrada! Gracias por celebrar con Hugo");
      if (window.confetti) window.confetti();
    } catch (err) {
      console.error(err);
      showToast(err.message || "Error al registrar. Intenta de nuevo.", "error");
    } finally {
      btn.disabled = false;
      btn.textContent = "Confirmar mi asistencia";
    }
  });

  document.getElementById("close-modal")?.addEventListener("click", () => {
    document.getElementById("success-modal")?.classList.add("hidden");
  });
}
