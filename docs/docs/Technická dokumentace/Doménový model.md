---
slug: domenovy-model
---

## Diagram

```plantuml
@startuml

abstract class "Osoba" as Osoba {
    ID: String
    heslo: String
}
note top of Osoba
    Dědičnost typu {incomplete, disjoint}
end note

class "Zaměstnanec" as Zaměstnanec {
}
Osoba <|-- Zaměstnanec
note top of Zaměstnanec
    Dědičnost typu {incomplete, overlapping}
end note

class "SprávceÚkolů" as SprávceÚkolů {
}
Zaměstnanec <|-- SprávceÚkolů
SprávceÚkolů "1" --> "0..n" DefiniceÚkolu : definoval

abstract class "Plnitel" as Plnitel {
}
Osoba <|-- Plnitel
note top of Plnitel
    Dědičnost typu {complete, disjoint}
end note

class "Klient" as Klient {
}
Plnitel <|-- Klient

class "Pacient" as Pacient {
}
Plnitel <|-- Pacient

abstract class "DefiniceÚkolu" as DefiniceÚkolu {
    ID: String
}

class "DefiniceFormuláře" as DefiniceFormuláře {
    data
}
DefiniceÚkolu <|-- DefiniceFormuláře

class "ZadáníÚkolu" as ZadáníÚkolu {
    ID: String
    splnitDo: Date
    zadáno: Date
    opakování: TimeSpan
}
ZadáníÚkolu "1" --> "1" DefiniceÚkolu : definováno
ZadáníÚkolu "1" --> "1" Plnitel : zadán pro
ZadáníÚkolu "1" --> "0..1" VypracováníÚkolu : vypracování

abstract class "VypracováníÚkolu" as VypracováníÚkolu {
    ID: String
    datumVypracování: Date
}

class "VypracováníFormuláře" as VypracováníFormuláře {
    data
}
VypracováníFormuláře --|> VypracováníÚkolu

class "ZadavatelÚkolů" as ZadavatelÚkolů {
}
Zaměstnanec <|-- ZadavatelÚkolů
ZadavatelÚkolů "1" --> "0..n" ZadáníÚkolu : zadal

class "AnalýzaVypracováníFormuláře" as AnalýzaVypracováníFormuláře {
    data
}
AnalýzaVypracováníFormuláře "1" --> "1" VypracováníFormuláře : analyzuje

class "NedokončenéVyplněníFormuláře" as NedokončenéVyplněníFormuláře {
    data
}
NedokončenéVyplněníFormuláře "0..n" --> "1" DefiniceFormuláře : vyplňuje
Plnitel "1" --> "0..n" NedokončenéVyplněníFormuláře : vlastní
NedokončenéVyplněníFormuláře "0..1" --> "1" ZadáníÚkolu : částečně vypracovává

@enduml
```

:::note

Dědičnost v UML vyjadřuje jiný vztah než v programování. Třída je množina a
odvozená třída je její podmnožina. Vztahy mezi odvozenými třídami, tedy
podmnožinami, mohou být 4 typů podle toho zda-li se podmnožiny překrývají a
zda-li je jejich sjednocení množina definovaná třídou, od které odvozujeme.
Tento vztah je vždy popsán v poznámce k třídě, od které odvozujeme.

:::

## Definice entit

### Osoba

Lidská bytost, která má vztah k systému.

### Zaměstnanec

Osoba, která je zaměstnána v NUDZ.

### SprávceÚkolů

Zaměstnanec, který je zodpovědný za správu úkolů v systému.

### ZadavatelÚkolů

Zaměstnanec, který zadává plnitelům úkoly v systému.

### Plnitel

Osoba, která vypracovává úkoly v systému.

### Klient

Plnitel, který je klientem NUDZ (platí za poskytovanou péči).

### Pacient

Plnitel, který je pacientem NUDZ (poskytovaná péče je hrazena pojišťovnou).

### DefiniceÚkolu

Obecný potenciálně znovupoužitelný popis činnosti plnitele.

### DefiniceFormuláře

Definice úkolu, která obsahuje formulář, který je určen k vyplnění plnitelem.

### ZadáníÚkolu

Zadání úkolu pro konkrétního plnitele na základě definice úkolu.

### VypracováníÚkolu

Vypracování úkolu plnitelem na základě zadání úkolu.

### VypracováníFormuláře

Vypracování úkolu ve tvaru vyplnění formuláře.

### AnalýzaVypracováníFormuláře

Analýza vypracování formuláře, která je určena k uložení odvozených dat.

### NedokončenéVyplněníFormuláře

Nedokončené vyplnění formuláře, které slouží k uložení částečně vyplněných
formulářů. (Umožňuje uživateli přerušit vyplňování formuláře a pokračovat
později)

## Omezení

### NedokončenéVyplněníFormuláře

-   Nedokončené vyplnění formuláře pro definici formuláře, zadání úkolu a
    uživatele může existovat pouze pokud je zadání úkolu pro uživatele a zadání
    úkolu zadává stejný formulář, který je částečně vyplněn nedokončeným
    vypněním formuláře.

    ```
    context plnitel: Plnitel inv
    plnitel->vlastni->forAll(
        nedokonceneVyplneniFormulare |
            nedokonceneVyplneniFormulare->castecneVypracovava->zadanPro = self and
            nedokonceneVyplneniFormulare->castecneVypracovava->definovano = nedokonceneVyplneniFormulare->vyplnuje
            )
    ```

### ZadáníÚkolu

-   Definice úkolu musí logicky odpovídat vypracování úkolu. Např. nemůžeme
    považovat přečtení článku jako vypracování úkolu, který je definován jako
    vypracování formuláře.
    ```
    context z: ZadáníÚkolu inv
        if vypracování.oclIsKindOf(VypracováníFormuláře) then
            definováno.oclIsKidnOf(DefiniceFormuláře)
        endif
    ```

### VypracováníÚkolu

-   ID musí být unikátní.
    ```
    context v1, v2: VypracováníÚkolu inv v1.ID = v2.ID implies v1 = v2
    ```

### DefiniceÚkolu

-   ID musí být unikátní.
    ```
    context d1, d2: DefiniceÚkolu inv d1.ID = d2.ID implies d1 = d2
    ```

### Osoba

-   ID musí být unikátní.
    ```
    context o1, o2: Osoba inv o1.ID = o2.ID implies o1 = o2
    ```
