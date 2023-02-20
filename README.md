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
Zde je šablona pro tento soubor:

```
MONGO_INITDB_ROOT_USERNAME=<root username>
MONGO_INITDB_ROOT_PASSWORD=<root password>
FORMIO_NODE_CONFIG={"jwt":{"secret":"<your secret>"}, "mongoSecret":"<your secret>", "mongo": "mongodb://mongo:27017/formio"}
FORMIO_ROOT_EMAIL=<root email>
FORMIO_ROOT_PASSWORD=<root password>
FORMIO_MONGO_USER=<formio username>
FORMIO_MONGO_PASSWORD=<formio password>
```

- konfigurace mongo
    - `MONGO_INITDB_ROOT_USERNAME` - uživatelské jméno pro přihlášení do MongoDB jako root
    - `MONGO_INITDB_ROOT_PASSWORD` - heslo pro přihlášení uživatele `MONGO_INITDB_ROOT_USERNAME` do MongoDB jako root
- konfigurace formio
    - `FORMIO_NODE_CONFIG` - konfigurace formio aplikace
    - `FORMIO_ROOT_EMAIL` - email pro přihlášení do formio aplikace jako root
    - `FORMIO_ROOT_PASSWORD` - heslo pro přihlášení do formio aplikace jako root
    - `FORMIO_MONGO_USER` - uživatelské jméno pro přístup Formio apliakace do MongoDB
    - `FORMIO_MONGO_PASSWORD` - heslo pro přihlášení uživatele `FORMIO_MONGO_USER` do MongoDB

### Spuštění aplikace v produkčním módu

```sh
$ docker compose up
```

Aplikace je dostupná na `http://localhost`.

### Spuštění aplikace v vývojovém módu

```sh
$ docker compose --file ./docker-compose.yml --file ./docker-compose.dev.yml up
```

Aplikace je dostupná na `http://localhost:8080`, kde se přistupuje skrze reverse proxy.
Na všechny komponenty se lze připojit i přímo (mapování portů je definování v `docker-compose.dev.yml`).

## Užívání softwaru

- `/` - hlavní stránka webového rozhraní
- `/nginx_status` - status reverse proxy
- `/health` - vratí 200 pokud je reverse proxy dostupná
- `/monitoring/` - monitoring aplikace
    - `/monitoring/api` - monitoring API ([oficiální dokumentace](https://github.com/google/cadvisor/blob/master/docs/api.md))
- `/formio/` - webové rozhraní/API pro správu formulářů ([oficiální dokumentace](https://apidocs.form.io/))
