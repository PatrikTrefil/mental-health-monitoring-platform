# Webová aplikace platformy pro monitorování mentálního zdraví

Tento projekt obsahuje zdrojový kód pro kontejnery Správa nedokončených
vyplnění, Databáze nedokončených vyplnění, Správa úkolů, Databáze úkolů, Export
dat, Webová aplikace.

## Instalace

První je třeba nainstalovat závislosti projektu pomocí příkazu:

```sh
npm install
```

## Konfigurace

Následně je třeba poskytnout `.env` soubor pro konfiguraci aplikace. Ukázkovou
konfiguraci najdete v `.env.example`. Zde je seznam proměnných prostředí, které
je potřeba nastavit, a jejich význam:

-   `NEXT_PUBLIC_FORMIO_BASE_URL` - URL Form.io serveru
-   `DATABASE_URL` - URL databáze
-   `NEXT_PUBLIC_INTERNAL_NEXT_SERVER_URL` - URL vedoucí na běžící instanci
    serveru této webové aplikace. Toto URL se používá při tvorbě webhooků ve
    Form.io. Tvorba těchto webhooků probíhá na klientovi, takže je nutné tuto
    proměnnou označit jako veřejnou.
-   `FORMIO_SERVER_URL` - URL serveru Form.io. Toto URL musí být dostupné ze
    serverové části webové aplikace.

## Kompilace pro produkční prostředí

Pro spuštění kompilace použijte tento příkaz:

```sh
npm run build
```

## Spuštění v produkčním prostředí

Po vykonání kompilace pro produkční prostředí je možné aplikaci spustit pomocí
tohoto příkazu:

```sh
npm run start
```

## Spuštění vývojového prostředí na tomto stroji

Run the development server:

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the
result.

## Docker

Pro spuštění aplikace uvnitř Docker kontejneru jsou k dispozici soubory
`Dockerfile.dev`, `Dockerfile.production`.

## Generování dokumentace

Pro vygenerování dokumentace z dokumentačních komentářů v kódu použijte tento
příkaz:

```sh
npm run docs
```

Vygenerovaná dokumentace bude uložena do `/docs/`

## Inspekce obsahu databáze

Pro spuštění webového rozhraní pro zobrazení dat v běžící databázi použijte
tento příkaz:

```sh
npx prisma studio
```

Rozhraní bude dostupné na adresse http://localhost:5555/.

V případě, že aplikace běží uvnitř Docker kontejneru, je nutno tento příkaz
spustit uvnitř kontejneru.

## Spuštění testů

Pro jednorázové spuštění testů použijte tento příkaz:

```sh
npm run test
```

Pro spuštění v testů v "watch" módu (automaticky spustí testy v reakci na změny
v zdrojovém kódu) použijte příkaz:

```sh
npm run test:watch
```

Pro výpočet pokrytí kódu automatickými testy použijte tento příkaz:

```sh
npm run test:coverage
```

## Spuštění linteru

Pro spuštění linteru použijte tento příkaz:

```sh
npm run lint
```

## Formátování kódu

Pro spuštění kontroly formátování použijte tento příkaz:

```sh
npm run format:check
```

Pro spuštění opravy formátování použijte tento příkaz:

```sh
npm run format:write
```
