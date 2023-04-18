Webová aplikace používá knihovnu `@formio/react` a `formiojs`
pro komunikaci s Formio serverem. Stav je uložen pomocí knihovny
Redux. Tyto knihovny spravují i autentifikaci uživatele.

Kontrola práv je realizováná pomocí _higher-order components_ (viz
[dokumentace](https://legacy.reactjs.org/docs/higher-order-components.html)).

Knihovna `@formio/react` nepodporuje server-side rendering,
proto je nutno vynutit client-side rendering pomocí `dynamic()`
z knihovny next. Načtení knihovny je poměrně krkolomé. Lepší
řešení by mohlo přijít s vydáním plné podpory pro `/app` složky
knihovnou Next, která podporuje označejí souboru, aby běžel pouze
na klientovi.
