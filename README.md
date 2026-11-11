# MOJ BAR

Interni portal za gostince (urniki, dopusti, menjave, ekipa, izkupiček, dolžniki).  
Next.js App Router + Foch portal look&feel (klientska logika v `public/js`).

## Zagon

```bash
npm install
npm run dev
```

Odpri http://127.0.0.1:3000

**Začetek:** registracija v 2 korakih **ali** gumb »Naloži vzorčne podatke« (gesla naključna, prikažejo se enkrat).

## Funkcije

- Prijava (ista stran za admin in zaposlene) + registracija v 2 korakih
- Več lokalov, urnik DnD, dopusti, menjave, ekipa, izkupiček, dolžniki, pregled
- Data layer: `localStorage` (`public/js/storage.js`)
