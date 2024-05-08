import Figure from "./Figure.mdx";

# Uživatelská dokumentace

V této kapitole popíšeme užívání aplikace z pohledu zaměstnance a plnitele. Tyto
role byly definovány v požadavku [R-NR-1](./analyza-pozadavku#r-nr-1). První se
podíváme na krok přihlášení, který je společný pro obě role, a následně na
užívání aplikace. Zaměstnanci a plnitelé přistupují na odlišné části aplikace,
které jsou přístupné pouze pro jejich roli. Z tohoto důvodu je popis uživání
aplikace rozdělen do dvou sekcí dle role uživatele.

## Přihlášení

<!-- TODO: figure out image referencing -->

Proces přihlášení začíná na přihlašovací obrazovce (Obr.
[Přihlašovací obrazovka](#fig:/screenshots/login.png)), na kterou je uživatel
přesměrován při vstupu do aplikace. Před samotným přihlášením je nutno schválit
používání cookies (Detaily jsou popsány v
sekci [GDPR](./vyvojova-dokumentace#gdpr)). Pro přihlášení uživatel zadá své
přihlašovací údaje a stiskne tlačítko . Následně je automaticky přesměrován na
výchozí obrazovku pro svou roli. Pokud zaměstnanec nemá účet, musí si požádat o
vytvoření účtu u jiného zaměstnance s již existujícím účtem a dostatečným
oprávněním, či u administrátora aplikace. Pokud plnitel nemá účet, musí si
požádat o vytvoření účtu u zaměstnance s již existujícím účtem a dostatečným
oprávněním, či u administrátora aplikace. Tvorba účtu zaměstnancem je popsána v
sekci [Správa účtů](#správa-účtů).

<Figure src="/screenshots/login.png" caption="Přihlašovací obrazovka" />

## Užívání aplikace z pohledu zaměstnance

Tato sekce popisuje užívání aplikace z pohledu zaměstnance. Jsou zde popsány
veškeré funkce, které byly identifikovány jako požadavky na funkcionalitu
dostupnou zaměstnanci v [Analýze požadavků](./analyza-pozadavku). Předpokládáme,
že zaměstnanec má již vytvořený účet a přihlásil se do aplikace, jak je popsáno
v sekci [Přihlášení](#přihlášení), která se věnuje přihlášení a tvorbě účtu. Po
přihlášení je zaměstnanec automaticky přesměrován na výchozí obrazovku pro
zaměstnance
(Obr. [Správa formulářů aplikaci](#fig:/screenshots/sprava-formularu.png)).

### Správa formulářů

<!-- TODO: chybi veci v uvozovkach -->

Pro zadání úkolu plniteli je nutno nejprve vytvořit formulář. Formuláře se
vytváří v sekci "Správa formulářů"
(Obr. [Správa formulářů aplikace](#fig:/screenshots/sprava-formularu.png)).
Právo na tvorbu formulářů mají pouze zaměstnanci s rolí . Formuláře se vytváří
pomocí tlačítka . Stisknutí tohoto tlačítka se dostaneme na stránku pro tvorbu
formuláře (Obr. [Tvorba formuláře](#fig:/screenshots/tvorba-formulare.png)). Pro
vytvoření je potřeba zadat název formuláře do pole Název a přidat jednotlivé
otázky taháním prvků z levého panelu do prostoru pro tvorbu formuláře. Pole
Identifikátor a Cesta se vyplní automaticky při zadání názvu a obvykle není
třeba je měnit. Jak vypočítat odvozené hodnoty v rámci vyhodnocení formuláře je
popsáno v podsekci [Výpočet odvozených hodnot](#výpočet-odvozených-hodnot).
Detailní dokumentace k tvorbě formulářů je dostupná online v anglickém jazyce na
[tomto odkazu](https://help.form.io/userguide/form-building). Formulář uložíme
do systému pomocí tlačítka . Obrazovka pro správu formulářů
(Obr. [Správa formulářů aplikace](#fig:/screenshots/sprava-formularu.png)) nám
nabízí několik dalších funkcí. Již existující formuláře můžeme upravovat pomocí
tlačítka nebo mazat pomocí tlačítka . Úpravy formulářů mohou ovlivnit již
existující odevzdání formulářů a proto se doporučuje tuto funkci používat pouze
pro drobné opravy.

<Figure src="/screenshots/sprava-formularu.png" caption="Správa formulářů aplikace" />

<Figure src="/screenshots/tvorba-formulare.png" caption="Tvorba formuláře" />

#### Výpočet odvozených hodnot

Pokud chceme formulář automaticky vyhodnotit na základě odpovědí plnitele,
použijeme prvek z kategorie z levého panelu. Po přidání prvku se zobrazí jeho
nastavení
(Obr. [Karta Zobrazení v nastavení prvku Skryté](#fig:/screenshots/odvozena-hodnota-nastaveni.png)).
Vzorec pro výpočet hodnoty můžeme zadat do sekce v kartě
(Obr. [Karta Data v nastavení prvku Skryté](#fig:/screenshots/odvozena-hodnota-vzorec-a-server.png)).
Vzorec se zapisuje v programovacím jazyce
[JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript). Všechny
hodnoty odpovědí jsou dostupné na objektu `data`. Vzorec používá názvy
vlastností jako klíče na tomto objektu. Pro použití konkrétní můžeme použít
tečkovou notaci `data.nazevVlastnosti` nebo notaci s hranatými závorkami
`data["nazevVlastnosti"]`. Název vlastnosti lze pro každý prvek nastavit v menu
nastavení v poli v kartě
(Obr. [Karta API v nastavení prvku Skryté](#fig:/screenshots/odvozena-hodnota-nastaveni-nazvu.png)).
Výsledek vzorce uložíme do proměnné `value`. Např. pro součet hodnoty odpovědí s
názvy a bychom použili vzorec `value = data.a + data.b`. Pokud je nevhodné, aby
uživatel viděl způsob výpočtu odvozené hodnoty nebo mohl získat vypočtenou
hodnotu, tak je nutné v nastavení prvku zvolit možnost
(Obr. [Karta Data v nastavení prvku Skryté](#fig:/screenshots/odvozena-hodnota-vzorec-a-server.png)).
Nastavení prvku uložíme stisknutím tlačítka . Kdybychom chtěli nastavení prvku
znovu upravit, tak se na obrazovku nastavení dostaneme stisknutím tlačítka s
ozubeným kolečkem v pravém horním rohu prvku
(Obr. [Zobrazení menu nastavení prvku](#fig:/screenshots/odvozena-hodnota-ozubene-kolo.png)).

<Figure src="/screenshots/odvozena-hodnota-nastaveni.png" caption="Karta Zobrazení v nastavení prvku Skryté" />

<Figure src="/screenshots/odvozena-hodnota-nastaveni-nazvu.png" caption="Karta API v nastavení prvku Skryté" />

<Figure src="/screenshots/odvozena-hodnota-vzorec-a-server.png" caption="Karta Data v nastavení prvku Skryté" />

<Figure src="/screenshots/odvozena-hodnota-ozubene-kolo.png" caption="Zobrazení menu nastavení prvku" />

### Správa plnitelů

Pro zadání úkolu plniteli je nutno nejprve vytvořit uživatelský účet pro
plnitele. Účty plnitelů se vytváří v sekci
(Obr. [Správa účtů plnitelů](#fig:/screenshots/sprava-plnitelu.png)). Nový účet
vytvoříme pomocí tlačítka . Pro vytvoření účtu je potřeba zadat identifikátor
plnitele, který je unikátní v rámci celé aplikace, a heslo. Plnitel si může
heslo změnit po přihlášení do aplikace.

<Figure src="/screenshots/sprava-plnitelu.png" caption="Správa účtů plnitelů" />

### Správa úkolů

Nyní můžeme vytvořit úkol pro plnitele. Úkoly se vytváří v sekci
(Obr. [Správa úkolů](#fig:/screenshots/sprava-ukolu.png)). Nový úkol vytvoříme
pomocí tlačítka . Stisknutím tohoto tlačítka se dostaneme na stránku pro tvorbu
úkolu (Obr. [Tvorba úkolu](#fig:/screenshots/tvorba-ukolu.png)). Pro vytvoření
je potřeba zadat název úkolu, vybrat formulář, který má plnitel vyplnit, a
vybrat plnitele. Při tvorbě je možno zvolit více plnitelů a tím zadat více úkolů
najednou. K úkolu můžeme volitelně přidat popis, start, deadline a opakování.
Start úkolu je datum a čas, od kdy je možné úkol splnit. Deadline úkolu je datum
a čas, do kdy je možné úkol splnit. Start a deadline byly takto definovány v
[Analýze požadavků](./analyza-pozadavku). Můžeme povolit překročení deadline,
ale standardně je po deadline úkol uzavřen a nelze jej splnit. Obrazovka pro
konfiguraci deadline je zobrazena na
obrázku [Zadávání deadline při tvorbě úkolu](#fig:/screenshots/tvorba-ukolu-deadline.png).
Při nastavení opakování je vytvořeno více úkolu najednou pro jednoho uživatele.
Pokud chceme vytvořit opakující se úkol, tak je nutné také definovat deadline,
který je vždy posunut o interval specifikovaný v nastavení opakování. Obrazovka
pro konfiguraci opakování je zobrazena na
obrázku [Konfigurace opakování při tvorbě úkolu](#fig:/screenshots/tvorba-ukolu-opakovani.png).

<Figure src="/screenshots/sprava-ukolu.png" caption="Správa úkolů" />

<Figure src="/screenshots/tvorba-ukolu.png" caption="Tvorba úkolu" />

<Figure src="/screenshots/tvorba-ukolu-deadline.png" caption="Zadávání deadline při tvorbě úkolu" />

<Figure src="/screenshots/tvorba-ukolu-opakovani.png" caption="Konfigurace opakování při tvorbě úkolu" />

### Náhled na odevzdání formuláře

Nyní předpokládejme, že plnitel splnil zadaný úkol. Zaměstnanec si může zobrazit
odevzdání formuláře pomocí tlačítka v sekci
(Obr. [Správa úkolů](#fig:/screenshots/sprava-ukolu.png)). Náhled na odevzdání
obsahuje metadata vyplnění formuláře a vyplněný formulář
(Obr. [Náhled na jednotlivé odevzdání formuláře](#fig:/screenshots/nahled-odevzdani-zamestnanec.png)).
Náhled na odevzdaní zobrazuje i skryté prvky formuláře a jejich hodnoty.

<Figure src="/screenshots/nahled-odevzdani-zamestnanec.png" caption="Náhled na jednotlivé odevzdání formuláře" />

Můžeme také zobrazit všechna odevzdání formuláře formou tabulky pomocí tlačítka
v sekci
(Obr. [Správa formulářů aplikace](#fig:/screenshots/sprava-formularu.png)). Tato
stránka obsahuje seznam všech odevzdání formuláře
(Obr. [Náhled na všechna odevzdání formuláře](#fig:/screenshots/vysledky-formulare.png)),
které lze řadit, filtrovat a následně i exportovat do souboru. Stránka také
umožňuje vytvořit základní vizualizace sesbíraných dat, které lze zobrazit
stisknutím tlačítka
(Obr. [Vizualizace odevzdání formuláře](#fig:/screenshots/vysledky-formulare-vizualizace.png)).
Pokročilejší analýzy a vizualizace dat je možno provádět specializovaným
softwarem, který je schopen zpracovat exportovaná data.

<Figure src="/screenshots/vysledky-formulare.png" caption="Náhled na všechna odevzdání formuláře" />

<Figure src="/screenshots/vysledky-formulare-vizualizace.png" caption="Vizualizace odevzdání formuláře" />

### Správa účtů

Zaměstnanec může tvořit účty pro další zaměstnance. Pokud má zaměstnanec roli ,
tak může tvořit účty pro další zaměstnance s rolí nebo . Pokud má zaměstnanec
roli , tak může tvořit účty pro další zaměstnance s rolí . Pohled zaměstnance s
rolí je zobrazen na
obrázku [Správa zaměstnaneckých účtů](#fig:/screenshots/sprava-zamestnancu.png).

<Figure src="/screenshots/sprava-zamestnancu.png" caption="Správa zaměstnaneckých účtů" />

Zaměstnanec si může zobrazit detail svého účtu
(Obr. [Změna hesla vlastního účtu](#fig:/screenshots/zmena-hesla-zamestnanec.png))
kliknutím na své ID v pravém horním rohu aplikace. V detailu účtu může
zaměstnanec změnit své heslo.

<Figure src="/screenshots/zmena-hesla-zamestnanec.png" caption="Změna hesla vlastního účtu" />

## Užívání aplikace z pohledu plnitele

Nyní popišme proces z pohledu plnitele. Jsou zde popsány veškeré funkce, které
byly identifikovány jako požadavky na funkcionalitu dostupnou plniteli v
[Analýze požadavků](./analyza-pozadavku).

Předpokládáme, že plnitel má již vytvořený účet a přihlásil se do aplikace, jak
je popsáno v sekci [Přihlášení](#přihlášení), která se věnuje přihlášení a
tvorbě účtu. Po přihlášení se plnitel dostane na přehled úkolů
(Obr. [Přehled úkolů uživatele](#fig:/screenshots/prehled-uzivatel.png)). Tato
stránka zobrazuje všechny úkoly, které byly plniteli zadány. Plnitel může úkol
splnit stisknutím tlačítka , čímž se dostane na stránku obsahující formulář k
vyplnění
(Obr. [Vyplnění formuláře plnitelem](#fig:/screenshots/vyplneni-formulare-uzivatel.png)).
Plnitel může v průběhu vyplňování formuláře stisknout tlačítko , čímž se
formulář uloží do systému, ale neodešle se. Při návratu na tuto stránku je
uložený stav automaticky znovu načten.

<Figure src="/screenshots/prehled-uzivatel.png" caption="Přehled úkolů uživatele" />

<Figure src="/screenshots/vyplneni-formulare-uzivatel.png" caption="Vyplnění formuláře plnitelem" />

Uživatel si může zobrazit detail svého účtu
(Obr. [Změna hesla vlastního účtu](#fig:/screenshots/zmena-hesla-uzivatel.png))
kliknutím na své ID v pravém horním rohu aplikace. V okně detailu účtu může
zaměstnanec změnit své heslo. Pro změnu hesla je nutno zadat nové heslo a
stisknout tlačítko . Heslo musí obsahovat alespoň jedno velké písmeno, alespoň
jedno malé písmeno a alespoň jedno číslo. Pro manuální kontrolu hesla je možno
zobrazit obsah hesla stisknutím tlačítka se symbolem oka.

<Figure src="/screenshots/zmena-hesla-uzivatel.png" caption="Změna hesla vlastního účtu" />
