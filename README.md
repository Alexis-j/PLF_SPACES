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
```

> `ADMIN_PASSWORD` debe tener al menos 8 caracteres. `ADMIN_EMAIL`/`ADMIN_PASSWORD`
> se usan solo por el endpoint `/api/seed-admin`.

### 2. Base de datos

Ejecuta `lib/supabase-schema.sql` en el SQL editor de Supabase. Crea las tablas
(`profiles`, `businesses`, `business_members`, `categories`, `reviews`,
`followers`, `posts`, `events`, `media`, `favorites`), las políticas RLS y un
trigger que crea el perfil automáticamente al registrarse.

### 3. Instalar y correr

```bash
npm install
npm run dev
```

### 4. Configuración inicial (una vez)

Con la app corriendo:

1. **Crear super admin** — `POST /api/seed-admin` (usa `ADMIN_EMAIL`/`ADMIN_PASSWORD`).
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

## Seguridad

- Las API de admin (`/api/admin/*`) verifican que el llamante sea `super_admin`.
- Las API del dashboard (`/api/business/*`) verifican que el llamante sea
  owner/manager del negocio (vía `business_members`).
- Las operaciones de escritura usan la service role key por servidor; las lecturas
  públicas usan las políticas RLS de Supabase.
