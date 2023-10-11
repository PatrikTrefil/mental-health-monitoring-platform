[![Build web app](https://github.com/PatrikTrefil/mental-health-monitoring-platform/actions/workflows/build-web-app.yml/badge.svg)](https://github.com/PatrikTrefil/mental-health-monitoring-platform/actions/workflows/build-web-app.yml)
[![Docs deployment](https://github.com/PatrikTrefil/mental-health-monitoring-platform/actions/workflows/deployment-production-docs.yml/badge.svg)](https://github.com/PatrikTrefil/mental-health-monitoring-platform/actions/workflows/deployment-production-docs.yml)
[![CodeQL](https://github.com/PatrikTrefil/mental-health-monitoring-platform/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/PatrikTrefil/mental-health-monitoring-platform/actions/workflows/github-code-scanning/codeql)
[![Test web app](https://github.com/PatrikTrefil/mental-health-monitoring-platform/actions/workflows/test-web-app.yml/badge.svg)](https://github.com/PatrikTrefil/mental-health-monitoring-platform/actions/workflows/test-web-app.yml)

# Software pro sledování efektivity psychoterapie

Software poskytuje prostředí pro spolupráci psychoterapeutů a jejich
klientů. Psychoterapeut může klientovi zadávat úkoly, které klient
vypracovává ve webové aplikaci mimo dobu sezení. Terapeut může na základě
výsledků přizpůsobovat terapii. Primární cíl aplikace je zvýšení efektivity
psychoterapie. Sekundární cíl je sběr dat pro výzkumné účely.

## Klonování repozitáře

Repozitář používá submoduly. Pro naklonování veškerého obsahu
použijte následující příkaz:

```sh
git clone --recurse-submodules https://github.com/PatrikTrefil/mental-health-monitoring-platform.git
```

Případně také:

```sh
git clone https://github.com/PatrikTrefil/mental-health-monitoring-platform.git
git submodule init
git submodule update
```

[Dokumentace git submodulů](https://git-scm.com/book/en/v2/Git-Tools-Submodules)

## Spouštění aplikace

Před spuštěním aplikace je potřeba dodat `.env` soubor pro konfiguraci kontejneru.
Ukázkovou konfiguraci najdete v `.env.example`.

-   konfigurace mongo
    -   `MONGO_INITDB_ROOT_USERNAME` - uživatelské jméno pro přihlášení do MongoDB jako root
    -   `MONGO_INITDB_ROOT_PASSWORD` - heslo pro přihlášení uživatele `MONGO_INITDB_ROOT_USERNAME` do MongoDB jako root
-   konfigurace formio
    -   `FORMIO_NODE_CONFIG` - konfigurace formio aplikace
    -   `FORMIO_ROOT_EMAIL` - email pro přihlášení do formio aplikace jako root
    -   `FORMIO_ROOT_PASSWORD` - heslo pro přihlášení do formio aplikace jako root
    -   `FORMIO_MONGO_USER` - uživatelské jméno pro přístup Formio apliakace do MongoDB
    -   `FORMIO_MONGO_PASSWORD` - heslo pro přihlášení uživatele `FORMIO_MONGO_USER` do MongoDB
-   konfigurace webového rozhraní
    -   `DOMAIN_NAME` - doménové jméno, na kterém bude aplikace dostupná (např. `domena.cz`, `localhost`)
    -   `NEXTAUTH_SECRET` - klíč pro šifrování tokenů

Také je potřeba nainstalovat závislosti pro Formio aplikaci:

```sh
$ cd src/formio && npm install
```

### Spuštění aplikace v produkčním módu

```sh
$ docker compose up
```

Aplikace je dostupná na `http://localhost`.

Pokud se jedná o **první spuštění aplikace**, je potřeba vytvořit prvního uživatele (správce dotazníků).
Uživatele lze vytvořit pomocí shell skriptu `./init.sh` (vyžaduje `curl`). Skript lze spustit
v interaktivním módu, pokud uživatel neposkytne všechny parametry programu. Parametry
programu lze take předat pomocí argumentů programu (viz `./init.sh --help`). Alternativně
lze vytvořit uživatele pomocí webového rozhraní Formio aplikace `http://localhost/formio/`,
kde je potřeba vyplnit formulář `Správce dotazníků registrace` (uživatele _nevytvářejte_ skrze modul
Resources).

### Spuštění aplikace v vývojovém módu

```sh
$ docker compose --file ./docker-compose.yml --file ./docker-compose.dev.yml up
```

Aplikace je dostupná na `http://localhost:8080`, kde se přistupuje skrze reverse proxy.
Na všechny komponenty se lze připojit i přímo (mapování portů je definováno v `docker-compose.dev.yml`).

## Užívání softwaru

-   `/` - hlavní stránka webového rozhraní
-   `/nginx_status` - status reverse proxy
-   `/health` - vratí 200 pokud je reverse proxy dostupná
-   `/monitoring/` - monitoring aplikace
    -   `/monitoring/api` - monitoring API ([oficiální dokumentace](https://github.com/google/cadvisor/blob/master/docs/api.md))
-   `/formio/` - webové rozhraní/API pro správu formulářů ([oficiální dokumentace](https://apidocs.form.io/))
