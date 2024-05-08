# Uživatelská dokumentace

V této kapitole popíšeme užívání aplikace z pohledu zaměstnance a plnitele. Tyto
role byly definovány v požadavku [R-NR-1](./analyza-pozadavku#r-nr-1). První se
podíváme na krok přihlášení, který je společný pro obě role, a následně na
užívání aplikace. Zaměstnanci a plnitelé přistupují na odlišné části aplikace,
které jsou přístupné pouze pro jejich roli. Z tohoto důvodu je popis uživání
aplikace rozdělen do dvou sekcí dle role uživatele.

## Přihlášení

<!-- TODO: figure out image referencing -->

Proces přihlášení začíná na přihlašovací obrazovce
(Obr. [1.1](#fig:login-screenshot)), na kterou je uživatel přesměrován při
vstupu do aplikace. Před samotným přihlášením je nutno schválit používání
cookies (Detaily jsou popsány v sekci [GDPR](./vyvojova-dokumentace#gdpr)). Pro
přihlášení uživatel zadá své přihlašovací údaje a stiskne tlačítko . Následně je
automaticky přesměrován na výchozí obrazovku pro svou roli. Pokud zaměstnanec
nemá účet, musí si požádat o vytvoření účtu u jiného zaměstnance s již
existujícím účtem a dostatečným oprávněním, či u administrátora aplikace. Pokud
plnitel nemá účet, musí si požádat o vytvoření účtu u zaměstnance s již
existujícím účtem a dostatečným oprávněním, či u administrátora aplikace. Tvorba
účtu zaměstnancem je popsána v sekci [Správa účtů](#správa-účtů).

![Přihlašovací obrazovka](/screenshots/login.png)

## Užívání aplikace z pohledu zaměstnance

Tato sekce popisuje užívání aplikace z pohledu zaměstnance. Jsou zde popsány
veškeré funkce, které byly identifikovány jako požadavky na funkcionalitu
dostupnou zaměstnanci v [Analýze požadavků](./analyza-pozadavku). Předpokládáme,
že zaměstnanec má již vytvořený účet a přihlásil se do aplikace, jak je popsáno
v sekci [Přihlášení](#přihlášení), která se věnuje přihlášení a tvorbě účtu. Po
přihlášení je zaměstnanec automaticky přesměrován na výchozí obrazovku pro
zaměstnance (Obr. [1.2](#fig:sprava-formularu-screenshot)).

### Správa formulářů

Pro zadání úkolu plniteli je nutno nejprve vytvořit formulář. Formuláře se
vytváří v sekci (Obr. [1.2](#fig:sprava-formularu-screenshot)). Právo na tvorbu
formulářů mají pouze zaměstnanci s rolí . Formuláře se vytváří pomocí tlačítka .
Stisknutí tohoto tlačítka se dostaneme na stránku pro tvorbu formuláře
(Obr. [1.3](#fig:tvorba-formulare-screenshot)). Pro vytvoření je potřeba zadat
název formuláře do pole Název a přidat jednotlivé otázky taháním prvků z levého
panelu do prostoru pro tvorbu formuláře. Pole Identifikátor a Cesta se vyplní
automaticky při zadání názvu a obvykle není třeba je měnit. Jak vypočítat
odvozené hodnoty v rámci vyhodnocení formuláře je popsáno v
podsekci [1.2.1.1](#subsubsec:vypocet-odvozenych-hodnot). Detailní dokumentace k
tvorbě formulářů je dostupná online v anglickém jazyce na
[tomto odkazu](https://help.form.io/userguide/form-building). Formulář uložíme
do systému pomocí tlačítka . Obrazovka pro správu formulářů
(Obr. [1.2](#fig:sprava-formularu-screenshot)) nám nabízí několik dalších
funkcí. Již existující formuláře můžeme upravovat pomocí tlačítka nebo mazat
pomocí tlačítka . Úpravy formulářů mohou ovlivnit již existující odevzdání
formulářů a proto se doporučuje tuto funkci používat pouze pro drobné opravy.

![Správa formulářů aplikace](/screenshots/sprava-formularu.png)

![Správa formulářů aplikace](/screenshots/tvorba-formulare.png)

#### Výpočet odvozených hodnot

Pokud chceme formulář automaticky vyhodnotit na základě odpovědí plnitele,
použijeme prvek z kategorie z levého panelu. Po přidání prvku se zobrazí jeho
nastavení (Obr. [1.4](#fig:odvozena-hodnota-nastaveni)). Vzorec pro výpočet
hodnoty můžeme zadat do sekce v kartě
(Obr. [1.6](#fig:odvozena-hodnota-vzorec-a-server)). Vzorec se zapisuje v
programovacím jazyce
[JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript). Všechny
hodnoty odpovědí jsou dostupné na objektu `data`. Vzorec používá názvy
vlastností jako klíče na tomto objektu. Pro použití konkrétní můžeme použít
tečkovou notaci `data.nazevVlastnosti` nebo notaci s hranatými závorkami
`data["nazevVlastnosti"]`. Název vlastnosti lze pro každý prvek nastavit v menu
nastavení v poli v kartě (Obr. [1.5](#fig:odvozena-hodnota-nastaveni-nazev)).
Výsledek vzorce uložíme do proměnné `value`. Např. pro součet hodnoty odpovědí s
názvy a bychom použili vzorec `value = data.a + data.b`. Pokud je nevhodné, aby
uživatel viděl způsob výpočtu odvozené hodnoty nebo mohl získat vypočtenou
hodnotu, tak je nutné v nastavení prvku zvolit možnost
(Obr. [1.6](#fig:odvozena-hodnota-vzorec-a-server)). Nastavení prvku uložíme
stisknutím tlačítka . Kdybychom chtěli nastavení prvku znovu upravit, tak se na
obrazovku nastavení dostaneme stisknutím tlačítka s ozubeným kolečkem v pravém
horním rohu prvku (Obr. [1.7](#fig:odvozena-hodnota-ozubene-kolo)).

![Karta Zobrazení v nastavení prvku Skryté](/screenshots/odvozena-hodnota-nastaveni.png)

![Karta API v nastavení prvku Skryté](/screenshots/odvozena-hodnota-nastaveni-nazvu.png)

![Karta Data v nastavení prvku Skryté](/screenshots/odvozena-hodnota-vzorec-a-server.png)

![Zobrazení menu nastavení prvku](/screenshots/odvozena-hodnota-ozubene-kolo.png)

### Správa plnitelů

Pro zadání úkolu plniteli je nutno nejprve vytvořit uživatelský účet pro
plnitele. Účty plnitelů se vytváří v sekci
(Obr. [1.8](#fig:sprava-plnitelu-screenshot)). Nový účet vytvoříme pomocí
tlačítka . Pro vytvoření účtu je potřeba zadat identifikátor plnitele, který je
unikátní v rámci celé aplikace, a heslo. Plnitel si může heslo změnit po
přihlášení do aplikace.

![Správa účtů plnitelů](/screenshots/sprava-plnitelu.png)

### Správa úkolů

Nyní můžeme vytvořit úkol pro plnitele. Úkoly se vytváří v sekci
(Obr. [1.9](#fig:sprava-ukolu-screenshot)). Nový úkol vytvoříme pomocí tlačítka
. Stisknutím tohoto tlačítka se dostaneme na stránku pro tvorbu úkolu
(Obr. [1.10](#fig:tvorba-ukolu-screenshot)). Pro vytvoření je potřeba zadat
název úkolu, vybrat formulář, který má plnitel vyplnit, a vybrat plnitele. Při
tvorbě je možno zvolit více plnitelů a tím zadat více úkolů najednou. K úkolu
můžeme volitelně přidat popis, start, deadline a opakování. Start úkolu je datum
a čas, od kdy je možné úkol splnit. Deadline úkolu je datum a čas, do kdy je
možné úkol splnit. Start a deadline byly takto definovány v
[Analýze požadavků](./analyza-pozadavku). Můžeme povolit překročení deadline,
ale standardně je po deadline úkol uzavřen a nelze jej splnit. Obrazovka pro
konfiguraci deadline je zobrazena na
obrázku [1.11](#fig:tvorba-ukolu-deadline-screenshot). Při nastavení opakování
je vytvořeno více úkolu najednou pro jednoho uživatele. Pokud chceme vytvořit
opakující se úkol, tak je nutné také definovat deadline, který je vždy posunut o
interval specifikovaný v nastavení opakování. Obrazovka pro konfiguraci
opakování je zobrazena na
obrázku [1.12](#fig:tvorba-ukolu-opakovani-screenshot).

![Správa úkolů](/screenshots/sprava-ukolu.png)

![Tvorba úkolu](/screenshots/tvorba-ukolu.png)

![Zadávání deadline při tvorbě úkolu](/screenshots/tvorba-ukolu-deadline.png)

![Konfigurace opakování při tvorbě úkolu](/screenshots/tvorba-ukolu-opakovani.png)

### Náhled na odevzdání formuláře

Nyní předpokládejme, že plnitel splnil zadaný úkol. Zaměstnanec si může zobrazit
odevzdání formuláře pomocí tlačítka v sekci
(Obr. [1.9](#fig:sprava-ukolu-screenshot)). Náhled na odevzdání obsahuje
metadata vyplnění formuláře a vyplněný formulář
(Obr. [1.13](#fig:nahled-odevzdani-zamestnanec-screenshot)). Náhled na odevzdaní
zobrazuje i skryté prvky formuláře a jejich hodnoty.

![Náhled na jednotlivé odevzdání formuláře](/screenshots/nahled-odevzdani-zamestnanec.png)

Můžeme také zobrazit všechna odevzdání formuláře formou tabulky pomocí tlačítka
v sekci (Obr. [1.2](#fig:sprava-formularu-screenshot)). Tato stránka obsahuje
seznam všech odevzdání formuláře
(Obr. [1.14](#fig:nahled-vsechna-odevzdani-zamestnanec-screenshot)), které lze
řadit, filtrovat a následně i exportovat do souboru. Stránka také umožňuje
vytvořit základní vizualizace sesbíraných dat, které lze zobrazit stisknutím
tlačítka
(Obr. [1.15](#fig:nahled-vsechna-odevzdani-vizualizace-zamestnanec-screenshot)).
Pokročilejší analýzy a vizualizace dat je možno provádět specializovaným
softwarem, který je schopen zpracovat exportovaná data.

![Náhled na všechna odevzdání formuláře](/screenshots/vysledky-formulare.png)

![Vizualizace odevzdání formuláře](/screenshots/vysledky-formulare-vizualizace.png)

### Správa účtů

Zaměstnanec může tvořit účty pro další zaměstnance. Pokud má zaměstnanec roli ,
tak může tvořit účty pro další zaměstnance s rolí nebo . Pokud má zaměstnanec
roli , tak může tvořit účty pro další zaměstnance s rolí . Pohled zaměstnance s
rolí je zobrazen na obrázku [1.16](#fig:sprava-zamestnancu-screenshot).

![Správa zaměstnaneckých účtů](/screenshots/sprava-zamestnancu.png)

Zaměstnanec si může zobrazit detail svého účtu
(Obr. [1.17](#fig:zmena-hesla-zamestnanec)) kliknutím na své ID v pravém horním
rohu aplikace. V detailu účtu může zaměstnanec změnit své heslo.

![Změna hesla vlastního účtu](/screenshots/zmena-hesla-zamestnanec.png)

## Užívání aplikace z pohledu plnitele

Nyní popišme proces z pohledu plnitele. Jsou zde popsány veškeré funkce, které
byly identifikovány jako požadavky na funkcionalitu dostupnou plniteli v
[Analýze požadavků](./analyza-pozadavku).

Předpokládáme, že plnitel má již vytvořený účet a přihlásil se do aplikace, jak
je popsáno v sekci [Přihlášení](#přihlášení), která se věnuje přihlášení a
tvorbě účtu. Po přihlášení se plnitel dostane na přehled úkolů
(Obr. [1.18](#fig:prehled-ukolu-uzivatel-screenshot)). Tato stránka zobrazuje
všechny úkoly, které byly plniteli zadány. Plnitel může úkol splnit stisknutím
tlačítka , čímž se dostane na stránku obsahující formulář k vyplnění
(Obr. [1.19](#fig:vyplneni-formulare-uzivatel-screenshot)). Plnitel může v
průběhu vyplňování formuláře stisknout tlačítko , čímž se formulář uloží do
systému, ale neodešle se. Při návratu na tuto stránku je uložený stav
automaticky znovu načten.

![Přehled úkolů uživatele](/screenshots/prehled-uzivatel.png)

![Vyplnění formuláře plnitelem](/screenshots/vyplneni-formulare-uzivatel.png)

Uživatel si může zobrazit detail svého účtu
(Obr. [1.20](#fig:zmena-hesla-uzivatel)) kliknutím na své ID v pravém horním
rohu aplikace. V okně detailu účtu může zaměstnanec změnit své heslo. Pro změnu
hesla je nutno zadat nové heslo a stisknout tlačítko . Heslo musí obsahovat
alespoň jedno velké písmeno, alespoň jedno malé písmeno a alespoň jedno číslo.
Pro manuální kontrolu hesla je možno zobrazit obsah hesla stisknutím tlačítka se
symbolem oka.

![Změna hesla vlastního účtu](/screenshots/zmena-hesla-uzivatel.png)
