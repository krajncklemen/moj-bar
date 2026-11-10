# MOJ BAR

Interni portal za gostince (urniki, dopusti, menjave, ekipa, izkupiček, dolžniki).  
Logika in izgled po prototipu Foch Bar Portal.

## Zagon

```bash
npm install
npm run dev
```

Odpri http://127.0.0.1:3000

**Demo:** `admin` / `foch2026` ali `monika` / `foch2026`  
Registracija lastnika: 2 koraka (račun + imena lokalov).

## Funkcije

- Prijava (ista stran za admin in zaposlene) + registracija v 2 korakih
- Več lokalov
- Urnik z drag & drop, ure začetka, tekoči/naslednji mesec, pobriši teden
- Dopusti / bolniška / prosto
- Menjave izmen (sodelavka → vodja)
- Ekipa + arhiv Pretekle
- Izkupiček / manjko
- Dolžniki
- Pregled (pokritost, urnik, prošnje, lestvica ur)

Podatki: `localStorage` prek `public/js/storage.js` (pripravljeno za kasnejši backend).
