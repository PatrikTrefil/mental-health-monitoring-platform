Formio nepodporuje invalidaci již vydananých JWT tokenů
([dokumentace](https://apidocs.form.io/#bbcc4b6d-30cf-a043-7fe9-52b144c1162c)).
Jako bezpečnostní opatření je však nastavena nízká životnost tokenů (výchozí
hodnota: 240 sekund).

## Imutabilita identifikátorů uživatelů

Každý uživatel má své ID, které je imutabilní. Tento invariant nebylo možné
zajistit pomocí open-source verze Formio, jelikož nepodporuje možnost nastavení
přístupu k jednotlivým položkám odevzdání formuláře. Potřebovali jsme uživateli
umožnit změnu hesla a tedy jsme mu museli umožnit editaci celého odevzdání
formuláře reprezentující jeho účet. Jako řešení jsme upravili kód open-source
verze Formio, aby položky s klíčem ID v datech odevzdání byly imutabilní. Bližší
popis úpravy naleznete [zde](./Modifikace%20Formio.md)

Diskuzi k řešení lze nalézt v Github issue [#156][issue_156].

Úpravu kódu [forku Formio][formio_fork_repository] lze nalézt v [tomto
commitu][id_immutability_commit].

[formio_fork_repository]:
    https://github.com/PatrikTrefil/mental-health-monitoring-platform-formio
[id_immutability_commit]:
    https://github.com/PatrikTrefil/mental-health-monitoring-platform-formio/commit/1b1c0059582e323a10a32f867a8e25e201e8f0ec
[issue_156]:
    https://github.com/PatrikTrefil/mental-health-monitoring-platform/issues/156
