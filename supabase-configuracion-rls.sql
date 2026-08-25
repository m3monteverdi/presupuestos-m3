-- =====================================================
-- CONFIGURACIÓN - RLS
-- Ejecutar en Supabase SQL Editor si la pantalla
-- Configuración puede leer pero no guardar.
-- Actualmente la aplicación utiliza un único usuario admin.
-- =====================================================

alter table public.configuracion enable row level security;

-- Lectura para usuarios autenticados.
drop policy if exists "configuracion_select_authenticated" on public.configuracion;
create policy "configuracion_select_authenticated"
on public.configuracion
for select
to authenticated
using (true);

-- Actualización para usuarios autenticados.
-- Con el esquema actual existe un único usuario administrador.
drop policy if exists "configuracion_update_authenticated" on public.configuracion;
create policy "configuracion_update_authenticated"
on public.configuracion
for update
to authenticated
using (true)
with check (true);

-- No se habilita INSERT ni DELETE desde la aplicación.
