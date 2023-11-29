Pro export sesbíraných dat z aplikace potřebujeme získat data o úkolech a
odevzdání formulářů. Každý úkol spojíme s odevzdáním, které bylo vytvořeno v
rámci splnění tohoto úkolu. Data o úkolech a odevzdání však vlastní dvě různé
služby. Spojení dat můžeme provést na klientovi a nebo na serveru. Obě varianty
jsou možné. Umístění procesu spojení na server zajistí lepší interoperabilitu
našeho systému s ostatními systémy a umožní programově řídit export dat z
aplikace.

Pro tyto účely byl vytvořen speciální kontejner jehož úkolem je získat data z
ostatních služeb a spojit je. Jelikož export dat nebude probíhat příliš často a
sesbíraná data budou poměrně malá (očekáváme řádově maximálně stovky záznamů),
není nutné dbát na vysokou výkonnost této služby.

Máme několik možností implementace této služby. První možností je použití
návrhového vzoru [API composition][api_composition]. Tento vzor pracuje se
spojením uvnitř operační paměti. Implementace tohoto vzoru je velmi jednoduchá,
ale spojení dat může být neefektivní. Druhou možností je použití návrhového
vzoru [Command query responsibility segregation][cqrs]. Tento vzor využívá
repliky dat z obou datových zdrojů. Tato možnost je efektivnější, ale složitější
na implementaci.

Z vlastností obou možností je vidět, že API composition je vhodnější řešení
našeho problému. Finální implementace byla realizována vytvoření tRPC routeru v
rámci NextJS aplikace.

[api_composition]: https://microservices.io/patterns/data/api-composition.html
[cqrs]: https://microservices.io/patterns/data/cqrs.html
