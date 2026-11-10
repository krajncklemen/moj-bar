# MOJ BAR

Sodobna, minimalistična Next.js aplikacija za gostince: **urnik z drag & drop**, smene, zaposleni, lokacija in operativni moduli.

## Hitri zagon

```bash
npm install
npm run dev
```

Odprite [http://localhost:3000](http://localhost:3000).

**Lokalni vzorec:** na prijavi kliknite **Naloži vzorčne podatke**  
(1 lastnik + 4 zaposleni + smene + urnik za tekoči teden; brez hardcodanega gesla)

Brez `NEXT_PUBLIC_SUPABASE_*` teče **demo način** (localStorage). Z nastavljenim Supabase lahko zaženete SQL v `supabase/migrations/`.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn-style UI (teal/emerald, rounded-2xl, dark mode)
- Supabase shema + RLS (multi-tenant)
- `@dnd-kit` za URNIK
- `recharts` za promet / uspešnost

## Glavne funkcije

1. **Auth + onboarding** – registracija lastnika, ustvarjanje lokacije
2. **URNIK** – mreža dan × smena, `+` dodajanje, drag & drop, odstranitev, barve, filter, kopiranje tedna, mobilni swipe, horizont 2 meseca
3. **Lokacija** – ime, logo (upload/URL), Facebook og:image scrape, delovni čas, naslov
4. **Smene, zaposleni** – avtomatski employee dostop ob dodajanju
5. **Dejansko, dopusti/bolniške** (siv status na urniku), promet, opomniki, dolžniki, uspešnost

## Supabase

```bash
# V SQL Editorju zaženite:
# 1) supabase/migrations/001_initial_schema.sql
# 2) po želji supabase/seed.sql
```

Nastavite `.env.local` po `.env.example`.

## Vloge

- **owner** – poln dostop
- **employee** – urnik (ogled), dopusti, opomniki
