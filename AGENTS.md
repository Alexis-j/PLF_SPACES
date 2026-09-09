# Convenciones del proyecto

## Flujo de trabajo con ramas

- Antes de realizar cualquier cambio de código, crear una rama nueva con nombre descriptivo:
  `git checkout -b feat/descripcion-corta` (o `fix/`, `chore/` según el caso).
- Trabajar únicamente en esa rama; nunca commitear directamente en `main`.
- Subir la rama a GitHub: `git push -u origin <rama>`.

## Revisión y verificación antes de mergear

Antes de mergear a `main`, revisar los cambios y ejecutar:

1. `npx tsc --noEmit` (typecheck)
2. `npx eslint app/ components/ lib/ proxy.ts` (lint)
3. `npx next build` (build de producción)

Todos deben pasar sin errores. Si algo falla, corregirlo en la misma rama.

## Merge

- Merge directo a `main` sin Pull Request: `git checkout main && git merge <rama>`.
- Luego push: `git push origin main`.
- Dejar la rama de trabajo limpia al terminar.

## Seguridad

- Existe `.env.local` con credenciales de Supabase; está ignorado por `.gitignore` (`*.env*.local`).
- Nunca commitear secretos ni variables de entorno.