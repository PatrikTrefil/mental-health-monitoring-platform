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
NODE_CONFIG={"jwt":{"secret":"<your secret>"}, "mongoSecret":"<your secret>","mongo": "mongodb://mongo:27017/formio"}
ROOT_EMAIL=<root email>
ROOT_PASSWORD=<root password>
```

### Spuštění aplikace v produkčním módu

```sh
$ docker compose up
```

Aplikace je dostupná na `http://localhost`.

### Spuštění aplikace v vývojovém módu

```sh
$ docker compose --file ./docker-compose.yml --file ./docker-compose.dev.yml up
```

Aplikace je dostupná na `http://localhost:8080`.
