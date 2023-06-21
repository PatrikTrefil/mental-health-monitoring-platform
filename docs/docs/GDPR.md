---
slug: gdpr
---

Při autentizaci uživatele používáme cookies pro správu session. Ukládání dat do
uložiště klienta spadá pod GDPR, proto je nutno ověřit, jaké povinnosti máme.
Dle [doporučení Evropské Unie (sekce 3.2)][eu_doporuceni] pro autentifikační
cookies je potřeba pro _persistentní_ cookies upozornit uživatele o jejich
užití. Knihovna NextAuth, kterou používáme má podporu pouze pro persistentní
cookies (viz [issue][next_auth_issue]), tedy musíme uživatele řádně upozornit.

[eu_doporuceni]:
    https://ec.europa.eu/justice/article-29/documentation/opinion-recommendation/files/2012/wp194_en.pdf
[next_auth_issue]: https://github.com/nextauthjs/next-auth/issues/2534
