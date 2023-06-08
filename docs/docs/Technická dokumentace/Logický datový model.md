---
slug: datovy-model
---

```plantuml
@startuml
enum Role {
    KLIENT_PACIENT,
    ZAMESTNANEC
}
class Administrátor {
    ID: String
    email: String
    heslo: String
    vytvořenAdministrátorem: String
    role: Role
}
class Uživatel {
    ID: String
    heslo: String
    vytvořenoUživatelem: String
    role: Role
}

class Dotazník {
    ID: String
    název: String
    vytvořenoUživatelem: String
    data
}

class VypracováníDotazníků {
    ID: String
    vypracovánoUživatelem: String
    dotazník: String
    data
}

class ZadáníDotazníku {
    String: ID
    splnitDo: Date
    zadáno: Date
    opakování: TimeSpan
    vytořenoUživatelem: String
    zadánoProUživatele: String
    dotazník: String
}

Administrátor::vytvořenAdministrátorem "0..n" --> "1" Administrátor::ID : vytvořil

ZadáníDotazníku::zadánoProUživatele "0..n" --> "1" Uživatel::ID : zadáno pro
ZadáníDotazníku::dotazník "0..n" --> "1" Dotazník::ID : zádání
ZadáníDotazníku "1" --> "0..1" VypracováníDotazníků : vypracování
ZadáníDotazníku::vytvořenoUživatelem --> Uživatel::ID : vytvořil

VypracováníDotazníků::dotazník "0..n" --> "1" Dotazník::ID : vyplňuje dotazník
VypracováníDotazníků::vypracovánoUživatelem "0..n" --> "1" Uživatel::ID : vypracoval

Administrátor::ID "0..1" --> "0..n" Uživatel::vytvořenoUživatelem : vytvořil uživatele
Uživatel::vytvořenoUživatelem "0..1" --> "0..n" Uživatel::ID : vytvořil uživatele

Uživatel::ID "1" --> "0..n" Dotazník::vytvořenoUživatelem : vytvořil dotazník

Uživatel::role "1" --> "0..n" Role : má roli
Administrátor::role "1" --> "0..n" Role : má roli

@enduml
```

Entita _ZadáníDotazníků_ používá relační datový model. Ostatní entity používají
hierarchický datový model. Navzdory rozdílu v datových modelech, jsou všechny
entity v jednom diagramu pro přehlednost.
