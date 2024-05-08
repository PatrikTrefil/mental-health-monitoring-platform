# Analýza existujících řešení

V době analýzy existujících řešení (od sprna 2022 do září 2022) nebylo nalezeno
žádné řešení pro online spolupráci terapeutů a pacientů/klientů. Pro vyhledávání
byl použit primárně vyhledávač Google. Také bylo využito vyhledávání na
platformách [GitHub](https://github.com/) a [GitLab](https://about.gitlab.com/).
Pro vyhledání byla použita klíčová slova jako _therapy_, _collaboration_,
_software_, _mental health_ apod.

Velkou část aplikace, kterou chceme vyrobit, tvoří systém pro správu formulářů.
Protože nebylo nalezeno kompletní řešení, v této kapitole se zaměříme na analýzu
existujících řešení pro tvorbu formulářů a sběr dat. V kapitole popíšeme
nalezené řešení a jejich výhody a nevýhody. Pokud se ukáže, že je některý z
řešení vhodný pro naše použití, tak jej začleníme do naší aplikace.

## Problematika správy formulářů

Hledaná řešení lze rozdělit ná několik částí. První část je rozhraní pro tvorbu
formulářů. V našem případě by to mělo být drag and drop rozhraní, které umožní
vytvářet formuláře bez nutnosti znalosti programování. Druhá část je formát pro
ukládání vytvořených formulářů. Při uložení je potřeba ukládat nejenom strukturu
formuláře, ale také styly jednotlivých prvků a logiku formuláře. Logika obsahuje
například podmíněné zobrazení otázek, přechody mezi stránkami formuláře v
případě, že se jedná o vícestrankový formulář, či validaci vstupu. Třetí část je
vykreslení uložených formulářů. Tato část na základě uložené definice formuláře
vykreslí formulář, který je následně možné vyplnit. Čtvrtá část je sběr dat z
formulářů. Sběr dat zahrnuje ukládání jednotlivých odpovědí, metadata o vyplnění
formuláře a také zpřístupnění sesbíraných dat terapeutům. Pátá část je možnost
uživatele uložit částečně vyplněný formulář a dokončit vyplnění později.
Dokončení může proběnout i na jiném zařízení. Tato schopnost systému byla
uvedena jako požadavek [R-FR-5](./analyza-pozadavku#r-fr-5). Budeme primárně
hledat řešení, které řeší všechny tyto části. Pokud se však ukáže, že existuje
sada nástrojů, které lze kombinovat a dohromady řeší všechny tyto části, tak je
také zvážíme.

Nástroje mohou mít formu služby nebo knihovny. Mezi hlavní požadavky na nástroj
pro správu formuláře patří možnost podmíněného zobrazení otázek, kvalitní
dokumentace a možnost hostovat na vlastní infrastruktuře. Důležité kritérium pro
výběr je samozřejmě i cena. Pro hledání nástrojů byly použit vyhledávač Google,
vyhledávání na platformách [GitHub](https://github.com/) a
[GitLab](https://about.gitlab.com/). Pro vyhledávání byly použity klíčová slova
jako _form builder_, _form management_, _form rendering_, _form serialization_
apod. Srovnání nástrojů je shrnuto na konci kapitoly v sekci [Závěr](#závěr).

## Google Formuláře

[Google Formuláře](https://www.google.com/forms/about/) je jeden z
nejrozšířenějších nástrojů pro tvorbu formulářů. Formuláře v tomto nástroji lze
snadno vytvářet v prohlížeči a následně sdílet pomocí odkazu s plniteli. Jeden
formulář může spravovat více uživatelů. Výsledky formulářů lze analyzovat pomocí
nástroje [Google Tabulky](https://www.google.com/intl/cs/sheets/about/) či
exportovat do souboru. Google Formuláře podporují uložení částečně vyplněných
formulářů a dokončení vyplnění později na jiném zařízení, ale pouze pro
uživatele, kteří jsou přihlášení do svého Google účtu. Není možné požadovat po
uživatelích, aby se přihlásili do svého Google účtu, jelikož sbíraná data musí
být asociovaná pouze s náhodně vygenerovanými identifikátory. Pro naše účely
tedy Google Formuláře požadavek na uložení částečně vyplněných formulářů
nepodporuje. Nevýhodou Google Formulářů je, že neumožňují přizpůsobení vzhledu
formulářů. Další nevýhodou je, že Google Formuláře sbírají data o uživatelích,
kteří formulář vyplňují. Google Formuláře nenabízejí variantu s hostováním na
vlastní infrastruktuře. Produkt je zdarma pro osobní použití, ale jinak stojí ke
dni 20. 3. 2023 \$12 na uživatele, který formuláře spravuje, měsíčně.

## Form.io

[Form.io](https://form.io/) poskytuje veškeré funkce, které jsou vyžadovány
zadavatelem. Form.io umožňuje velkou míru upravení vzhledu a fungování
formulářů. Form.io je používáno mnoha velkými společnostmi jako je
[Visa](https://www.visa.cz/) či [ICANN](https://www.icann.org/). Tento software
je v zahraničí využíván i ve státních institucích. Konkrétně se používá pro
provoz pohraničních sil Britské vlády. Form.io umožňuje uložit částečně vyplněný
formulář a dokončit vyplnění později i na jiném zařízení. Software lze hostovat
na vlastní infrastruktuře. Dle [ceníku](https://form.io/pricing) ke dni
20. 3. 2023 varianta s hostováním na vlastní infrastruktuře však stojí \$900
měsíčně.

## OpnForm

[OpnForm](https://opnform.com/) je open-source řešení správy formulářů, které je
aktivně vyvíjeno. Je to poměrně mladý projekt, který byl založen v září
roku 2022. Projekt nemá ke dni 13. 3. 2023 žádnou dokumentaci ani ceník. Tedy
nelze posoudit, zda-li splňuje požadavky zadavatele.

## Typeform

[Typeform](https://www.typeform.com/) je úspěšný nástroj pro tvorbu online
formulářů. Nástroj je velmi vyspělý a poskytuje mnoho funkcí včetně větvení
formulářů na základě předchozích odpovědí. Typeform nenabízí variantu s
hostováním na vlastní infrastruktuře. Tento software také neumožňuje sledování
chování uživatele. Typeform sbírá data o uživatelích, kteří formulář vyplňují.
Nástroj umožňuje uložit částečně vyplněný formulář a dokončit vyplnění později,
ale pouze v rámci jednoho zařízení. V případě potřeby více než 5 uživatelských
účtů záleží cena na dohodě.

## Knihovny pro práci s formuláři

Pro práci s formuláři existuje mnoho knihoven. Knihovný buď řeší uživatelské
rozhraní pro tvorbu formulářů, vykreslování formulářů nebo obě tyto části.

Může se zdát, že by bylo možné použít jednu knihovnu pro tvorbu formulářů a
jinou pro vykreslování formulářů. Problémem však je interoperabilita mezi
knihovnami. Způsob ukládání definic formulářů je totiž různý. Najít jednu
knihovnu pro tvorbu formulářů a jinou nezávislou knihovnu pro vykreslování
formulářů se tedy nepovedlo. Proto se podíváme na knihovny, které řeší oba
problémy.

První zvážená knihovna se nazývá [uniforms](https://uniforms.tools/). Tato
knihovna řeší vykreslování formulářů a podporuje několik různých formátů
definice formulářů. Knihovna navíc není závislá na konkrétním UI frameworku, což
je velká výhoda. Tato knihovna je vyvíjena firmou
[Vazco](https://www.vazco.eu/). Část knihovny, která je určena pro vykreslování
formulářů je však součástí placeného produktu. Firma Vazco byla kontaktována
ohledně možnosti možné spolupráce s žádostí o bezplatné využití software pro
vykreslování formulářů. V odpovědi jsme obdrželi povolení pro bezplatné užití
software pro vykreslování formulářů pro tento projekt. Po obdržení potvrzení
však firma přestala reagovat na veškeré emaily. Navzdory několika dalším pokusům
o kontaktování firmy dopadlo toto jednání neúspěšně. Část knihovny, která je
určena pro vykreslování definic formulářů, je možné použít pouze po individuální
dohodě s firmou. Vzhledem k neúspěsnoti v jednání s firmou Vazco toto nebylo
možné. Část knihovny pro definici formulářů využívá vlastní formát pro ukládání
definic formulářů. Tedy by nebylo možné použít tuto část knihovny společně s
jinou knihovnou pro vykreslování formulářů. Z těchto důvodů byla tato knihovna
vyřazena z výběru.

Další alternativou je knihovna [Formily](https://formilyjs.org/). Formily je
open-source projekt, který má ke dni 20. 3. 2023 přes 9 tisíc hvězdiček
[v repozitáři na platformě Github](https://github.com/alibaba/formily). Za
projektem navíc stojí velká komerční firma [Alibaba](https://www.alibaba.com/).
Projekt je aktivně vyvíjen, ale bohužel v době volby technologie nebyla dostupná
dokumentace v anglickém jazyce. Z důvodu chybějící dokumentace nebylo možné
ověřit, zda-li knihovna splňuje všechny požadavky zadavatele. Proto byla tato
knihovna vyřazena z výběru.

## Závěr

Nepodařilo se nám najít žádnou vhodnou kombinaci knihoven, která by alespoň
částečně řešila náš problém. Vlastnosti nalezených služeb jsou shrnuty v
tabulce níže. Jak je vidět z tabulky, tak jediným řešením, který splňuje všechny
požadavky zadavatele je Form.io. Toto řešení je však poměrně drahé a proto byl
zvolen kompromis. Jádro Form.io je open-source a kromě několika málo funkcí je
možné jej využít zdarma. Jádro tedy využijeme jako základ našeho řešení a
doplníme jej o chybějící funkce. Pokud bude náš software úspěšný a bude potřeba
mít k dispozici všechny funkce Form.io, tak je možné dokoupit placenou verzi.
Jak konkrétně tento software použijeme v naší aplikaci bude popsáno v
sekci [Software pro práci s formuláři](./navrh#software-pro-práci-s-formuláři).

|                                    | **Form.io** | **Google Formuláře** | **OpnForm** | **TypeForm** |
| ---------------------------------- | ----------- | -------------------- | ----------- | ------------ |
| **Podmíněné zobrazení**            |  Ano        |  Ano                 |  Ano        |  Ano         |
| **Kvalitní dokumentace**           |  Ano        |  Ano                 |  Ne         |  Ano         |
| **Self-hosting**                   |  Ano        |  Ne                  |  Ano        |  Ne          |
| **Nesbírá data o uživatelích**     |  Ano        |  Ne                  | Neznámé     |  Ne          |
| **Uložení nedokončeného vyplnění** |  Ano        |  Ne                  | Neznámé     |  Ne          |
| **Cena**                           | \$900       | \$12 na uživatele    | \$0         | Neznámé      |
