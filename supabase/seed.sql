-- Demo seed (zaženite po migraciji, z znanimi UUID-ji za lokalni razvoj)
-- V produkciji seed ustvari lastnika prek Auth + onboarding UI.

-- Opomba: za pravi Supabase ustvarite uporabnika prek Auth API,
-- nato zaženite spodnje INSERT-e z njegovim UUID.

-- Primer (zamenjajte :owner_id):
-- insert into public.locations (id, owner_id, name, address, working_hours)
-- values (
--   '11111111-1111-1111-1111-111111111111',
--   :owner_id,
--   'Demo Bar Ljubljana',
--   'Trubarjeva 1, Ljubljana',
--   '{"pon":"08:00-24:00","tor":"08:00-24:00","sre":"08:00-24:00","čet":"08:00-24:00","pet":"08:00-02:00","sob":"10:00-02:00","ned":"10:00-22:00"}'::jsonb
-- );

-- Aplikacija v demo načinu (brez Supabase env) sama naloži seed:
-- 1 lastnik + 4 zaposleni + 3 smene + urnik za tekoči teden.
