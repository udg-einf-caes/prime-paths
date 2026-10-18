# prime-paths

Eina de línia d'ordres per calcular els camins primers d'un graf.

## Requisits

Cal tenir instal·lat Node.js. Descarregueu i instal·leu la versió LTS des de [nodejs.org](https://nodejs.org/).

Per comprovar que la instal·lació s'ha completat correctament, obriu un terminal i executeu:

```sh
node --version
```

L'ordre ha de mostrar la versió instal·lada de Node.js.
No cal instal·lar cap paquet addicional amb `npm install`.

## Execució

Obriu un terminal a la carpeta del repositori, on hi ha `prime-path-coverage.js`, i executeu l'script indicant el fitxer del graf com a argument:

```sh
node prime-path-coverage.js grafs/testcase1.txt
```

També podeu utilitzar qualsevol altre fitxer de graf. Per exemple:

```sh
node prime-path-coverage.js grafs/testcase2.txt
node prime-path-coverage.js grafs/testcase3.txt
```

L'script mostra el nombre de camins primers trobats i els nodes de cada camí. Si el camí cap al fitxer conté espais, poseu-lo entre cometes.

## Format del fitxer d'entrada

El fitxer és de text pla i ha de començar amb aquestes tres línies, en aquest ordre:

1. `Nodes:` seguit dels identificadors de tots els nodes.
2. `Nodes inicials:` seguit dels identificadors dels nodes inicials.
3. `Nodes finals:` seguit dels identificadors dels nodes finals.

Separeu els identificadors amb espais. Després d'aquestes línies, indiqueu les arestes, una per línia, amb el node d'origen i el node de destí separats per un espai. Tots dos nodes han d'estar inclosos a la llista `Nodes`.

Per exemple:

```text
Nodes: 1 2 3 4
Nodes inicials: 1
Nodes finals: 4
1 2
2 3
3 4
```

Els fitxers d'exemple es troben a la carpeta [`grafs/`](grafs/): `testcase1.txt`, `testcase2.txt` i `testcase3.txt`.