/* Náhodné průchody hrou: hledá pády, slepé uzly, nedosažitelné uzly a konce. Spuštění: node test/walk.js */
const path = require('path');
require(path.join(__dirname, '../js/story.js'));
require(path.join(__dirname, '../js/engine.js'));

function memStore() { const m = {}; return { get: k => (k in m ? JSON.parse(JSON.stringify(m[k])) : null), set: (k, v) => { m[k] = v; } }; }
let seed = 12345;
function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }

const N = STORY.N, visited = new Set(), ends = {}, problems = [];
const RUNS = 60000;
let longest = 0, bad = /[—–]/;

for (let r = 0; r < RUNS; r++) {
  const store = memStore();
  // část běhů začíná s vyrytými vzkazy z minulých pokusů
  if (r % 3 === 0) store.set('persist', { runs: 2, carv: { bed: true, point: true, night: true, blind: true }, ends: {} });
  const e = new Engine(store);
  let v = e.newGame(), steps = 0;
  // různé "povahy" hráče: opatrný se vyhýbá koncům, zvědavý ne
  const careful = r % 2 === 0;
  for (;;) {
    visited.add(v.id);
    if (!v.lines.length) problems.push('prázdný text: ' + v.id);
    v.lines.forEach(l => { if (typeof l !== 'string') problems.push('ne-text v ' + v.id); else if (bad.test(l)) problems.push('pomlčka v ' + v.id); else if (/undefined|NaN|\[object/.test(l)) problems.push('rozbitý text v ' + v.id + ': ' + l); });
    if (v.end) { ends[v.end.id] = (ends[v.end.id] || 0) + 1; break; }
    if (!v.choices.length) { problems.push('slepý uzel: ' + v.id); break; }
    if (++steps > 400) { problems.push('nekonečný běh, poslední uzel: ' + v.id); break; }
    let i = Math.floor(rnd() * v.choices.length);
    if (careful) {
      // zkus až 4x najít volbu, která nevede rovnou na konec
      for (let k = 0; k < 4; k++) {
        const c = e._choices[i];
        const to = typeof c.to === 'function' ? null : c.to;
        if (to && to.startsWith('end_') && to !== 'end_good') i = Math.floor(rnd() * v.choices.length); else break;
      }
    }
    // uložená hra musí jít obnovit do stejného zobrazení
    if (r % 50 === 0) {
      const e2 = new Engine(store); const v2 = e2.resume();
      if (v2.id !== v.id || v2.lines.join('|') !== v.lines.join('|') || v2.choices.join('|') !== v.choices.join('|')) problems.push('obnova uložené hry se liší v ' + v.id);
    }
    try { v = e.choose(i); } catch (err) { problems.push('pád: ' + err.message); break; }
  }
  longest = Math.max(longest, steps);
}

const unreached = Object.keys(N).filter(k => !visited.has(k) && k !== 'after');
const missingEnds = Object.keys(STORY.ENDINGS).filter(k => !ends[k]);
// statická kontrola cílů
Object.keys(N).forEach(k => { const c = N[k].choices; if (Array.isArray(c)) c.forEach(x => { if (typeof x.to === 'string' && !N[x.to]) problems.push('neexistující cíl ' + x.to + ' v ' + k); }); });

console.log('uzlů:', Object.keys(N).length, '| navštíveno:', visited.size, '| nejdelší běh:', longest, 'kroků');
console.log('konce:', JSON.stringify(ends));
console.log('nedosažené uzly:', unreached.join(', ') || 'žádné');
console.log('nedosažené konce:', missingEnds.join(', ') || 'žádné');
const uniq = [...new Set(problems)];
console.log('problémy:', uniq.length ? '\n - ' + uniq.slice(0, 30).join('\n - ') : 'žádné');
process.exit(uniq.length || unreached.length || missingEnds.length ? 1 : 0);
