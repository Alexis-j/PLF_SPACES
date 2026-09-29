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
# Opcionales: para crear el admin inicial
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=una-contraseña-segura
# Obligatorio para que /api/seed-admin funcione (ver paso 4)
SEED_ADMIN_SECRET=un-secreto-largo-y-aleatorio
```

> `ADMIN_PASSWORD` debe tener al menos 8 caracteres. `ADMIN_EMAIL`/`ADMIN_PASSWORD`
> se usan solo por el endpoint `/api/seed-admin`.
>
> `SEED_ADMIN_SECRET` es obligatorio: sin él, `/api/seed-admin` responde `503` y no
> crea nada. Genera uno con `openssl rand -hex 32`.

### 2. Base de datos

Ejecuta `lib/supabase-schema.sql` en el SQL editor de Supabase. Crea las tablas
(`profiles`, `businesses`, `business_members`, `categories`, `reviews`,
`followers`, `posts`, `events`, `media`, `favorites`), las políticas RLS y un
trigger que crea el perfil automáticamente al registrarse.

> Las políticas de `business_members` pasan por las funciones `is_business_member()`
> e `is_business_owner()` (`SECURITY DEFINER`). Es intencionado: una política que
> consultara `business_members` desde otra política sobre la misma tabla provoca
> `infinite recursion detected in policy` en Postgres. No las reemplaces por
> subconsultas directas.

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
| `manager` | `/dashboard` | Mismo acceso que el owner (miembro del negocio). |
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
