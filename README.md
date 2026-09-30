# PLF Spaces

Plataforma de descubrimiento de negocios locales con tours 3D (Matterport), directorio público, panel de administración y dashboard para dueños de negocios.

## Stack

- [Next.js 16](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Supabase](https://supabase.com) (Auth, Postgres con RLS)
- Tailwind CSS v4 + shadcn/ui + lucide-react

## Puesta en marcha

### 1. Variables de entorno

Copia `.env.local` y configúrala:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
# Necesarios para crear el admin inicial (ver paso 4)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=una-contraseña-segura
SEED_ADMIN_SECRET=un-secreto-largo-y-aleatorio
```

> Las tres últimas **no** son opcionales. Sin ellas `/api/seed-admin` responde
> `503` (si falta `SEED_ADMIN_SECRET`) o `400`, y no hay otra vía en el código
> para crear el primer admin.
>
> `ADMIN_PASSWORD` debe tener al menos 8 caracteres.
>
> `SEED_ADMIN_SECRET` es obligatorio: sin él, `/api/seed-admin` responde `503` y no
> crea nada. Genera uno con `openssl rand -hex 32`.

### 2. Base de datos

Hay dos casos, y no son intercambiables.

**Base vacía:** ejecuta `lib/supabase-schema.sql` entero en el SQL editor de
Supabase. Crea las tablas (`profiles`, `businesses`, `business_members`,
`categories`, `reviews`, `followers`, `posts`, `events`, `media`, `favorites`),
las políticas RLS y un trigger que crea el perfil automáticamente al registrarse.

**Base ya existente:** `supabase-schema.sql` usa `CREATE TABLE` sin
`IF NOT EXISTS`, así que **no lo ejecutes entero**: falla en la primera tabla que
ya existe. Pega solo el bloque que necesites de `lib/migrations/`. Ese directorio
es la fuente de verdad del schema; `supabase-schema.sql` es solo el bootstrap de
una instalación vacía y ya no refleja la base real (por ejemplo, en la base viva
`categories` sí tiene RLS y el archivo no lo tiene).

Migraciones aplicadas:

| Archivo | Qué hace | Cuándo pegarlo |
| --- | --- | --- |
| `001_security-hardening.sql` | Funciones `is_super_admin()`, `protect_profile_role()`, `get_reviews_with_author()`; corrige `handle_new_user()`. Todo aditivo. | Primero, antes de desplegar código |
| `002_profiles_private.sql` | `profiles` deja de ser legible con la anon key. | **Solo** tras desplegar el código de la 001 |
| `003_rollback_profiles_policy.sql` | Revierte la 002 si algo se rompió. | En caso de fallo |

El orden importa: la 002 rompe las lecturas directas con la anon key, así que
aplicarla antes de desplegar el código deja el panel de admin en blanco.

`lib/supabase-verify.sql` tiene los checks de solo lectura para validar cada
paso.

> Las políticas de `business_members` pasan por las funciones `is_business_member()`
> e `is_business_owner()` (`SECURITY DEFINER`). Es intencionado: una política que
> consultara `business_members` desde otra política sobre la misma tabla provoca
> `infinite recursion detected in policy` en Postgres. No las reemplaces por
> subconsultas directas. Lo mismo aplica a `is_super_admin()`: si una policy sobre
> `profiles` consultara `profiles` directamente, entraría en recursión.

### 3. Instalar y correr

```bash
npm install
npm run dev
```

### 4. Configuración inicial (una vez)

Con la app corriendo:

1. **Crear super admin** — `POST /api/seed-admin`. El endpoint exige la cabecera
   `x-seed-secret` con el valor de `SEED_ADMIN_SECRET`:

   ```bash
   curl -X POST http://localhost:3000/api/seed-admin \
     -H "x-seed-secret: $SEED_ADMIN_SECRET"
   ```

   Si prefieres no exponer el endpoint, créalo directamente en el SQL editor de
   Supabase y deja `SEED_ADMIN_SECRET` sin definir (el endpoint quedará cerrado).

2. **Sembrar negocios** — inicia sesión como admin en `/auth`, entra a `/admin` y
   ejecuta `POST /api/seed-data` (por ejemplo `curl -X POST http://localhost:3000/api/seed-data`
   con la cookie de sesión). Inserta los negocios de ejemplo si la tabla está vacía.

## Scripts

```bash
npm run dev       # desarrollo
npm run build     # build de producción
npm run start     # servir el build
npm run lint      # eslint
```

## Estructura principal

- `app/` — páginas: landing (`/`), directorio (`/businesses`), ficha (`/businesses/[id]`),
  auth (`/auth`), admin (`/admin`), dashboard owner (`/dashboard`), API routes.
- `lib/` — clientes de Supabase, tipos, consultas (`data.ts`), helpers de autorización
  (`require-admin.ts`, `require-business-access.ts`), schema SQL.
- `components/` — componentes de UI, secciones de la landing, tabs del admin y del negocio.

## Roles y permisos

