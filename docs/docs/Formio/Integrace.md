Udělal jsem fork repozitáře s Formio serverem, který je
uveden jako subrepozitář tohoto repozitáře. Nechceme
příliš modifikovat kód, ale jisté změny je potřeba dělat.
Subrepozitář umožňuje update sloučit s našimi změnami.

Aktuálně je upraven způsob jak se vybírá šablona při prvním
startu služby, která definuje role, zdroje a formuláře,
které se automaticky vytvoří při prvním spuštění.
Bez této změny se volila šablona z klienta, kterou nelze jednoduše
modifikovat pro naše potřeby.

Celý webový klient dodávaný k softwaru je špatně napsaný,
ale dává nám interface, který víme, že funguje, takže je vhodný
pro vývojové a administrátorské účely. Formio již pracuje na úplně nové
verzi webového klienta (viz [issue](https://github.com/formio/formio-app-formio/issues/34), viz [repozitář](https://github.com/formio/formio-app-formio))
