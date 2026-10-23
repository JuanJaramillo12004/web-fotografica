# web-fotografica

Web del estudio fotográfico: galerías privadas por cliente y galerías públicas.

- **React 19** + **TypeScript** + **Vite 8**
- **Tailwind CSS v4** + **shadcn/ui** (preset Nova)
- **React Router 8** con guards por rol
- **GSAP** para animaciones
- **Supabase** (Auth + Postgres + Storage)

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # y rellena los valores
npm run dev
```

Variables necesarias:

| Variable                | Dónde se obtiene                                   |
| ----------------------- | -------------------------------------------------- |
| `VITE_SUPABASE_URL`     | Dashboard → Project Settings → API, o `supabase projects list` |
| `VITE_SUPABASE_ANON_KEY`| Dashboard → Project Settings → API                 |

> **Windows / PowerShell:** escribe `.env.local` en UTF-8 **sin BOM**. PowerShell 5.1
> añade BOM con `-Encoding utf8` y Vite entonces ignora el fichero entero sin
> avisar. Usa `[System.IO.File]::WriteAllText($ruta, $texto, (New-Object System.Text.UTF8Encoding($false)))`.

La `anon key` es pública por diseño: lo que protege los datos son las políticas
RLS de Postgres. La `service_role` key **nunca** debe llegar al navegador.

## Base de datos

El esquema vive en `supabase/migrations/`:

| Tabla       | Contenido                                                        |
| ----------- | ---------------------------------------------------------------- |
| `profiles`  | Datos de presentación de cada usuario de `auth.users`            |
| `galleries` | Galerías. `status`: `draft`, `published` o `archived`            |
| `photos`    | Metadatos de las imágenes. Los bytes viven en Storage            |

Reglas de acceso (RLS):

- **Anónimo**: solo lectura de galerías publicadas y de sus fotos.
- **Cliente**: además, sus propias galerías (aunque estén en borrador).
- **Admin**: lectura y escritura de todo. La escritura está reservada al admin.

El rol se lee de `auth.users.app_metadata.role`, no de `user_metadata`: solo el
servidor puede escribir `app_metadata`, así que un usuario no puede ascenderse a
admin desde el navegador.

### Aplicar migraciones

Con la CLI vinculada y la contraseña de la base de datos:

```bash
supabase link --project-ref <ref>
supabase db push
```

Sin contraseña (solo si tienes un token de Management API) se puede ejecutar el
SQL directamente:

```bash
supabase db query --linked -f supabase/migrations/<archivo>.sql
```

Las migraciones son idempotentes (`if not exists`, `drop policy if exists`), así
que volver a aplicarlas no rompe nada.

### Regenerar tipos

Tras cualquier cambio de esquema:

```bash
npm run db:types
```

Escribe `src/types/database.ts` a partir del esquema real. El cliente de
`src/lib/supabase.ts` está tipado con `Database`, así que tablas, columnas y
enums se comprueban en tiempo de compilación.

## Storage

Bucket `photos`, **privado**. Convención de ruta: `<gallery_id>/<archivo>`.

Al ser privado, las URLs públicas no funcionan: la app debe pedir URLs firmadas
(`createSignedUrl`), y Storage comprueba las políticas antes de firmarlas. Así
una galería en borrador no se filtra aunque alguien adivine la ruta.

## Componentes comunes

Los patrones que se repiten viven en `src/components/common` para no
reimplementarlos en cada página:

| Componente      | Uso                                                        |
| --------------- | ---------------------------------------------------------- |
| `PageHeader`    | Título, resumen y acción principal de una página del panel |
| `ErrorAlert`    | Errores de carga, formulario y subida (`role="alert"`)     |
| `EmptyState`    | Listas vacías y galerías sin fotos                         |
| `StatusBadge`   | Estado de galería con la misma etiqueta y color            |
| `AuthCard`      | Marco de login y establecimiento de contraseña             |
| `BackLink`      | Vuelta a la lista desde una página de detalle              |
| `MessagePage`   | Pantallas completas de 403 y 404                           |

Los avisos pasan por `src/lib/toast.ts`. Sonner sigue siendo el motor y cada
llamada acepta sus opciones (`description`, `duration`, `action`, …), que tienen
prioridad sobre la duración por defecto. El `<Toaster />` de
`src/components/ui/sonner.tsx` también admite props para cambiar tema, posición,
iconos o estilos.

## Scripts

| Script            | Qué hace                                  |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Servidor de desarrollo                    |
| `npm run build`   | Typecheck + build de producción           |
| `npm run lint`    | ESLint                                    |
| `npm run preview` | Sirve el build                            |
| `npm run db:types`| Regenera los tipos desde Supabase         |

## Estructura

```
src/
  components/    auth, brand, common, layout, ui (shadcn)
  hooks/         useAuth
  lib/           supabase, auth, galleries, gsap, toast
  pages/         públicas y /admin
  types/         auth.ts + database.ts (generado)
supabase/
  migrations/    SQL versionado
```
