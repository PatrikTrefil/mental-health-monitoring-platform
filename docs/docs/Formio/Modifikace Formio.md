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
přihlášení. Abychom předešli zmatení uživatelů, v uživatelském rohraní vždy k ID
přidáme i roli, která je uživateli přiřazena.

## Webhook action

Webhook action je action, která umožňuje poslat HTTP dotaz na zadanou URL při
vytvoření, editaci nebo smazaní vyplnění dotazníku. V open-source verzi formio
tato action neumí přeposílat hlavičky HTTP dotazu, který akci inicioval. Tuto
funkcionalitu potřebujeme, jelikož chceme přeposílat autentifikační hlavičky při
komunikaci s komponentou spravující úkoly uživatelů. Proto jsem upravil tuto
action tak, aby bylo lze nastavit zda-li má akce přeposílat autentifikační
hlavičky.

## Imutabilita ID uživatele

Motivaci ke zmeně naleznete v sekci [Autentifikace](Autentifikace.md).

Pokud se uživatel pokusí změnit své ID, tak se změna neprovede. Toto řešení
spoléhá na to, že přístup k databázi uživatelů děláme pouze skrze knihovnu
Mongoose, která imutabilitu zajišťuje (MongoDB samotnés neumožňuje nastavit
imutabilitu položek). Nevýhodou tohoto řešení je, že vytváří zvláštní omezení na
všechny položky s klíčem "id" ve všech odevzdáních, ale zásadní výhodou je
jednoduchost.

Alternativní řešení by bylo vytvořit autorizační proxy mezi klientem a správcem
uživatelů či mezi správcem uživatelů a databází, ale toto řešení je
komplikované, pravděpodobně by vyžadovalo další kontejner a má netriviální
implementaci, která není odolná vůči změnám (Pokud máme více koncových bodů API,
které umožňují modifikovat entitu uživatele, je třeba myslet na zabezpečení
všech koncových bodů. V případě přidání nového bodu, je vždy potřeba myslet na
úpravy autorizační proxy.).
