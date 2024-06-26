# Dokumentace platformy pro monitorování mentálního zdraví

Tato dokumentace využívá nástroj [Docusaurus 3](https://docusaurus.io/).
Vytvořená dokumentace obsahuje i automaticky generovanou dokumentaci z kódu z
projektu Webové aplikace (`/src/web-app/`).

## Instalace

Pro instalaci závislostí projektu použijte tento příkaz:

```sh
npm install
```

The documentation includes TSDoc generated documentation for the web
application. The generation of the documentation required the
`/src/web-app/next-env.d.ts`, which can be generated by building the web
application (this step must be done manually).

## Vývojové prostředí

Pro spuštění vývojového prostředí použijte tento příkaz:

```sh
npm run start
```

Tento příkaz spoustí lokální vývojový server a otevře okno v prohlížeči. Většina
změn je ihned reflektována bez restartu serveru.

## Produkční prostředí

Pro kompilaci projektu pro produkční prostředí použijte tento příkaz:

```sh
npm run build
```

Tento příkaz vygeneruje statický obsah do složky `build/`.

## Formátování

Pro kontrolu formátování souborů v projektu použijte tento příkaz:

```sh
npm run format:check
```

Pro opravu formátování souborů v projektu použijte tento příkaz:

```sh
npm run format:write
```
