# Los 50 de Hugo Perez Yallico - 19 Sept 2026 18:00
Arquitectura: Capas + Repositorio (Vanilla JS, sin build)

## Estructura
```
config.js               # Edita aquí: dirección, maps url, supabase keys
index.html              # Landing negro/dorado + formulario
supabase.sql            # SQL para crear tabla + RLS
src/
  services/supabaseClient.js
  repositories/rsvpRepository.js
  components/countdown.js, rsvpForm.js, toast.js
  utils/validators.js
```

## Pasos
1. Supabase > New Project > SQL Editor > pega supabase.sql > Run
2. Supabase > Project Settings > API > copia URL y anonKey a config.js
3. Edita config.js > evento.direccion, googleMapsUrl y googleMapsEmbed con tu dirección real
4. Test local: `npx serve C:\Proyectos` o VS Code Live Server
5. Deploy Vercel: importa repo GitHub, env no necesita (keys ya en config.js)

## Maps Fase 1 (sin API, gratis)
Solo reemplaza en config.js:
googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=-12.06513,-75.20486"
googleMapsEmbed: "https://www.google.com/maps?q=-12.06513,-75.20486&z=16&output=embed"
