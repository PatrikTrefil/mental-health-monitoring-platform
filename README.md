[![Build web app](https://github.com/PatrikTrefil/mental-health-monitoring-platform/actions/workflows/build-web-app.yml/badge.svg)](https://github.com/PatrikTrefil/mental-health-monitoring-platform/actions/workflows/build-web-app.yml)
[![Docs deployment](https://github.com/PatrikTrefil/mental-health-monitoring-platform/actions/workflows/deployment-production-docs.yml/badge.svg)](https://github.com/PatrikTrefil/mental-health-monitoring-platform/actions/workflows/deployment-production-docs.yml)
[![CodeQL](https://github.com/PatrikTrefil/mental-health-monitoring-platform/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/PatrikTrefil/mental-health-monitoring-platform/actions/workflows/github-code-scanning/codeql)
[![Test web app](https://github.com/PatrikTrefil/mental-health-monitoring-platform/actions/workflows/test-web-app.yml/badge.svg)](https://github.com/PatrikTrefil/mental-health-monitoring-platform/actions/workflows/test-web-app.yml)

# Software pro sledování efektivity psychoterapie

Software poskytuje prostředí pro spolupráci psychoterapeutů a jejich klientů.
Psychoterapeut může klientovi zadávat úkoly, které klient vypracovává ve webové
aplikaci mimo dobu sezení. Terapeut může na základě výsledků přizpůsobovat
terapii. Primární cíl aplikace je zvýšení efektivity psychoterapie. Sekundární
cíl je sběr dat pro výzkumné účely.

## Instalace a konfigurace

Pro instalaci aplikace je potřeba mít nainstalovaný Docker a Git.

Celý projekt je zastřešen git repozitářem mental-health-monitoring-platform.
Tento repozitář používá git submoduly, jelikož zdrojový kód platformy Form.io je
v jiném repozitáři. Jedná se o repozitář
mental-health-monitoring-platform-formio , což je fork repozitáře formio, který
obsahuje oficiální zdrojový kód platformy Form.io. Pro instalaci aplikace je
potřeba naklonovat repozitář mental-health-monitoring-platform včetně submodulů,
což lze provést následujícím příkazem:

```sh
git clone --recurse-submodules \
    https://github.com/PatrikTrefil/mental-health-monitoring-platform.git
```

Klonování a inicializaci submodulů lze provést i pomocí následující sekvence
příkazů:

```sh
git clone \
https://github.com/PatrikTrefil/mental-health-monitoring-platform.git
cd mental-health-monitoring-platform
git submodule init # initialize configuration file
git submodule update # fetch submodule data
```

Před spuštěním aplikace je potřeba dodat `.env` soubor do kořenu repozitáře pro
konfiguraci prostředí. Syntax konfiguračního souboru je popsána v dokumentaci
Docker compose. Ukázkovou konfiguraci najdete v `.env.example`. Zde je seznam
proměnných prostředí, které je potřeba nastavit, a jejich význam:

-   **MONGO_INITDB_ROOT_USERNAME** obsahuje uživatelské jméno pro přihlášení do
    MongoDB jako superuživatel (root).
-   **MONGO_INITDB_ROOT_PASSWORD** obsahuje heslo pro do MongoDB jako
    superuživatel (root).
-   **FORMIO_NODE_CONFIG** obsahuje konfigurace Form.io aplikace. Hodnota by
    měla být ve formátu JSON. Výchozí hodnoty konfigurace jsou dostupné zde.
    Není potřeba nastavit všechny atributy konfiguračního objektu, ale pouze ty,
    které chceme přepsat.
-   **FORMIO_ROOT_EMAIL** obsahuje e-mail pro přihlášení do Form.io aplikace
    jako superuživatel (root).
-   **FORMIO_ROOT_PASSWORD** obsahuje heslo pro přihlášení do Form.io aplikace
    jako superuživatel (root).
-   **FORMIO_MONGO_USER** obsahuje uživatelské jméno pro přístup Form.io
    apliakace do MongoDB.
-   **FORMIO_MONGO_PASSWORD** obsahuje heslo pro přihlášení uživatele
    `FORMIO_MONGO_USER` do MongoDB.
-   **DOMAIN_NAME** obsahuje doménové jméno, na kterém bude aplikace dostupná
    (např. domena.cz, localhost).
-   **NEXTAUTH_SECRET** obsahuje klíč pro šifrování autentizačních tokenů.

Také je potřeba nainstalovat závislosti pro Form.io aplikaci:

```sh
cd src/formio && npm install
```

Nyní aplikaci můžeme spustit pomocí návodu v sekci
[Spuštění aplikace](#spuštění-aplikace). Poté je potřeba vytvořit první
uživatelský účet, jak je popsáno v sekci
[Tvorba uživatelských účtů](#tvorba-uživatelských-účtů).

## Spuštění aplikace

Předpokládáme, že aplikace byla nainstalována a konfigurována podle návodu v
sekci [Instalace a konfigurace](#instalace-a-konfigurace). Pro spuštění aplikace
v produkčním módu spusťte následující příkaz z kořenového adresáře repozitáře:

```sh
docker compose up
```

Po spuštění příkazu bude aplikace dostupná na http://localhost. Pokud se jedná o
první spuštění aplikace, inicializujte databázi dle návodu v sekci
[Inicializace databáze](#inicializace-databáze) a vytvořte prvního uživatele dle
návodu v sekci [Tvorba uživatelských účtů](#tvorba-uživatelských-účtů). Pro
spuštění aplikace ve vývojovém módu použijte následující příkaz:

```sh
docker compose --file ./docker-compose.yml \
    --file ./docker-compose.dev.yml \
    up
```

Po spuštění příkazu bude aplikace dostupná na http://localhost:8080. Pokud se
jedná o první spuštění aplikace, inicializujte databázi dle návodu v sekci
[Inicializace databáze](#inicializace-databáze). Na jednotlivé služby aplikace
se lze připojit i přímo. Mapování portů je definováno v
`docker-compose.dev.yml`.

## Inicializace databáze

Po spuštění aplikace je potřeba inicializovat databázi. Pro provedení tohoto
kroku v produkčním prostředi využijeme tento příkaz:

```sh
npx prisma migrate deploy --schema=<cesta k souboru schema.prisma>
```

Pokud inicializujeme databázi ve vývojovém prostředí, použijeme tento příkaz:

```sh
npx prisma migrate dev --schema=<cesta k souboru schema.prisma>
```

Soubor `schema.prisma` je v repozitáři dostupný v adresáři
`/src/web-app/prisma/`. Příkaz pro připojení k databázi využívá proměnné prostředí jejichž názvy jsou
definovány v `schema.prisma` souboru. Proces inicializace a migrací databáze je
vhodné automatizovat v rámci procesu nasazení aplikace. Více informací lze najít
v
[dokumentaci Prisma](https://www.prisma.io/docs/orm/prisma-client/deployment/deploy-prisma).

## Tvorba uživatelských účtů

Tato sekce popisuje kroky pro vytvoření uživatelských účtů. Účty uživatelů
libovolné role lze vytvořit pomocí webového rozhraní Form.io aplikace. Po prvním
spuštění aplikace je doporučeno vytvořit uživatele s rolí správce dotazníků. Pro
jednoduchost tvorby tohoto uživatele je připraven shell skript, jehož užití je
popsáno v sekci
[Tvorba účtu pomocí shell skriptu](#tvorba-účtu-pomocí-shell-skriptu).

### Tvorba účtu pomocí webového rozhraní

Účet lze vytvořit pomocí webového rozhraní Form.io aplikace, která je dostupná
na `/formio/` po spuštění aplikace. Po otevření rozhraní se zobrazí přihlašovací
formulář. Do formuláře vyplníme přihlašovací údaje adminisrátorského účtu, které
jsme definovali v konfiguračním souboru při instalaci aplikace. Po přihlášení je
potřeba vyplnit formulář Správce dotazníků registrace. Uživatele nevytvářejte
skrze modul Resources.

### Tvorba účtu pomocí shell skriptu

Pokud máte k dispozici příkaz `curl`, tak uživatele s rolí správce dotazníků
můžete vytvořit pomocí shell skriptu
`./src/scripts/create_form_manager_user.sh`. Skript se spustí v interaktivním
módu, pokud uživatel neposkytne všechny parametry programu. Parametry programu
lze take předat pomocí argumentů programu. Parametry programu se odvíjí od
konfigurace definované při instalaci aplikace. Dokumentaci nástroje lze získat
pomocí příkazu:

```sh
./src/scripts/create_form_manager_user.sh --help
```

## Správa aplikace

Aplikace se skládá z několika částí, které je potřeba spravovat. Zde je seznam
částí aplikace a možné způsoby správy:

-   **Reverse proxy** Status stránka je dostupná na `/nginx_status`. Když chceme
    zjistit zda-li reverse proxy běží, můžeme udělat HTTP GET požadavek na
    `/health`. Pokud je návratový kód 200, tak reverse proxy běží.
-   **Monitoring** Monitoring služeb aplikace je dostupný na `/monitoring/`.
    Oficiální dokumentace k webovému rozhraní je dostupná online v anglickém
    jazyce zde. Monitorovací aplikace poskytuje i API, které je dostupné na
    `/monitoring/api`. Oficiální dokumentace k API je dostupná online v
    anglickém jazyce zde.
-   **Form.io** Webové rozhraní a API aplikace Form.io je dostupné na `/formio/`
    po spuštění aplikace. Oficiální dokumentace k webovému rozhraní je dostupná
    online v anglickém jazyce zde. Oficiální dokumentace k API je dostupná
    online v anglickém jazyce zde.

## Struktura repozitáře

-   `/docs/` - Dokumentace k projektu (Dostupná i na
    [tomto odkazu](https://mental-health-monitoring-platform.patriktrefil.com/)).
    Více informací lze najít v [README podprojektu](./docs/README.md).
-   `/src/formio/` - Git submodul obsahující fork repozitáře formio
-   `/src/formio-mongo/` - Obsahuje Dockerfile pro MongoDB, kterou používá
    Form.io.
-   `/src/reverse-proxy/` - Obsahuje Dockerfile a konfigurační soubory pro
    reverse proxy.
-   `/src/web-app/` - Obsahuje zdrojový kód pro kontejnery Správa nedokončených
    vyplnění, Databáze nedokončených vyplnění, Správa úkolů, Databáze úkolů,
    Export dat, Webová aplikace. Více informací lze najít v
    [README podprojektu](./src/web-app/README.md).
-   `/src/scripts/` - Obsahuje skripty pro zjednodušení inicializace aplikace.
