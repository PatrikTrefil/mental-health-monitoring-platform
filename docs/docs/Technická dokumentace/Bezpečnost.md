Webové rozhrání používající Next.js ve výchozím nastavení sbírá anonymní data o
uživatelích. Pro zvýšení důvěry uživatelů v platformu, je sběr těchto dat
vypnutý (viz produkční Dockerfile web-app). (Detailní informace dostupné
[zde](https://nextjs.org/telemetry))

Software form.io nesbírá žádná data o uživatelích
([vyjádření společnosti](https://github.com/formio/formio/issues/1499)).

Konfigurace webového rozhraní je velmi defenzivní. Rozhraní lze použít pouze
skrze šifrované HTTPS spojení. Aplikace nezískává při načtení v prohlížeči žádné
zdroje poskytované třetími stranami. Bezpečnostní opatření byla nastavena na
základě
[doporučení od Mozilla Foundation](https://infosec.mozilla.org/guidelines/web_security).
