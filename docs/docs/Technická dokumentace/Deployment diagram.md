---
slug: deployment-diagram
---

```plantuml
@startuml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Deployment.puml
!include https://raw.githubusercontent.com/plantuml-stdlib/C4-PlantUML/master/C4_Container.puml

Deployment_Node(comp, "Počítač uživatele"){
    Deployment_Node(browser, "Webový prohlížeč", "Google Chrome, Mozilla Firefox, Apple Safari nebo Microsoft Edge") {
        Container(webApp, "Webová aplikace", "Next.js, TypeScript")
    }
}

Deployment_Node(server, "Server", "Ubuntu, CPU: 2 jádra, RAM: 4 GB") {
    Deployment_Node(apiGateway, "API gateway", "nginx") {
        Deployment_Node(monitoring_docker, "Docker container", "Docker Engine") {
            Deployment_Node(monitoring_cadvisor, "cAdvisor") {
                Container(monitoringServer, "Monitoring server", "Go")
                Container(monitoringWeb, "Monitoring web")
            }
       }

        Deployment_Node(mongo_docker, "Docker container", "Docker Engine") {
            Deployment_Node(mongo, "MongoDB") {
                ContainerDb(formulareDb, "Databáze správce formulářů")
                ContainerDb(uzivateleDb, "Databáze uživatelů")
            }
        }
        Deployment_Node(nexjs_docker, "Docker container", "Docker Engine") {
            Deployment_Node(nextjs, "Next.js") {
                Container(spravaUkolu, "Správa úkolů", "TypeScript")
                Container(spravaNedokoncenychVyplneni, "Správa nedokončených vyplnění", "TypeScript")
                Container(export, "Export dat", "TypeScript")
            }
        }
        Deployment_Node(postgres_docker, "Docker container", "Docker Engine") {
            Deployment_Node(postgres_node, "PostgreSQL") {
                ContainerDb(ukolyDb, "Databáze úkolů")
                ContainerDb(spravaNedokoncenychVyplneniDb, "Databáze nedokončených vyplnění")
            }
        }
        Deployment_Node(formio_docker, "Docker container", "Docker Engine") {
            Deployment_Node(formio, "Form.io") {
                Container(manazerUzivatelu, "Manažer uživatelů a autentifikace", "JavaScript")
                Container(spravaFormularu, "Správa formulářů", "JavaScript")
            }
        }
    }
}
Lay_D(spravaNedokoncenychVyplneni, export)

Rel(webApp, export, "Používá")
Rel(export, spravaFormularu, "Získává data")
Rel(export, spravaUkolu, "Získává data")
Rel(spravaUkolu, ukolyDb, "Ukládá data", "PrismaORM")
Rel(webApp, spravaFormularu, "Používá", "HTTPS")
Rel(webApp, spravaUkolu, "Používá", "tRPC, HTTPS")
Rel(webApp, manazerUzivatelu, "Spravuje uživatele a autorizuje akce", "HTTPS")
Rel(spravaFormularu, formulareDb, "Ukládá data", "Mongoose, MongoDB Wire Protocol")
Rel(spravaFormularu, manazerUzivatelu, "Autorizuje akce")
Rel(spravaUkolu, manazerUzivatelu, "Autorizuje akce", "HTTPS")
BiRel(spravaFormularu, spravaUkolu, "Synchronizují stavy", "HTTPS")
Rel(webApp, spravaNedokoncenychVyplneni, "Používá")
Rel(spravaFormularu, spravaNedokoncenychVyplneni, "Informuje o vyplnění", "HTTPS")
Rel(spravaNedokoncenychVyplneni, manazerUzivatelu, "Autorizuje akce", "HTTPS")
Rel(spravaNedokoncenychVyplneni, spravaNedokoncenychVyplneniDb, "Ukládá data", "PrismaORM")
Rel(manazerUzivatelu, uzivateleDb, "Ukládá data")
Rel(monitoringWeb, monitoringServer, "Čte data")

Rel(monitoringServer, spravaFormularu, "Monitoruje")
Rel(monitoringServer, formulareDb, "Monitoruje")
Rel(monitoringServer, spravaUkolu, "Monitoruje")
@enduml
```
