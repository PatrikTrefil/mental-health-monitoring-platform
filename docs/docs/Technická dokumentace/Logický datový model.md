---
slug: datovy-model
---

Nyní popíšeme jak data budete ukládat na logické úrovni. Nebudeme se však
zabývat detaily ukládání dat o uživatelích a formulářích, jelikož o to se stará
software Form.io. Entity, jejich reprezentací se nechceme zabývat jsou označeny
šedou barvou. Budeme se zabývat ukládáním úkolů a částečných vyplnění formulářů.
Zvolme relační datový model pro modelování těchto dat. Třídy v UML diagramu
budou reprezentovat tabulky v databázi.

```plantuml
@startuml
skinparam dpi 300

class User as "Uživatel" #grey {}
class Employee as "Zaměstnanec" #grey {}
class FormDefinition as "Definice formuláře" #grey {}
class Submission as "Vyplnění formuláře" #grey {}

class Task as "Úkol" {
    id: String
    název: String
    popis: String?
    vytvořeno: DateTime
    aktualizováno: DateTime
    start DateTime?
}

Task "*" -- "1" User : "přiděleno"
Task "*" -- "1" FormDefinition : "definice formuláře"
Task "1" -- "0..1" Submission : "vyplnění formuláře"
Task "*" -- "1" Employee : "autor"

class Deadline {
    datum: DateTime
    můžeBýtDokončenoPoDeadline: Boolean
}

Deadline "0..1" --* "1" Task : "deadline"

enum TaskState as "Stav úkolu" {
    NEDOKONČENO
    ČÁSTEČNĚ_DOKONČENO
    DOKONČENO
}

TaskState "1" --* "*" Task : "stav"

class Draft as "Nedokončené vyplnění formuláře" {
    data
}

Draft "0..1" --* "1" Task : "koncept"
Draft "*" -- "1" User : "autor"

@enduml
```
