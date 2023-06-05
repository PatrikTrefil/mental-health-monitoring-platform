Chceme volit populární nástroje, jelikož programátoři, kteří budou aplikaci v
budoucnu rozšiřovat, je pravděpodobně budou znát. Zároveň také chceme co nejméně
komplikovat workflow a deployment, abychom zbytečně nezvyšovali nároky na
programátory, kteří budou aplikaci v budoucnu rozšiřovat.

## Frontend

-   **HTML**
-   **CSS**
    -   Budeme psát malé množství CSS, takže nebudeme používat žadný CSS
        preprocessor.
-   **CSS Framework Bootstrap**
    -   Jednoduchý způsob jak pracovat s CSS. Knihovna je velmi populární, takže
        je pravděpodobně, že ji ostatní prográmátoři znají
-   **[react-boostrap](https://react-bootstrap.github.io/)**
    -   Z vlastní zkušenosti velmi zjednodušuje použití Boostrap knihovny.
-   **JavaScript**
    -   Jediná rozumná volba pro programování logiky pro frontend. Využijeme
        toho, že programátor, který bude v budoucnu aplikaci rozšiřovat, musí
        znát JavaScript pro vývoj frontendu, a proto jej použijeme i pro backend
    -   **TypeScript** (Zkomplikuje workflow a deployment, ale pomůže odhalit
        chyby v kódu.)
-   **React**
-   **Next.js**
    -   Místo volby jednotlivých balíků pro základní věci jako routing,
        middleware, sdílených layoutů jsem zvolil populární framework, který
        všechny tyto funkce poskytuje. Jedná se o full-stack framework, takže
        jej využiji i na serverovou část, která by za normálních okolností
        znamenala samostatný podprojekt. Tím, že je vše v jednom podprojektu,
        tak mohu např. sdílet autentizační mechanismus.
-   **[React i18n](https://github.com/i18next/react-i18next)**
    -   V budoucnu lze využít pro internacionalizaci
-   **[Formio React](https://github.com/formio/react/tree/master)**
-   **[NextAuth](https://next-auth.js.org/)**
    -   Ukázalo se, že Formio React není vhodný pro autentifikaci uživatele.
        První důvod je, že vyžaduje, aby si vývojář psal vlastní logiku pro
        ochranu stránek, přesměrování apod. To zbytečně vytvářelo prostor pro
        chyby. Druhý důvod je ten, že inicializace autentifikace se dělala pouze
        na klientovi, jelikož knihovna nepodporuje SSR, což mělo negativní vliv
        na výkon aplikace. Třetí důvod je špatná dokumentace knihovny. Jako
        alternativy jsem zvažoval Passport.js a NextAuth. Passport.js je více
        nízko-úrovňový a opět vyžaduje, aby si vývojář psal vlastní logiku, ale
        má pěknou dokumentaci. Nakonec jsem však zvolil NextAuth, což je podle
        [oficiální dokumentace _full-featured_ knihovna](https://nextjs.org/docs/pages/building-your-application/routing/authenticating).
        Poslední výhodou použití jiné knihovny než Formio React je to, že máme v
        kódu vrstvu abstrakce a tedy kód webové aplikace není závislý na
        konkrétním autetifikačním systému. NextAuth umožňuje vyměnit _providera_
        autetifikace bez změny klientského kódu.

## Backend

-   **JavaScript/TypeScript**
    -   Viz výše.
-   **NextJS**
    -   Viz výše.
-   **Docker**
-   **nginx**
    -   Zvažoval jsem ještě Apache HTTP Server, ale dokumentace se mi zdála
        chaotická a čitelnost konfiguračního souboru je dle mého názoru lepší u
        nginx. Nemám žádné speciální požadavky na proxy server, tak jsem se
        rozhodl pro nginx, jelikož na mě působil lépe. Nginx má největší podíl z
        počítačů na internetu
        [dle průzkumu z března 2023](https://news.netcraft.com/archives/category/web-server-survey/).
-   **[Formio](https://github.com/formio/formio)**
    -   Rozhodl jsem se pro toto řešení, jelikož je za ním komerční firma a
        existuje již dlouho. Má velké množství dokumentace a vývoj je stále
        aktivní.
    -   Byl použit pro britský vládní projet
        ([zdroj](https://www.youtube.com/watch?v=nuf46N5vU34))
        -   Zvážené alternativní řešení:
            -   [Typebot](https://github.com/baptisteArno/typebot.io) je dobrý,
                ale podporuje pouze login přes Google, Facebook, atd.
            -   [OpnForm](https://github.com/JhumanJ/OpnForm) je dobrý, ale nemá
                dokumentaci. Navíc používá zvláštní kombinaci technologií
                makefile + docker + php + vue.
            -   [Formily](https://github.com/alibaba/formily) vypadá dobře, ale
                do nedávna nebyla dostupná dokumentace v anglickém jazyce
                (hlavní důvod proč jsem nezvolil). Je za tím komerční firma.
                Bohužel nemá vlastní backend pro sběr výsledků, což by
                znamenalo, že bychom museli napsat vlastní. Přestože by vlastní
                backend byl flexibilnější, tak by se výrazně zvýšila komplexita
                projektu a ztížila by se maintainability, jelikož by vznikl
                prostor pro chyby.
-   **MongoDB** - používá Formio
-   **[Prisma](https://www.prisma.io/)** - přístup do databáze úkolů
    -   Dává typovou bezpečnost
    -   Zlepšuje vývojářskou zkušenost
    -   Vytváří abstrakci mezi konkrétním databázovým systémem a kódem aplikace
    -   Snižuje množství kódu, které musíme napsat my, takže se zmenšuje prostor
        pro chyby
        -   Také poskytuje vizuální editor databáze
            [Prisma Studio](https://www.prisma.io/studio)
-   **SQLite** - pro seznam úkolů
    -   nevyžaduje další Docker kontejner
    -   je jednoduchý na použití

## Tooling

-   **Prettier**
-   **ESLint**
-   **EditorConfig**
-   **Github Workflows**
-   **TypeDoc**
    -   Implementuje generování dokumentace z dokumentačních komentářů dle
        standardu [TSDoc](https://tsdoc.org/). Alternativou je DocFX, ale to je
        nástroj napsaný v dotnetu. Tento nástroj nemá npm balíček, což
        komplikuje integraci do našeho projektu. Jelikož TypeDoc implementuje
        stejný standard a jeho použití je v našem případě jednoduší, zvolil jsem
        jej pro tento projekt.
-   **Docusaurus**
    -   Původně jsem používal Github Wiki, ale Docusaurus má rozšířený Markdown
        syntax, podporu pro Mermaid.js diagramy a také spoustu komunitních
        pluginů. Díky pluginu pro TypeDoc můžu integrovat poloautomaticky
        generovanou API referenci do dokumentačních stránek. Zvažoval jsem
        GitBook a Confluence. Ty však cílí na komerční projekty a některé funkce
        jsou pouze v placených verzích.
-   **PlantUML**
    -   Původně jsem používal Mermaid.js, ale ukázalo se, že podpora C4 diagramů
        není tak dobrá. PlantUML má skvělou podporu tvorby C4 diagramů.
