/* 03:14: procedurální ambient přes Web Audio. Žádné zvukové soubory, všechno se syntetizuje za běhu. */
(function (root) {
  'use strict';

  // nálady: cutoff dronu, hlasitosti vrstev, akord sboru (poměry k základu), hustota "pingů", tep
  var MOODS = {
    title:  { base: 55,    cut: 220, drone: 0.20, dis: 0.00, wind: 0.05, choir: 0.03, chord: [2, 3, 4.5],            ping: 0.10, pulse: 0 },
    day:    { base: 55,    cut: 260, drone: 0.16, dis: 0.02, wind: 0.07, choir: 0.00, chord: [2, 3, 4],              ping: 0.07, pulse: 0 },
    dread:  { base: 51.9,  cut: 200, drone: 0.22, dis: 0.09, wind: 0.05, choir: 0.02, chord: [2, 2.83, 4.24],        ping: 0.14, pulse: 0 },
    night:  { base: 49,    cut: 150, drone: 0.24, dis: 0.07, wind: 0.10, choir: 0.03, chord: [2, 3, 4.24],           ping: 0.05, pulse: 0.25 },
    cellar: { base: 46.25, cut: 130, drone: 0.26, dis: 0.04, wind: 0.02, choir: 0.04, chord: [2, 2.4, 3],            ping: 0.20, pulse: 0 },
    event:  { base: 49,    cut: 700, drone: 0.20, dis: 0.12, wind: 0.03, choir: 0.22, chord: [4, 4.24, 5.04, 6, 7.55, 8], ping: 0.00, pulse: 0.6 },
    dark:   { base: 41.2,  cut: 110, drone: 0.28, dis: 0.10, wind: 0.08, choir: 0.00, chord: [2, 2.83, 4],           ping: 0.03, pulse: 0 },
    bleak:  { base: 55,    cut: 180, drone: 0.14, dis: 0.00, wind: 0.14, choir: 0.03, chord: [2, 3, 3.56],           ping: 0.06, pulse: 0 },
    dawn:   { base: 55,    cut: 900, drone: 0.12, dis: 0.00, wind: 0.03, choir: 0.16, chord: [2, 2.52, 3, 4, 4.5, 5.04], ping: 0.12, pulse: 0 }
  };

  var ctx = null, master, verb, drones = [], droneF, droneG, disO, disG, windF, windG, choir = [], choirG;
  var mood = 'title', on = true, started = false, pingT = null, pulseT = null, noiseBuf = null;

  function noise(seconds) {
    var b = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate), d = b.getChannelData(0), last = 0;
    for (var i = 0; i < d.length; i++) { var w = Math.random() * 2 - 1; last = (last + 0.04 * w) / 1.04; d[i] = last * 6 + w * 0.15; }
    return b;
  }
  function impulse(seconds) {
    var n = ctx.sampleRate * seconds, b = ctx.createBuffer(2, n, ctx.sampleRate);
    for (var c = 0; c < 2; c++) { var d = b.getChannelData(c); for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.6); }
    return b;
  }
  function ramp(param, v, t) { param.setTargetAtTime(v, ctx.currentTime, t || 2.5); }

  function start() {
    if (started) { if (ctx.state === 'suspended') ctx.resume(); return; }
    var AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return;
    ctx = new AC(); started = true;
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    verb = ctx.createConvolver(); verb.buffer = impulse(5);
    var verbG = ctx.createGain(); verbG.gain.value = 0.7; verb.connect(verbG); verbG.connect(master);
    noiseBuf = noise(4);

    // dron: tři lehce rozladěné pily přes dolní propust, kterou pomalu hýbe LFO
    droneF = ctx.createBiquadFilter(); droneF.type = 'lowpass'; droneF.frequency.value = 200; droneF.Q.value = 2;
    droneG = ctx.createGain(); droneG.gain.value = 0;
    droneF.connect(droneG); droneG.connect(master); droneG.connect(verb);
    [-7, 0, 6].forEach(function (cents, i) {
      var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 55 * (i === 2 ? 2 : 1); o.detune.value = cents;
      var g = ctx.createGain(); g.gain.value = i === 2 ? 0.25 : 0.5; o.connect(g); g.connect(droneF); o.start(); drones.push(o);
    });
    var lfo = ctx.createOscillator(), lfoG = ctx.createGain(); lfo.frequency.value = 0.05; lfoG.gain.value = 60;
    lfo.connect(lfoG); lfoG.connect(droneF.frequency); lfo.start();

    // disonance: sinus o malou sekundu nad oktávou, pomalu tepe proti dronu
    disO = ctx.createOscillator(); disO.type = 'sine'; disO.frequency.value = 55 * 2 * 1.06;
    disG = ctx.createGain(); disG.gain.value = 0; disO.connect(disG); disG.connect(verb); disG.connect(master); disO.start();

    // vítr: filtrovaný šum
    var ws = ctx.createBufferSource(); ws.buffer = noiseBuf; ws.loop = true;
    windF = ctx.createBiquadFilter(); windF.type = 'bandpass'; windF.frequency.value = 400; windF.Q.value = 0.8;
    windG = ctx.createGain(); windG.gain.value = 0; ws.connect(windF); windF.connect(windG); windG.connect(master); ws.start();
    var wl = ctx.createOscillator(), wlG = ctx.createGain(); wl.frequency.value = 0.07; wlG.gain.value = 220; wl.connect(wlG); wlG.connect(windF.frequency); wl.start();

    // "sbor": sinusy s vlastním tremolem, jen do dozvuku
    choirG = ctx.createGain(); choirG.gain.value = 0; choirG.connect(verb);
    var dry = ctx.createGain(); dry.gain.value = 0.25; choirG.connect(dry); dry.connect(master);
    for (var i = 0; i < 6; i++) {
      var o = ctx.createOscillator(); o.type = i % 2 ? 'triangle' : 'sine'; o.frequency.value = 110;
      var g = ctx.createGain(); g.gain.value = 0.0;
      var t = ctx.createOscillator(), tg = ctx.createGain(); t.frequency.value = 0.11 + i * 0.037; tg.gain.value = 0.06;
      t.connect(tg); tg.connect(g.gain); o.connect(g); g.connect(choirG); o.start(); t.start();
      choir.push({ o: o, g: g });
    }
    master.gain.setTargetAtTime(on ? 0.9 : 0, ctx.currentTime, 1.5);
    apply(0.1); schedulePing(); schedulePulse();
  }

  function apply(t) {
    if (!started) return;
    var m = MOODS[mood] || MOODS.day;
    drones[0].frequency.setTargetAtTime(m.base, ctx.currentTime, t || 3);
    drones[1].frequency.setTargetAtTime(m.base, ctx.currentTime, t || 3);
    drones[2].frequency.setTargetAtTime(m.base * 2, ctx.currentTime, t || 3);
    ramp(droneF.frequency, m.cut, t); ramp(droneG.gain, m.drone, t);
    disO.frequency.setTargetAtTime(m.base * 2 * 1.06, ctx.currentTime, t || 3); ramp(disG.gain, m.dis, t);
    ramp(windG.gain, m.wind, t); ramp(choirG.gain, m.choir, t || 4);
    choir.forEach(function (v, i) {
      var r = m.chord[i];
      if (r) { v.o.frequency.setTargetAtTime(m.base * r, ctx.currentTime, 2); ramp(v.g.gain, 0.16, 3); }
      else ramp(v.g.gain, 0, 2);
    });
  }

  // osamělé tóny s dlouhým dozvukem, jako kapka nebo vzdálený kov
  function schedulePing() {
    clearTimeout(pingT);
    pingT = setTimeout(function () {
      var m = MOODS[mood] || MOODS.day;
      if (on && started && ctx.state === 'running' && Math.random() < m.ping * 4) {
        var scale = mood === 'dawn' ? [8, 9, 10.08, 12, 13.45] : [8, 8.48, 9.51, 12, 12.7, 16.95];
        var f = m.base * scale[Math.floor(Math.random() * scale.length)];
        var o = ctx.createOscillator(), g = ctx.createGain(), now = ctx.currentTime;
        o.type = 'sine'; o.frequency.setValueAtTime(f, now);
        if (mood !== 'dawn') o.frequency.exponentialRampToValueAtTime(f * 0.985, now + 3);
        g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(0.05, now + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);
        o.connect(g); g.connect(verb); o.start(now); o.stop(now + 3.6);
      }
      schedulePing();
    }, 2500 + Math.random() * 4000);
  }

  // tep: hluboký dvojúder
  function thump(when, amp) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(70, when); o.frequency.exponentialRampToValueAtTime(38, when + 0.18);
    g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(amp, when + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, when + 0.35);
    o.connect(g); g.connect(master); o.start(when); o.stop(when + 0.4);
  }
  function schedulePulse() {
    clearTimeout(pulseT);
    var m = MOODS[mood] || MOODS.day;
    pulseT = setTimeout(function () {
      var mm = MOODS[mood] || MOODS.day;
      if (on && started && ctx.state === 'running' && mm.pulse > 0) { var n = ctx.currentTime; thump(n, 0.5 * mm.pulse); thump(n + 0.28, 0.32 * mm.pulse); }
      schedulePulse();
    }, m.pulse > 0.5 ? 820 : 1250);
  }

  function burst(dur, freq, q, amp, type) {
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(), now = ctx.currentTime;
    s.buffer = noiseBuf; s.loop = true; f.type = type || 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(amp, now + Math.min(0.3, dur / 4)); g.gain.setTargetAtTime(0, now + dur * 0.7, dur * 0.12);
    s.connect(f); f.connect(g); g.connect(master); g.connect(verb); s.start(now, Math.random() * 2); s.stop(now + dur + 1);
  }

  var SFX = {
    knock: function () { var n = ctx.currentTime + 0.5; [0, 0.42, 0.84].forEach(function (d) { thump(n + d, 0.7); }); },
    buzz: function () {
      var n = ctx.currentTime + 0.2;
      [0, 0.45].forEach(function (d) {
        var o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'square'; o.frequency.value = 155;
        g.gain.setValueAtTime(0, n + d); g.gain.linearRampToValueAtTime(0.035, n + d + 0.02); g.gain.setValueAtTime(0.035, n + d + 0.25); g.gain.linearRampToValueAtTime(0, n + d + 0.3);
        var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 500;
        o.connect(f); f.connect(g); g.connect(master); o.start(n + d); o.stop(n + d + 0.35);
      });
    },
    water: function () { burst(6, 2600, 0.6, 0.05, 'highpass'); },
    scrape: function () { [0, 0.5, 1.1].forEach(function (d) { setTimeout(function () { if (started) burst(0.35, 1800 + Math.random() * 900, 3, 0.05); }, d * 1000); }); },
    click: function () { var n = ctx.currentTime + 0.3; var o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'square'; o.frequency.setValueAtTime(900, n); o.frequency.exponentialRampToValueAtTime(200, n + 0.03); g.gain.setValueAtTime(0.12, n); g.gain.exponentialRampToValueAtTime(0.0001, n + 0.08); o.connect(g); g.connect(master); g.connect(verb); o.start(n); o.stop(n + 0.1); }
  };

  root.Sound = {
    start: start,
    mood: function (m) { if (m === mood) return; mood = m; apply(m === 'event' ? 1.2 : 3); schedulePulse(); },
    sfx: function (name) { if (on && started && ctx.state === 'running' && SFX[name]) SFX[name](); },
    toggle: function () { on = !on; if (started) master.gain.setTargetAtTime(on ? 0.9 : 0, ctx.currentTime, 0.3); return on; },
    isOn: function () { return on; },
    set: function (v) { on = !!v; if (started) master.gain.setTargetAtTime(on ? 0.9 : 0, ctx.currentTime, 0.3); }
  };
})(window);
