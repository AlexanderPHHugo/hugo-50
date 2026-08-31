// Capa Utils - Validaciones permisivas, sin guion, con apostrofe
const RE_NOMBRE = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s']+$/;
const RE_TELF = /^\d{9}$/;
const RE_MENSAJE = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'.,!¡?¿"\n\r]+$/;

function validarNombre(nombre) {
  if (!nombre || !nombre.trim()) return "Ingresa tu nombre completo";
  const n = nombre.trim().replace(/\s+/g, ' ');
  if (n.length < 3) return "Nombre debe tener al menos 3 caracteres";
  if (n.length > 60) return "Nombre máximo 60 caracteres";
  if (n.includes('-')) return "Nombre no debe contener guiones";
  if (n.includes('--') || n.includes("''")) return "Nombre contiene caracteres repetidos";
  if (!RE_NOMBRE.test(n)) return "Nombre solo letras y espacios (sin números ni símbolos)";
  if (/^['\s]/.test(n) || /['\s]$/.test(n)) return "Nombre no debe empezar o terminar con espacio";
  return null;
}

function validarTelefono(telefono) {
  if (!telefono || telefono.trim() === "") return null; // opcional
  const t = telefono.trim();
  if (!/^\d+$/.test(t)) return "Número de teléfono solo números del 0 al 9";
  if (!RE_TELF.test(t)) return "Número de teléfono debe tener exactamente 9 números";
  return null;
}

function validarAsistencia(asistencia) {
  if (!["si","no"].includes(asistencia)) return "Elige una opción: Sí, ahí estaré o No podré";
  return null;
}

function validarAcompanantes(val) {
  const num = parseInt(val);
  if (isNaN(num) || num < 0 || num > 5) return "Acompañantes debe ser 0 a 5";
  return null;
}

function validarMensaje(mensaje) {
  if (!mensaje || mensaje.trim() === "") return null; // opcional
  const m = mensaje.trim();
  if (m.length > 200) return "Mensaje máximo 200 caracteres";
  if (m.includes('-')) return "Mensaje no debe contener guiones";
  if (/\d/.test(m)) return "Mensaje solo letras, espacios y signos básicos (sin números)";
  if (!RE_MENSAJE.test(m)) return "Mensaje solo letras, espacios y signos básicos (sin números ni símbolos extraños)";
  return null;
}

export function validarRSVP({ nombre, telefono, asistencia, acompanantes, mensaje }) {
  const errores = [];
  const e1 = validarNombre(nombre); if (e1) errores.push(e1);
  const e2 = validarTelefono(telefono); if (e2) errores.push(e2);
  const e3 = validarAsistencia(asistencia); if (e3) errores.push(e3);
  const e4 = validarAcompanantes(acompanantes); if (e4) errores.push(e4);
  const e5 = validarMensaje(mensaje); if (e5) errores.push(e5);
  return errores;
}

export function validarCampo(campo, valor) {
  switch(campo) {
    case "nombre": return validarNombre(valor);
    case "telefono": return validarTelefono(valor);
    case "asistencia": return validarAsistencia(valor);
    case "acompanantes": return validarAcompanantes(valor);
    case "mensaje": return validarMensaje(valor);
    default: return null;
  }
}
