/* 03:14: vykreslení, ovládání, ukládání. */
(function () {
  'use strict';

  var store = {
    get: function (k) { try { var v = localStorage.getItem('g0314.' + k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
    set: function (k, v) { try { if (v === null) localStorage.removeItem('g0314.' + k); else localStorage.setItem('g0314.' + k, JSON.stringify(v)); } catch (e) { /* bez úložiště se jen neukládá */ } }
  };
  var engine = new Engine(store);
  var $ = function (id) { return document.getElementById(id); };
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealTimers = [], current = null, finishReveal = null;

  // ---------- sedmisegmentové hodiny ----------
  var SEG = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
  var SHAPE = {
    a: '4,0 26,0 22,5 8,5', b: '30,3 30,25 25,22 25,8', c: '30,29 30,51 25,46 25,32',
    d: '4,54 26,54 22,49 8,49', e: '0,29 0,51 5,46 5,32', f: '0,3 0,25 5,22 5,8', g: '5,27 8,24.5 22,24.5 25,27 22,29.5 8,29.5'
  };
  function clockSvg(str) {
    var x = 0, out = '', chars = (str || '').split('');
    chars.forEach(function (ch) {
      if (ch === ':') { out += '<g class="colon"><rect x="' + (x + 3) + '" y="15" width="5" height="5"/><rect x="' + (x + 3) + '" y="35" width="5" height="5"/></g>'; x += 18; return; }
      var lit = SEG[ch] || '';
      out += '<g transform="translate(' + x + ',0)">';
      Object.keys(SHAPE).forEach(function (k) { out += '<polygon class="' + (lit.indexOf(k) >= 0 ? 'on' : 'off') + '" points="' + SHAPE[k] + '"/>'; });
      out += '</g>'; x += 40;
    });
    var w = Math.max(x - 10, 1);
    return '<svg viewBox="-2 -2 ' + (w + 4) + ' 58" role="img" aria-label="' + (str || '') + '">' + out + '</svg>';
  }

  // ---------- text ----------
  function esc(t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function inline(t) { return esc(t).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>'); }
  var KIND = { '> ': 'sms', '~ ': 'note', '# ': 'carve', '! ': 'voice', '= ': 'stamp', '+ ': 'diary' };
  function lineEl(l) {
    var kind = KIND[l.slice(0, 2)], body = kind ? l.slice(2) : l, el = document.createElement(kind === 'stamp' ? 'h3' : 'p');
    el.className = 'ln ' + (kind || 'prose');
    if (kind === 'sms') el.innerHTML = '<span class="from">0314</span>' + inline(body);
    else if (kind === 'stamp') el.innerHTML = clockSvg(body);
    else el.innerHTML = inline(body);
    return el;
  }
  function gainEl(text) {
    var el = document.createElement('p'); el.className = 'ln gain';
    el.innerHTML = '<span class="tag">Nová stopa</span>' + inline(text);
    return el;
  }

  var KINDLABEL = { good: 'Dobrý konec', bleak: 'Hořký konec', bad: 'Špatný konec', loop: 'Zpátky na začátek' };

  function render(v) {
    current = v;
    revealTimers.forEach(clearTimeout); revealTimers = [];
    document.body.dataset.bleach = v.bleach;
    document.body.dataset.mood = v.mood;
    $('day').textContent = v.time[0] || '';
    $('clock').innerHTML = clockSvg(v.time[1] || '');
    $('clock').classList.toggle('zero', v.time[1] === '03:14');
    Sound.mood(v.mood);
    if (v.sfx) Sound.sfx(v.sfx);

    var story = $('story'), list = $('choices'), endBox = $('end'), skip = $('skip');
    story.innerHTML = ''; list.innerHTML = ''; endBox.hidden = true; skip.hidden = true;
    var els = v.lines.map(lineEl);
    (v.newClues || []).forEach(function (c) { els.push(gainEl(c)); });
    if (v.newClues && v.newClues.length) $('notesBtn').classList.add('fresh');
    els.forEach(function (el) { story.appendChild(el); });

    function showChoices() {
      skip.hidden = true;
      if (v.end) {
        var all = engine.endings(), found = all.filter(function (e) { return e.found; }).length;
        $('endKind').textContent = KINDLABEL[v.end.k];
        $('endTitle').textContent = v.end.t;
        $('endWhy').textContent = v.end.w; $('endWhyBox').open = false;
        $('endCount').textContent = 'Nalezené konce: ' + found + ' z ' + all.length + '. Stopy v tomhle pokusu: ' + v.end.clues + ' z ' + v.end.cluesTotal + '.';
        endBox.dataset.kind = v.end.k; endBox.hidden = false;
        $('again').textContent = v.end.k === 'good' ? 'Hrát znovu' : 'Znovu od rána';
        return;
      }
      var solo = v.choices.length === 1;
      list.classList.toggle('solo', solo);
      v.choices.forEach(function (t, i) {
        var li = document.createElement('li'), b = document.createElement('button');
        b.type = 'button';
        // jediná možnost není volba, takže nedostane písmeno
        b.innerHTML = (solo ? '' : '<span class="key">' + String.fromCharCode(65 + i) + '</span>') + '<span class="lbl">' + inline(t) + '</span>';
        b.addEventListener('click', function (e) { e.stopPropagation(); choose(i); });
        li.appendChild(b); list.appendChild(li);
      });
      list.classList.remove('pending');
    }

    list.classList.add('pending');
    finishReveal = null;
    if (reduce) { els.forEach(function (el) { el.classList.add('in'); }); showChoices(); }
    else {
      var step = v.bleach >= 2 ? 620 : 420, done = false;
      finishReveal = function (byUser) {
        if (done) return; done = true; finishReveal = null;
        revealTimers.forEach(clearTimeout);
        els.forEach(function (el) { el.classList.add('in'); });
        if (byUser) store.set('skipped', true);
        showChoices();
      };
      els.forEach(function (el, i) { revealTimers.push(setTimeout(function () { el.classList.add('in'); }, 120 + i * step)); });
      revealTimers.push(setTimeout(function () { if (finishReveal) finishReveal(false); }, 120 + els.length * step));
      // nápověda se ukazuje jen do doby, než hráč přeskočení poprvé použije
      if (!store.get('skipped') && els.length > 3) revealTimers.push(setTimeout(function () { if (finishReveal) skip.hidden = false; }, 1400));
    }
    window.scrollTo(0, 0);
  }

  function choose(i) { try { render(engine.choose(i)); } catch (e) { fail(e); } }
  function fail(e) {
    $('story').innerHTML = ''; $('choices').innerHTML = '';
    var p = document.createElement('p'); p.className = 'ln prose in';
    p.textContent = 'Hra narazila na chybu (' + e.message + '). Vrať se na úvod a spusť novou hru, rozehraný pokus se nepodařilo obnovit.';
    $('story').appendChild(p);
  }

  // ---------- obrazovky ----------
  function show(name) {
    ['title', 'game', 'gallery', 'notes'].forEach(function (n) { $(n).hidden = n !== name; });
    // přepnutí obrazovky nesmí projít pomalým přechodem barev, jinak je text chvíli nečitelný
    if (document.body.dataset.screen !== name) {
      document.body.classList.add('snap');
      setTimeout(function () { document.body.classList.remove('snap'); }, 80);
    }
    document.body.dataset.screen = name;
    document.body.dataset.bleach = name === 'game' && current ? current.bleach : 0;
    window.scrollTo(0, 0);
  }

  function title() {
    show('title'); Sound.mood('title');
    $('titleClock').innerHTML = clockSvg('03:14');
    $('continue').hidden = !engine.hasSave();
    var found = engine.endings().filter(function (e) { return e.found; }).length;
    $('openGallery').textContent = 'Konce (' + found + ' z ' + engine.endings().length + ')';
    var runs = engine.P.runs || 0;
    $('attempt').textContent = runs ? 'Za zrcadlem v koupelně je ' + (14 + runs) + ' čárek.' : '';
  }

  function gallery() {
    show('gallery');
    var ul = $('endList'); ul.innerHTML = '';
    engine.endings().forEach(function (e) {
      var li = document.createElement('li'); li.className = e.found ? 'found ' + e.k : 'locked';
      // nalezený konec jde rozkliknout: krátké vysvětlení, co se stalo
      if (e.found) li.innerHTML = '<details><summary><span class="t">' + esc(e.t) + '</span><span class="k">' + KINDLABEL[e.k] + '</span></summary><p class="why">' + esc(e.w) + '</p></details>';
      else li.innerHTML = '<span class="t">Nenalezeno</span>';
      ul.appendChild(li);
    });
  }

  function notes() {
    var nb = engine.notebook(); if (!nb) return;
    $('notesBtn').classList.remove('fresh');
    $('notesCount').textContent = nb.found ? 'Stopy: ' + nb.found + ' z ' + nb.total + '. Co zatím víš a co ti ještě chybí.' : 'Zatím nevíš nic. Rozhlížej se, čti, ptej se.';
    var box = $('notesList'); box.innerHTML = '';
    nb.groups.forEach(function (g) {
      var sec = document.createElement('section'), h = document.createElement('h3');
      h.textContent = g.title; sec.appendChild(h);
      g.items.forEach(function (t) { var p = document.createElement('p'); p.className = 'clue'; p.textContent = t; sec.appendChild(p); });
      if (g.missing) {
        var m = document.createElement('p'); m.className = 'missing';
        m.textContent = g.items.length ? (g.missing === 1 ? 'Jedna stopa ještě chybí.' : 'Chybí ještě ' + g.missing + (g.missing < 5 ? ' stopy.' : ' stop.')) : 'Zatím nic.';
        sec.appendChild(m);
      }
      box.appendChild(sec);
    });
    show('notes');
  }

  function soundLabel() { $('soundTitle').textContent = Sound.isOn() ? 'Zvuk: zapnutý' : 'Zvuk: vypnutý'; $('soundGame').textContent = Sound.isOn() ? 'Zvuk' : 'Ticho'; $('soundGame').setAttribute('aria-pressed', Sound.isOn()); }
  function begin(view) { Sound.start(); $('notesBtn').classList.remove('fresh'); current = null; show('game'); try { render(view()); show('game'); } catch (e) { fail(e); } }

  document.addEventListener('DOMContentLoaded', function () {
    if (store.get('mute')) Sound.set(false);
    soundLabel(); title();
    $('new').addEventListener('click', function () { begin(function () { return engine.newGame(); }); });
    $('continue').addEventListener('click', function () { begin(function () { return engine.resume(); }); });
    $('again').addEventListener('click', function () { begin(function () { return engine.newGame(); }); });
    $('toTitle').addEventListener('click', title);
    $('notesBtn').addEventListener('click', notes);
    $('notesBack').addEventListener('click', function () { show('game'); });
    $('notesHome').addEventListener('click', title);
    $('openGallery').addEventListener('click', function () { Sound.start(); gallery(); });
    $('endGallery').addEventListener('click', gallery);
    $('closeGallery').addEventListener('click', title);
    $('wipe').addEventListener('click', function () {
      if ($('wipe').dataset.armed) { engine.wipe(); delete $('wipe').dataset.armed; $('wipe').textContent = 'Smazat postup'; gallery(); }
      else { $('wipe').dataset.armed = '1'; $('wipe').textContent = 'Opravdu smazat konce i vyryté vzkazy?'; }
    });
    function tog() { Sound.start(); store.set('mute', Sound.toggle() ? null : true); soundLabel(); }
    $('soundTitle').addEventListener('click', tog);
    $('soundGame').addEventListener('click', tog);
    // klepnutí kamkoliv do stránky odkryje zbytek textu
    $('page').addEventListener('click', function () { if (finishReveal) finishReveal(true); });
    document.addEventListener('keydown', function (e) {
      if ($('game').hidden || e.metaKey || e.ctrlKey || e.altKey) return;
      var btns = $('choices').querySelectorAll('button');
      if (e.key === ' ' || e.key === 'Enter') {
        if (finishReveal) { e.preventDefault(); finishReveal(true); }
        else if (btns.length === 1 && document.activeElement.tagName !== 'BUTTON') { e.preventDefault(); btns[0].click(); }
        return;
      }
      var k = e.key.toUpperCase(), idx = k.length === 1 ? k.charCodeAt(0) - 65 : -1;
      if (!finishReveal && idx >= 0 && idx < btns.length) btns[idx].click();
    });
  });
})();
