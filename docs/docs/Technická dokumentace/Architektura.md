## Kontext

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Context.puml

Person(pacient, "Pacient")
Person(klient, "Klient")
Person(admin, "Administrátor")
Person(spravceUkolu, "Správce úkolů")
Person(zadavatelUkolu, "Zadavatel úkolů")

System(system, "Platforma pro monitorování mentálního zdraví")

Rel_D(pacient, system, "Používá")
Rel_D(klient, system, "Používá")
Rel_D(admin, system, "Používá")
Rel_D(spravceUkolu, system, "Používá")
Rel_D(zadavatelUkolu, system, "Používá")
@enduml
```

## Kontejnery

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

Person(pacient, "Pacient")
Person(klient, "Klient")
Person(admin, "Administrátor")
Person(spravceUkolu, "Správce úkolů")
Person(zadavatelUkolu, "Zadavatel úkolů")

System_Boundary(systemBoundary, "Platforma pro monitorování mentálního zdraví") {
    Container(webApp, "Webová aplikace")
    Container(monitoringWeb, "Monitoring web")
    Container(monitoringServer, "Monitoring server")
    Container(manazerUzivatelu, "Manažer uživatelů a autentifikace")
    Container(spravaFormularu, "Správa formulářů")
    Container(spravaUkolu, "Správa úkolů")
    ContainerDb(formulareDb, "Databáze správce formulářů")
    ContainerDb(ukolyDb, "Databáze úkolů")
    ContainerDb(uzivateleDb, "Databáze uživatelů")
}

Lay_D(pacient, systemBoundary)
Lay_D(klient, systemBoundary)
Lay_D(admin, systemBoundary)
Lay_D(spravceUkolu, systemBoundary)
Lay_D(zadavatelUkolu, systemBoundary)

Rel_D(pacient, webApp, "Používá")
Rel_D(klient, webApp, "Používá")
Rel_D(admin, webApp, "Používá")
Rel_D(admin, monitoringWeb, "Používá")
Rel_D(zadavatelUkolu, webApp, "Používá")
Rel_D(spravceUkolu, webApp, "Používá")

Rel(spravaUkolu, ukolyDb, "Ukládá data")
Rel(webApp, spravaFormularu, "Používá")
Rel(webApp, spravaUkolu, "Používá")
Rel(webApp, manazerUzivatelu, "Spravuje uživatele a autorizuje akce")
Rel(spravaFormularu, formulareDb, "Ukládá data")
Rel(spravaFormularu, manazerUzivatelu, "Autorizuje akce")
BiRel(spravaFormularu, spravaUkolu, "Synchronizují stavy")
Rel(spravaUkolu, manazerUzivatelu, "Autorizuje akce")
Rel(manazerUzivatelu, uzivateleDb, "Ukládá data")

Rel(monitoringServer, spravaFormularu, "Monitoruje")
Rel(monitoringServer, formulareDb, "Monitoruje")
Rel(monitoringServer, spravaUkolu, "Monitoruje")

Rel(monitoringWeb, monitoringServer, "Čte data")

@enduml
```

## Komponenty

## Webová aplikace

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Component.puml


Person(pacient, "Pacient")
Person(klient, "Klient")
Person(admin, "Administrátor")
Person(spravceUkolu, "Správce úkolů")
Person(zadavatelUkolu, "Zadavatel úkolů")

System_Boundary(systemBoundary, "Platforma pro monitorování mentálního zdraví") {
    Container_Boundary(webAppBoundary, "Web app") {
        Component(userSection, "Uživatelská sekce")
        Component(managementSection, "Manažerská sekce")
    }
    Container(spravaFormularu, "Správa formulářů")
    Container(spravaUkolu, "Správa úkolů")
}

Lay_D(pacient, webAppBoundary)
Lay_D(klient, webAppBoundary)
Lay_D(admin, webAppBoundary)
Lay_D(spravceUkolu, webAppBoundary)
Lay_D(zadavatelUkolu, webAppBoundary)

Rel(pacient, userSection, "Používá")
Rel(klient, userSection, "Používá")
Rel(admin, managementSection, "Používá")
Rel(spravceUkolu, managementSection, "Používá")
Rel(zadavatelUkolu, managementSection, "Používá")

Rel(userSection, spravaFormularu, "Používá")
Rel(managementSection, spravaFormularu, "Používá")
Rel(userSection, spravaUkolu, "Používá")
Rel(managementSection, spravaUkolu, "Používá")

@enduml
```
