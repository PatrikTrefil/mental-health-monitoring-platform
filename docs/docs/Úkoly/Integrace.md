Klient/pacient si může vytvořit koncept pro libovolný dotazník. Při odevzdání
dotazníku informuje formulářový systém automaticky pomocí webhook systém
spravující koncepty. Díky tomu nezůstávají koncepty v systému. Pokud však tento
webhook selže, koncept v systému zůstane. Tato situace je velmi nepravděpodobná,
takže ji nebudeme řešit. Pokud by se v průběhu užívání ukázalo, že se jedná o
větší problém než se předpokládalo, lze zavést omezení na životnost konceptu.
Např. bychom mohli ukládat pouze koncepty, které byly použity v posledních 30
dnech. Tím bychom zajistili, že i pokud webhook selže, tak se koncept v systému
nezachová déle než 30 dní.
