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
    Container(spravaNedokoncenychVyplneni, "Správa nedokončených vyplnění")
    Container(spravaUkolu, "Správa úkolů")
    ContainerDb(spravaNedokoncenychVyplneniDb, "Databáze nedokončených vyplnění")
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

Rel(webApp, spravaNedokoncenychVyplneni, "Používá")
Rel(spravaFormularu, spravaNedokoncenychVyplneni, "Informuje o vyplnění")
Rel(spravaNedokoncenychVyplneni, manazerUzivatelu, "Autorizuje akce", "gateway")
Rel(spravaUkolu, ukolyDb, "Ukládá data", "gateway")
Rel(spravaNedokoncenychVyplneni, spravaNedokoncenychVyplneniDb, "Ukládá data", "gateway")
Rel(webApp, spravaFormularu, "Používá", "gateway")
Rel(webApp, spravaUkolu, "Používá")
Rel(webApp, manazerUzivatelu, "Spravuje uživatele a autorizuje akce")
Rel(spravaFormularu, formulareDb, "Ukládá data", "gateway")
Rel(spravaFormularu, manazerUzivatelu, "Autorizuje akce", "gateway")
BiRel(spravaFormularu, spravaUkolu, "Synchronizují stavy", "gateway")
Rel(spravaUkolu, manazerUzivatelu, "Autorizuje akce", "gateway")
Rel(manazerUzivatelu, uzivateleDb, "Ukládá data", "gateway")

Rel(monitoringServer, spravaFormularu, "Monitoruje")
Rel(monitoringServer, formulareDb, "Monitoruje")
Rel(monitoringServer, spravaUkolu, "Monitoruje")

Rel(monitoringWeb, monitoringServer, "Čte data")

@enduml
```

:::note

Pokud je vztah mezi dvěma kontejnery vyznačený jako gateway, znamená to, že
komunikace probíhá skrze prostředníka, který poskytuje vrstvu abstrakce, čímž
snižuje provázanost komunikujících systémů (coupling) a zajišťuje
modifikovatelnost. Bližší informace o tomto vzoru lze nalézt v [článku Gateway
od Martin Fowler][gateway_fowler].

:::

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
        Component(managementSection, "Zaměstnanecká sekce")
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

[gateway_fowler]: https://martinfowler.com/articles/gateway-pattern.html
