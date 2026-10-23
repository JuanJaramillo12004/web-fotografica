-- =============================================================================
-- Esquema inicial de web-fotografica
--
--   profiles   datos públicos de cada usuario de auth.users
--   galleries  encargos / colecciones; pueden ser públicos o privados
--   photos     imágenes de una galería (los bytes viven en Storage)
--
-- La migración es idempotente a propósito: se puede volver a ejecutar sin
-- errores. Eso permite aplicarla hoy por la Management API y, más adelante,
-- dejar que `supabase db push` la recorra cuando haya contraseña de base de
-- datos, sin romper nada.
--
-- El rol NO se guarda aquí. Vive en `auth.users.app_metadata.role`, que solo
-- puede escribir el servidor. Duplicarlo en `profiles` crearía una segunda
-- fuente de verdad que cualquier usuario podría intentar manipular.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Tipos
-- -----------------------------------------------------------------------------
do $$
begin
  create type public.gallery_status as enum ('draft', 'published', 'archived');
exception
  when duplicate_object then null;
end;
$$;

-- -----------------------------------------------------------------------------
-- Utilidades
-- -----------------------------------------------------------------------------

-- Mantiene `updated_at` en las tablas que lo tienen.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ¿El usuario que hace la petición es administrador?
--
-- Lee `app_metadata` del JWT, no de una tabla: el claim lo firma Supabase y el
-- usuario no puede modificarlo desde el navegador. `stable` permite que el
-- planificador lo evalúe una sola vez por consulta.
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
$$;

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  full_name  text check (full_name is null or char_length(full_name) <= 120),
  phone      text check (phone is null or char_length(phone) <= 40),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Datos de presentación de cada usuario. El rol vive en auth.users.app_metadata.';

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Crea el perfil automáticamente al registrarse un usuario.
-- SECURITY DEFINER: se ejecuta como `postgres`, así que puede escribir en
-- public.profiles aunque RLS no permita INSERT al usuario recién creado.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    nullif(trim(coalesce(
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'full_name',
      ''
    )), ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', '')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Mantiene el perfil al día si cambia el email o el nombre en Auth.
create or replace function public.handle_user_updated()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
     set email = new.email,
         full_name = coalesce(
           nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
           full_name
         )
   where id = new.id;

  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update of email, raw_user_meta_data on auth.users
  for each row execute function public.handle_user_updated();

-- Perfiles para los usuarios que ya existían antes de esta migración.
insert into public.profiles (id, email, full_name)
select
  u.id,
  u.email,
  coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'name'), ''),
    split_part(coalesce(u.email, ''), '@', 1)
  )
from auth.users u
on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- galleries
-- -----------------------------------------------------------------------------
create table if not exists public.galleries (
  id             uuid primary key default gen_random_uuid(),
  -- Puede ser null: el estudio puede preparar una galería antes de asignarla.
  owner_id       uuid references public.profiles (id) on delete set null,
  title          text not null check (char_length(trim(title)) between 1 and 120),
  slug           text not null unique
                   check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description    text check (description is null or char_length(description) <= 2000),
  status         public.gallery_status not null default 'draft',
  shoot_date     date,
  cover_photo_id uuid,
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

comment on table public.galleries is
  'Colección de fotos. Solo las marcadas como published son visibles sin sesión.';

create index if not exists galleries_owner_id_idx
  on public.galleries (owner_id);
create index if not exists galleries_status_published_at_idx
  on public.galleries (status, published_at desc);

drop trigger if exists galleries_set_updated_at on public.galleries;
create trigger galleries_set_updated_at
  before update on public.galleries
  for each row execute function public.set_updated_at();

-- `published_at` se rellena (o se limpia) solo, para que no pueda quedar una
-- galería publicada sin fecha ni una oculta con fecha visible.
create or replace function public.sync_gallery_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published' then
    if new.published_at is null then
      new.published_at = now();
    end if;
  else
    new.published_at = null;
  end if;

  return new;
end;
$$;

drop trigger if exists galleries_sync_published_at on public.galleries;
create trigger galleries_sync_published_at
  before insert or update of status, published_at on public.galleries
  for each row execute function public.sync_gallery_published_at();

-- -----------------------------------------------------------------------------
-- photos
-- -----------------------------------------------------------------------------
create table if not exists public.photos (
  id           uuid primary key default gen_random_uuid(),
  gallery_id   uuid not null references public.galleries (id) on delete cascade,
  -- Ruta dentro del bucket `photos`: `<gallery_id>/<archivo>`.
  storage_path text not null unique,
  alt          text check (alt is null or char_length(alt) <= 300),
  caption      text check (caption is null or char_length(caption) <= 600),
  width        integer check (width is null or width > 0),
  height       integer check (height is null or height > 0),
  position     integer not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.photos is
  'Metadatos de las imágenes. Los bytes viven en storage.objects (bucket photos).';

create index if not exists photos_gallery_id_position_idx
  on public.photos (gallery_id, position);

drop trigger if exists photos_set_updated_at on public.photos;
create trigger photos_set_updated_at
  before update on public.photos
  for each row execute function public.set_updated_at();

-- FK de la portada, añadida después de crear `photos` para no crear una
-- dependencia circular en el orden de creación de tablas.
do $$
begin
  alter table public.galleries
    add constraint galleries_cover_photo_id_fkey
    foreign key (cover_photo_id) references public.photos (id) on delete set null;
exception
  when duplicate_object then null;
end;
$$;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.profiles  enable row level security;
alter table public.galleries enable row level security;
alter table public.photos    enable row level security;

-- profiles --------------------------------------------------------------------
drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()) or public.is_admin());

