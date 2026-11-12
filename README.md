# 03:14

Interaktivní textový horor v prohlížeči. Probudíš se a všichni jsou pryč. Ve 03:14 se něco stalo. A stane se to znova.

**Hrát:** https://fpindej.github.io/0314/

## O hře

- Čteš a volíš. 14 konců, jeden dobrý.
- Hra si pamatuje mezi pokusy jen to, co je psané rukou nebo vyryté. Přesně jako ty.
- Hudba a zvuky se syntetizují za běhu přes Web Audio podle toho, co se zrovna děje. Žádné zvukové soubory. Nejlíp ve sluchátkách.
- Postup se ukládá do prohlížeče (localStorage). Klávesy A až J vybírají volby, mezerník přeskočí odkrývání textu.

## Technicky

Statická stránka bez build kroku a bez závislostí.

| Soubor | Co dělá |
| --- | --- |
| `js/story.js` | Celý příběh: uzly, podmínky, konce |
| `js/engine.js` | Stavový stroj a ukládání, bez DOM |
| `js/audio.js` | Procedurální ambient (dron, vítr, sbor, tep, efekty) |
| `js/ui.js` | Vykreslení, sedmisegmentové hodiny, ovládání |
| `test/walk.js` | Náhodné průchody: hledá pády, slepé uzly a nedosažitelné konce |

Lokálně stačí otevřít `index.html`. Test: `node test/walk.js`.

Příběh vznikl jako improvizovaná hra v chatu s Claudem, tohle je její rozvětvená verze.
