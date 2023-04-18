## Skupiny uživatelů

- Uživatel = pacient/klient
- Zaměstnanci NUDZ
  - Správce dotazníků = terapeut/výzkumník
  - Zadavatel dotazníků = terapeut/výzkumník
- Technická podpora

## Funkční požadavky

- Zadavatel/správce dotazníků může zadávat dotazníky a úkoly konkrétnímu uživateli, nastavit frekvenci opakování a nastavit start/deadline.
  - Start je čas, kdy lze dotazník nejdříve vyplnit.
  - Deadline je čas, kdy lze dotazník nejpozději vyplnit.
  - Dotazník se skládá z otázek, které mohou příjmat odpovědi těchto typů:
    - text
    - více možností (možno zvolit právě jeden)
    - více možností (možno zvolit libovolný počet)
  - u každé otázky je možno nastavit podmíněné zobrazení, tj. otázka se uživateli zobrazí pokud je splněna podmínka definovaná správcem dotazníku při vytvoření.
  - [[Ukázkový dotazník]], který by mělo být možné vytvořit v aplikaci.
- Správce dotazníků je schopen vytvářet, mazat dotazníky a způsoby vyhodnocení (_v dotazníku lze upravit pouze již existující otázky a lze v nich upravit obsah otázky a obsah již existujících odpovědí; **nelze** přidat/odebrat otázky, přidat/odebrat možné odpovědo, ani upravit způsob výpočtu skóre - slouží pouze pro opravy/objasnění otázek_).
  - Při tvorbě dotazníku je možno nastavit automaticky počítané metriky pomocí vzorce (např. `otazka1 + otazka2 - otazka 4`, kde `otazka1`, `otazka2` a `otazka4` jsou proměnné reprezentující výsledky příslušných otázek).
- Uživatel může v aplikaci vypracovat dotazníky a úkoly, které mu byly přiděleny správcem/zadavatelem dotazníků.
  - Uživatel je schopen vyplnit část dotazníku, uložit si dosud zodpovězené otázky a v budoucnu vyplňování dotazníku dokončit.
- Uživatel může smazat svá data.
- Správce/zadavatel dotazníků je schopen vidět výsledky dotazníků a úkolů všech uživatelů. Správce/zadavatel může vybrat data, která budou vizualizována na grafech.
- Správce dotazníků/člen techické podpory je schopen vytvářet/mazat uživatelské účty, účty pro ostatní správce a účty pro zadavatele dotazníků.
- Správce dotazníků/člen techincké podpory je schopen měnit přístupová práva všech ostatních účtů.
- Uživatel je schopen měnit heslo svého účtu a je schopen svůj účet smazat.
- Výsledky dotazníků uživatelů může správce/zadavatel dotazníků z aplikace exportovat do formátu CSV.
- Aplikace bude pouze v Českém jazyce, ale bude připravena na internacionalizaci.
- Uživatel v systému vystupuje pod ID, které je náhodně vygenerováno.

### Viditelnost vyhodnocení dotazníků

- Uživatel je schopen vidět vyhodnocení svých dotazníků, u kterých to správce/zadavatel dovolil.
- Správce/zadavatel dotazníků může dovolit uživateli vidět výsledky konkrétního dotazníku - číselná hodnota/graf/text.
- Rozhodnutí o viditelnosti výsledků pro uživatele dělá správce/zadavatel dotazníku při zadávání dotazníku.
- Viditelnost výsledků lze nastavit následujcími způsoby:

  - uživatel vidí výsledky
  - uživatel nevidí výsledky
  - uživatel vidí výsledky pouze výsledek dotazníku splňuje podmínku (např. výsledné skóre je větší než 10)

### Volitelné

- Sledování jak dlouho trvalo odpovědět na konkrétní otázku, kdy uživatel dotazník vyplnil, počet změn odpovědí
- E-mail upozornění na nové úkoly, na nesplněné úkoly.
- Push notifikace v prohlížeči na nové úkoly, na nesplněné úkoly.
- Chat mezi terapeutem a uživatelem.
- Rozšíření již vystavěné infrastruktury pro zadávání dotazníků pro zadávání cvičení (např. přečíst článek, zhlédnout video nebo vypracovat interaktivní cvičení).

## Nefunkční požadavky

- Uživatelské rozhraní by mělo být vhodné pro uživatelé s malými technickými znalostmi.
- K programu by měla být dodána uživatelská a technická dokumentace.

## Deployment

- Aplikace bude spouštěna v kontejneru.
- Parametry serveru: (lze navýšit v případě potřeby)
  - CPU: 2 jádra
  - RAM: 4 GB
  - HDD: volných 29 GB

## Monitoring

- Bude k dispozici rozhraní pro monitorování aplikace.
