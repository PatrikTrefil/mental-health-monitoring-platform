# Testování aplikace

Serverová část aplikace je testována pomocí automatizovaných unit testů.
Testujeme pouze veřejné rozhraní všech modulů. Objekt fungující jako proxy
databáze byl nahrazen mock objekty. V testech kontrolujeme, zda-li se volají
konkrétní metody na mock objektech s očekávanými parametry. Ačkoliv je vyše
popsaný způsob doporučeným přístupem dle
[dokumentace object-relational mapping knihovny Prisma](https://www.prisma.io/docs/guides/testing/unit-testing),
v našem případě se neosvědčil.

Kontrola volání konkrétních metod vytváří obrovskou závislost na vnitřní
implementaci testovaných metod. Testy jsou velmi těžko udržovatelné a navíc
poměrně dlouhé a složité. Kdybych začínal znovu, tak bych zvolil jinou
dekompozici nebo bych zvážil použití in-memory databáze.

V tabulce níže je zobrazeno pokrytí serverové části automatizovanými unit testy.

| **Výrazy** | **Větve** | **Funkce** | **Řádky** |
| ---------- | --------- | ---------- | --------- |
| 90.85 %    | 72.91 %   | 100 %      | 90.85 %   |
