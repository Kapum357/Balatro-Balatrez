-- Crear políticas para el bucket de avatares
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

-- Política para permitir lectura pública
create
policy "Avatar public access"
on storage.objects for
select
    using ( bucket_id = 'avatars' );

-- Política para permitir a los usuarios subir sus propios avatares
create
policy "Users can upload avatars"
on storage.objects for insert
with check (
    bucket_id = 'avatars'
    and auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Política para permitir a los usuarios actualizar sus propios avatares
create
policy "Users can update own avatars"
on storage.objects for
update
    using (
    bucket_id = 'avatars'
    and auth.uid() = (storage.foldername(name))[1]::uuid
    );