drop policy if exists profiles_update_own_or_admin on public.profiles;
create policy profiles_update_own_or_admin
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()) or public.is_admin())
  with check (id = (select auth.uid()) or public.is_admin());

drop policy if exists profiles_delete_admin on public.profiles;
create policy profiles_delete_admin
  on public.profiles for delete
  to authenticated
  using (public.is_admin());

-- Sin política de INSERT: el perfil lo crea el trigger SECURITY DEFINER.
-- Tampoco hay política de SELECT para anon: los perfiles no son públicos.

-- galleries -------------------------------------------------------------------
-- Lectura: cualquiera puede ver las publicadas; el dueño ve las suyas; el
-- admin lo ve todo.
drop policy if exists galleries_select_published_own_or_admin on public.galleries;
create policy galleries_select_published_own_or_admin
  on public.galleries for select
  to anon, authenticated
  using (
    status = 'published'
    or owner_id = (select auth.uid())
    or public.is_admin()
  );

-- Escritura: solo el estudio. Un cliente no puede publicar ni editar su
-- galería; si algún día debe poder, se añade una política acotada por columnas.
drop policy if exists galleries_insert_admin on public.galleries;
create policy galleries_insert_admin
  on public.galleries for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists galleries_update_admin on public.galleries;
create policy galleries_update_admin
  on public.galleries for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists galleries_delete_admin on public.galleries;
create policy galleries_delete_admin
  on public.galleries for delete
  to authenticated
  using (public.is_admin());

-- photos ----------------------------------------------------------------------
-- La subconsulta vuelve a pasar por RLS de `galleries`, pero pide exactamente
-- lo mismo que ya permite su política, así que no hay fuga: una foto solo es
-- visible si su galería es pública, propia o el usuario es admin.
drop policy if exists photos_select_published_own_or_admin on public.photos;
create policy photos_select_published_own_or_admin
  on public.photos for select
  to anon, authenticated
  using (
    public.is_admin()
    or exists (
      select 1
      from public.galleries g
      where g.id = photos.gallery_id
        and (g.status = 'published' or g.owner_id = (select auth.uid()))
    )
  );

drop policy if exists photos_insert_admin on public.photos;
create policy photos_insert_admin
  on public.photos for insert
  to authenticated
  with check (public.is_admin());

drop policy if exists photos_update_admin on public.photos;
create policy photos_update_admin
  on public.photos for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists photos_delete_admin on public.photos;
create policy photos_delete_admin
  on public.photos for delete
  to authenticated
  using (public.is_admin());

-- -----------------------------------------------------------------------------
-- Storage
-- -----------------------------------------------------------------------------
-- Bucket privado: las URLs públicas no funcionan, lo que impide que se filtre
-- una galería en borrador por adivinar la ruta. La app pide URLs firmadas, y
-- Storage comprueba estas políticas antes de firmarlas.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'photos',
  'photos',
  false,
  20971520, -- 20 MB por archivo
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- La ruta empieza por el id de la galería: `<gallery_id>/<archivo>`. Se compara
-- como texto para no reventar si alguien sube un objeto con una carpeta que no
-- es un uuid.
drop policy if exists photos_storage_read on storage.objects;
create policy photos_storage_read
  on storage.objects for select
  to anon, authenticated
  using (
    bucket_id = 'photos'
    and (
      public.is_admin()
      or exists (
        select 1
        from public.galleries g
        where g.id::text = split_part(storage.objects.name, '/', 1)
          and (g.status = 'published' or g.owner_id = (select auth.uid()))
      )
    )
  );

drop policy if exists photos_storage_insert_admin on storage.objects;
create policy photos_storage_insert_admin
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'photos' and public.is_admin());

drop policy if exists photos_storage_update_admin on storage.objects;
create policy photos_storage_update_admin
  on storage.objects for update
  to authenticated
  using (bucket_id = 'photos' and public.is_admin())
  with check (bucket_id = 'photos' and public.is_admin());

drop policy if exists photos_storage_delete_admin on storage.objects;
create policy photos_storage_delete_admin
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'photos' and public.is_admin());
