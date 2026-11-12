/* 03:14: herní logika bez DOM. Stav běhu (s) se resetuje, perzistentní stav (P) přežívá mezi pokusy. */
(function (root) {
  'use strict';
  var ST = root.STORY;

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function val(v, s, P) { return typeof v === 'function' ? v(s, P) : v; }

  function Engine(store) {
    this.store = store;
    this.P = store.get('persist') || { runs: 0, carv: {}, ends: {} };
    this.P.carv = this.P.carv || {}; this.P.ends = this.P.ends || {};
    this.s = null; this.id = null; this._choices = [];
  }

  Engine.prototype.hasSave = function () { return !!this.store.get('save'); };

  Engine.prototype.newGame = function () {
    this.s = ST.newState();
    return this.go(ST.START);
  };

  Engine.prototype.resume = function () {
    var sv = this.store.get('save');
    if (!sv || !ST.N[sv.id]) return this.newGame();
    this.s = sv.s;
    return this.go(sv.id);
  };

  Engine.prototype.go = function (id) {
    var node, pre, r, guard = 0;
    for (;;) {
      node = ST.N[id];
      if (!node) throw new Error('Neznámý uzel: ' + id);
      if (++guard > 20) throw new Error('Smyčka v přesměrování: ' + id);
      pre = clone(this.s);
      if (node.enter) node.enter(this.s, this.P);
      r = node.redirect ? node.redirect(this.s, this.P) : null;
      if (r) { id = r; continue; }
      break;
    }
    this.id = id;
    var s = this.s, P = this.P;
    var lines = (val(node.text, s, P) || []).slice();
    var all = val(node.choices, s, P) || [];
    this._choices = all.filter(function (c) { return !c.if || c.if(s, P); });
    var view = {
      id: id,
      time: val(node.time, s, P) || ['', ''],
      mood: node.mood || 'day',
      sfx: val(node.sfx, s, P) || null,
      bleach: node.bleach || 0,
      lines: lines,
      choices: this._choices.map(function (c) { return c.t; }),
      end: null
    };
    if (node.end) {
      var e = ST.ENDINGS[node.end];
      P.ends[node.end] = true; P.runs = (P.runs || 0) + 1;
      view.end = { id: node.end, t: e.t, k: e.k };
      this.store.set('save', null);
    } else {
      this.store.set('save', { id: id, s: pre });
    }
    this.store.set('persist', P);
    return view;
  };

  Engine.prototype.choose = function (i) {
    var c = this._choices[i];
    if (!c) throw new Error('Neplatná volba ' + i + ' v ' + this.id);
    if (c.do) c.do(this.s, this.P);
    return this.go(val(c.to, this.s, this.P));
  };

  Engine.prototype.endings = function () {
    var P = this.P;
    return Object.keys(ST.ENDINGS).map(function (k) {
      return { id: k, t: ST.ENDINGS[k].t, k: ST.ENDINGS[k].k, found: !!P.ends[k] };
    });
  };

  Engine.prototype.wipe = function () {
    this.P = { runs: 0, carv: {}, ends: {} };
    this.store.set('persist', this.P); this.store.set('save', null);
  };

  root.Engine = Engine;
})(typeof window !== 'undefined' ? window : globalThis);
