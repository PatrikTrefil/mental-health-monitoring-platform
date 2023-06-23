Subrepozitář `/src/formio/` obsahuje fork projektu formio, kde bylo provedeno
několik úprav.

První úprava se týče inicializace instance při prvním startu. Nepodařilo se mi
najít způsob jak zařídit aby se projekt inicializoval tak, aby se automaticky
vytvořili všechny potřebné resource (klient/pacient, zaměstnanec, apod.), role
(admin, zaměstnanec, apod.), a proto jsem upravil inicializaci tak, aby se
načetla z souboru `project.json`,který je v kořenu subrepozitáře (původně se
načítala z `project.json` v build složce, která však nění uložena ve verzovacím
systému).

## Konfigurace resources

Roli lze k uživateli přiřadit pouze skrze action, která je přiřazena k resource.
Proto je potřeba vytvořit resource pro každou kombinaci roli, kterou chceme
vytvořit. Vzhledem k tomu, že jsou resource oddělené, nelze jednoduše validovat
(při tvorbě uživatelského účtu), že má každý uživatel unikátní ID pro
přihlášení. Abychom předešli bezpečnostním problémům a zmatení uživatele
vytvoříme omezení na ID každého resource. Pro každý resource vytvoříme prefix
ID, který musí každé ID obsahovat. Pokud bude mít každý resource unikátní prefix
a každý resource bude dohlížet na unikátnost ID svých uživatelů, tak budou mít
všichni uživatelé unikátní ID. Například klient/pacient, který měl původně ID
`123` bude mít ID `U-123`, kde prefix je `U-`.

## Webhook action

Webhook action je action, která umožňuje poslat HTTP dotaz na zadanou URL při
vytvoření, editaci nebo smazaní vyplnění dotazníku. V open-source verzi formio
tato action neumí přeposílat hlavičky HTTP dotazu, který akci inicioval. Tuto
funkcionalitu potřebujeme, jelikož chceme přeposílat autentifikační hlavičky při
komunikaci s komponentou spravující úkoly uživatelů. Proto jsem upravil tuto
action tak, aby bylo lze nastavit zda-li má akce přeposílat autentifikační
hlavičky.