| Rol | Acceso | Qué puede hacer |
| --- | --- | --- |
| Visitante (sin sesión) | Público (`/`, `/businesses`, `/businesses/[id]`) | Ver directorio, fichas, mapa y tours 3D de Matterport. Sin acciones de escritura. |
| `customer` | Público + cuenta | Mismo acceso que el visitante. (Reviews, favoritos y follows están previstos como siguiente paso.) |
| `business_owner` | `/dashboard` | Editar su negocio, eventos, reviews, equipo (owner/manager). **No** gestiona Matterport. |
| `manager` | ⚠️ bloqueado en la UI | Ver "Limitaciones conocidas". La API lo acepta, el middleware no. |
| `super_admin` | `/admin` | Crear negocios y cuentas de owner (con credenciales temporales), toggles featured/founding/verified, borrar negocios y **asignar/editar la URL del tour de Matterport** de cualquier negocio. |

### Flujo del visitante

1. El visitante entra a `/` (landing) o `/businesses` (directorio) sin registrarse.
2. Abre una ficha `/businesses/[id]`: ve imágenes, descripción, reviews, eventos y,
   si el negocio tiene una URL de Matterport asignada por el admin, el botón del tour 3D.
3. Solo necesita iniciar sesión (con rol adecuado) para `/admin` o `/dashboard`.

### Otros flujos

- **Recuperación de contraseña:** en `/auth` → "Forgot password?" → se envía un link
  (redirect a `/auth/callback` con `type=recovery`) → la página `/auth/reset-password`
  permite fijar una contraseña nueva.
- **Sign out:** disponible en el header público y también dentro de `/dashboard` y `/admin`.
- **Matterport:** la URL del tour 3D se gestiona exclusivamente desde `/admin`
  (en el form de "New Business" o con el botón "Tour" de cada negocio). Los owners
  no pueden verla ni editarla en su dashboard.

## Seguridad

- Las API de admin (`/api/admin/*`) verifican que el llamante sea `super_admin`.
- Las API del dashboard (`/api/business/*`) verifican que el llamante sea
  owner/manager del negocio (vía `business_members`).
- `/api/seed-admin` es la única ruta sin sesión: exige la cabecera `x-seed-secret`
  (`SEED_ADMIN_SECRET`) y devuelve `503` si esa variable no está definida.
- Las operaciones de escritura usan la service role key por servidor; las lecturas
  públicas usan las políticas RLS de Supabase.
- `profiles` no es legible con la anon key (migración `002`): cada usuario ve su
  propia fila y los admins ven todas, a través de `is_super_admin()`. El panel de
  admin lee usuarios y reviews por `/api/admin/users` y `/api/admin/reviews`, que
  usan la service role. Si añades un listado nuevo de datos personales, hazlo por
  API, no con el cliente del navegador.
- `profiles.role` solo lo puede cambiar el servidor: el trigger
  `protect_profile_role()` aborta con `42501` cualquier cambio que no venga de
  `service_role`. El registro público asigna siempre `customer`; no tomes el rol de
  `user_metadata`, que escribe el cliente.
- Los campos que acaban en un `href` o en un `src` pasan por `lib/safe-url.ts`
  (allowlist de `http`, `https`, `mailto`, `tel`). Si añades un campo con URL, sánalo
  al escribir y revalídalo en el render.

## Limitaciones conocidas

Pendientes, anotados para que no se pierdan. Ninguno es de seguridad.

- **`manager` y `staff` no pueden abrir `/dashboard`.** `proxy.ts` exige
  `profiles.role === "business_owner"`, pero `requireBusinessAccess()` acepta
  `owner` y `manager`, y al añadir a un usuario existente no se actualiza su
  `profiles.role`. La API los autoriza; el middleware los rebota a `/`.
- **Un usuario con varios negocios solo gestiona el primero.**
  `requireBusinessAccess()` hace `.limit(1)`. No hay selector ni parámetro para
  cambiar de negocio.
- **Guardar el negocio borra la portada.** El formulario del dashboard no manda
  `coverImage` y el PUT hace `cover_image: body.coverImage || null`.
- **`DELETE /api/admin/users/[id]` deja usuarios a medias.** El `delete` de
  `profiles` falla por la FK de `businesses.owner_id` (que no tiene `ON DELETE`) y
  su error se ignora; las membresías sí se borran. Sin guardas para impedir borrar
  el último `super_admin` o a uno mismo.
- **Contraseñas temporales con `Math.random()`** (`lib/generate-password.ts`), que
  no es criptográficamente seguro. Se muestran en pantalla y se copian al
  portapapeles en claro.
- **`POST /api/admin/create-business` degrada en silencio a un `super_admin`
  existente** (le baja el rol a `business_owner` y pierde el panel de admin) y
  puede dejar el negocio huérfano si falla la creación del owner. Varios `error`
  se descartan.
- `posts` y `events` solo tienen policy de SELECT, pese a que el comentario del
  schema dice "business members can write". No hay ruta que los escriba.
- `media` y `favorites` están en el schema con RLS pero ninguna ruta las consulta.
- `lib/supabase.ts` y `lib/auth.ts` están muertos. `lib/supabase.ts` además es una
  trampa: su sesión va a `localStorage` y el `getUser()` de servidor falla callado.
- `pnpm-lock.yaml` se eliminó: no incluía las dependencias de Supabase, así que
  `pnpm install` instalaba un árbol sin `@supabase/ssr` y la app no compilaba. El
  proyecto usa npm.
- `revalidate = 60` es inefectivo en `/` y `/businesses`: ambas páginas leen
  cookies, lo que fuerza render dinámico.
- `next.config.mjs` no define cabeceras de seguridad (CSP, HSTS, `X-Frame-Options`).
- Las mutaciones del frontend no comprueban `res.ok` en varios sitios, así que un
  401/403 refresca la UI sin mostrar error.
