Uživatelé (klienti, pacienti a zaměstnanci) se přihlašují pomocí ID a hesla.
Administrátoři se přihlašují pomocí e-mailu a hesla. Pro autentifikaci se
používá knihovna NextAuth, která vykonává kód jak na klientovi, tak na serveru
webové aplikace. Tato knihovna má vlastní session management a vydává JWT
tokeny. Aby klient mohl pracovat se systémem formulářů, je potřeba získat JWT
token formulářového systému. Tento token se automatický získá při přihlášení
přes NextAuth a umístí se do tokenu webové aplikace. Při odhlášení se
automatický deaktivuje token formulářového systému. Tento systém zařizuje, že
webová aplikace nemusí při každém požadavku od klienta komunikovat s
formulářovým systémem, ale má vlastní session.

Kontrola práv uživatele při přístupu na ochráněnou stránku se kontrola provádí v
middlewaru NextJS serveru. Pokud uživatel nemá dostatečná práva, je přesměrován
na `/403`.

Životnost jednoho tokenu musí být stejná nebo nižší než životnost tokenu
vydaného formulářovým systémem (viz [Formio](../Formio/Autentifikace.md)).

```plantuml
@startuml
actor klient as "Klient"
entity webAppKlient as "Klient webové aplikace"
entity webAppServer as "Server webové aplikace"
entity manazerUzivatelu as "Manažer uživatelů a autentifikace"
database uzivateleDb as "Databáze uživatelů"

klient -> webAppKlient: Přihlašení uživatele (id, heslo)
webAppKlient -> webAppServer: Zaslání požadavku na server
webAppServer -> manazerUzivatelu: Kontrola existence uživatele a vyžádání JWT tokenu pro Formio
manazerUzivatelu -> uzivateleDb: Kontrola existence v DB
manazerUzivatelu <-- uzivateleDb

webAppServer <-- manazerUzivatelu

webAppKlient <-- webAppServer: JWT token pro session serveru, která obsahuje informace o uživateli, JWT token pro Formio

== Inicializace session dokončena ==

klient <-- webAppKlient: Uživatel je přesměrován

== Průběh komunikace po inicializaci ==


klient -> webAppKlient
webAppKlient -> webAppServer
webAppServer -> manazerUzivatelu: Žádost o obnovení JWT tokenu
webAppServer <-- manazerUzivatelu: Nový JWT token
webAppKlient <-- webAppServer
klient <-- webAppKlient
@enduml
```
