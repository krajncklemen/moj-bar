-- Popravek: logo upload samo za lastnika lokacije (pot logos/{location_id}/...)
-- Varen za ponovni zagon, če 001 še ni bil uporabljen v produkciji.

drop policy if exists "Lastniki nalagajo logotipe" on storage.objects;
drop policy if exists "Lastniki posodabljajo logotipe" on storage.objects;
drop policy if exists "Lastniki brišejo logotipe" on storage.objects;

create policy "Lastniki nalagajo logotipe"
  on storage.objects for insert
  with check (
    bucket_id = 'logos'
    and auth.role() = 'authenticated'
    and public.is_location_owner(((storage.foldername(name))[1])::uuid)
  );

create policy "Lastniki posodabljajo logotipe"
  on storage.objects for update
  using (
    bucket_id = 'logos'
    and auth.role() = 'authenticated'
    and public.is_location_owner(((storage.foldername(name))[1])::uuid)
  )
  with check (
    bucket_id = 'logos'
    and auth.role() = 'authenticated'
    and public.is_location_owner(((storage.foldername(name))[1])::uuid)
  );

create policy "Lastniki brišejo logotipe"
  on storage.objects for delete
  using (
    bucket_id = 'logos'
    and auth.role() = 'authenticated'
    and public.is_location_owner(((storage.foldername(name))[1])::uuid)
  );
