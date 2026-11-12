/* 03:14: příběhová data.
   Řádky textu: '> ' zpráva z čísla 0314, '~ ' ručně psaný lístek, '# ' vyryto do omítky,
   '! ' hlas, '= ' časová značka. Vše ostatní je vyprávění. **tučně** funguje všude. */
(function (root) {
  'use strict';

  var ENDINGS = {
    good:    { t: 'Ve dveřích',          k: 'good'  },
    alone:   { t: 'Druhá cesta',         k: 'bleak' },
    up:      { t: 'Šel nahoru',          k: 'bad'   },
    look:    { t: 'Pohled',              k: 'bad'   },
    mirror:  { t: 'Třetiny',             k: 'bad'   },
    sky:     { t: 'Pod širým nebem',     k: 'bad'   },
    screen:  { t: 'Přes displej',        k: 'bad'   },
    floor:   { t: 'Pohled dolů',         k: 'bad'   },
    deal:    { t: 'Obchod',              k: 'bad'   },
    proof:   { t: 'Pět minut',           k: 'bad'   },
    stairs:  { t: 'Čekal na schodech',   k: 'bad'   },
    fourth:  { t: 'Den je můj',          k: 'bad'   },
    amnesia: { t: 'Prospal jsi to',      k: 'loop'  },
    blind:   { t: 'Psáno poslepu',       k: 'loop'  }
  };

  function newState() {
    return {
      day: 1, actions: 0, nights: 0, erosion: 0,
      done: {}, today: {}, q: {}, qLeft: 0,
      supplies: false, phoneOff: false, sawCams: false, knowsLoop: false,
      found: false, carved1: false, sevenBurned: false, knowsSeven: false,
      knowsPoint: false, sawWetPaint: false, trapSet: false, chain: false,
      knowsSelf: false, metNight: false, knowsWays: false, heardTease: false,
      knowsFourth: false, verified: false, offerDay: null, offerGone: false,
      offerCarved: false, fortyTwo: false, lied: false, away: false, wasAway: false,
      noteSeen: false, sawHand: false, shaken: false,
      hasDog: false, animals: false, waited: false, sawLock: false, knowsLamp: false, lostTime: false, hubSeen: false
    };
  }

  // ---------- pomocné ----------
  function tallyM(s, P) { return 14 + (P.runs || 0) + (s.day - 1); }
  function tallyC(s, P) { return tallyM(s, P) + 1; }
  function offer(s) {
    if (s.offerDay === null || s.offerGone) return 'none';
    if (s.day === s.offerDay) return 'full';
    if (s.day === s.offerDay + 1) return 'reduced';
    return 'bare';
  }
  function act(key) { return function (s) { s.actions++; s.done[key] = true; }; }
  function hasCarv(P) { var c = P.carv || {}; return !!(c.point || c.bed || c.night || c.blind); }

  var N = {};

  // =====================================================================
  //  DEN 1
  // =====================================================================
  N.start = {
    time: ['Den 1', '06:47'], mood: 'day',
    text: function (s, P) {
      return [
        'Budí tě ticho. Žádná auta, žádnej soused s vrtačkou, žádný hlasy. Jen lednička.',
        'Byt je prázdnej. Postele rozestlaný, ještě teplý. Na lince stojí hrnek s kávou, kouří se z ní. Nikdo ji nepije.',
        'Telefon má plnej signál. Voláš jedno číslo, druhý, pátý. Všude to vyzvání, nikdo to nebere. Poslední zpráva v jakýmkoliv chatu přišla ve 03:14. Sociální sítě zamrzly ve stejnou minutu, na celým světě.',
        'Z okna vidíš ulici. Auto stojí uprostřed křižovatky, motor běží, dveře řidiče otevřený. Na chodníku leží vodítko. Bez psa.',
        'Elektřina zatím jde. Voda teče. Otázka je jak dlouho.',
        'A pak si všimneš jedný věci: vchodový dveře tvýho bytu jsou odemčený. Večer jsi zamykal. Víš to jistě.'
      ];
    },
    choices: [
      { t: 'Projít barák, zabušit na sousedy. Zjistit, jestli je pryč fakt každej.', to: 'house' },
      { t: 'Zásoby. Napustit vanu, nabít powerbanky, sepsat, co je doma.', to: 'supplies' },
      { t: 'Sednout k počítači a zjistit, co se ve 03:14 stalo.', to: 'pc1' },
      { t: 'Vzít auto z křižovatky a jet se podívat do města.', to: 'city' },
      { t: 'Nejdřív ty dveře. Kdo je odemkl a jestli v bytě něco chybí. Nebo přibylo.', to: 'door' },
      { t: 'Něco tě táhne k pracovnímu stolu. Nevíš proč.', to: 'desk', if: function (s, P) { return hasCarv(P); } }
    ]
  };

  N.desk = {
    time: ['Den 1', '06:55'], mood: 'dread', sfx: 'scrape',
    enter: function (s) { s.knowsLoop = true; },
    text: function (s, P) {
      var c = P.carv || {}, t = [
        'Stojíš u stolu a nevíš, proč tu stojíš. Ruka ti sama sjede pod desku. Prsty nahmataj rýhy.',
        'Lehneš si na zem a posvítíš si mobilem. Zespodu je do dřeva něco vyrytý. Nožem. Tvým písmem.'
      ];
      if (c.blind) t.push('~ pod postel. hned. nedívej se. nespi.');
      if (c.bed) t.push('# VE 03:14 POD POSTEL. OBLIČEJ DO ZEMĚ. NEDÍVAT SE. NEUSNOUT.');
      if (c.point) t.push('# VŠICHNI SE DÍVALI NA 4. PATRO NAD POSTELÍ. VE DNE TAM NECHOĎ. NIKDY.');
      if (c.night) t.push('# TEN V KÓJI 7 JSI TY. VĚŘ MU. LÍSTKY POD DVEŘMI NEPÍŠE ON.');
      t.push('Nepamatuješ si, že bys to psal. Ale je to tvoje ruka, o tom není pochyb.');
      t.push('Někde nad tebou, o patro výš, někdo pustí vodu.');
      return t;
    },
    choices: [{ t: 'Vstát. Poslouchat.', to: 'water' }]
  };

  N.house = {
    time: ['Den 1', '07:10'], mood: 'dread',
    text: [
      'Bušíš na dveře, patro po patru. Nikdo. Dvoje dveře jsou pootevřený. Uvnitř teplý postele, puštěná televize se zamrzlým obrazem, na sporáku vyvařenej hrnec.',
      'Všichni odešli uprostřed pohybu. Jako by je někdo vystřihl.',
      'Zbývá čtvrtý patro. Starej pán, co žije sám. Jeho dveře jsou pootevřený na šířku dlaně.',
      'Zevnitř jde teplo. A zvuk tekoucí vody. Někdo tam je.',
      '! „Haló? Je tam někdo? Pojďte dál, prosím vás. Já nevím, co se děje.“',
      'Zní to jako on. I s tím zakašláním na konci.'
    ],
    choices: [
      { t: 'Vejít dovnitř. Konečně živej člověk.', to: 'end_up' },
      { t: 'Něco tu nesedí. Potichu zpátky dolů a zamknout se.', to: 'lock' }
    ]
  };

  function waterChoices() {
    return [
      { t: 'Jít nahoru a zaklepat. Jestli tam někdo je, chceš to vědět hned.', to: 'end_up' },
      { t: 'Jít nahoru potichu, s něčím v ruce. Nejdřív poslouchat za dveřma.', to: 'listen' },
      { t: 'Zamknout, zastrčit řetízek, nahoru nechodit. Máš důležitější věci.', to: 'lock' },
      { t: 'Zabušit na strop koštětem a čekat, jestli něco odpoví.', to: 'broom' },
      { t: 'Vypadnout z baráku, dokud nevíš, co tam nahoře je.', to: 'city' }
    ];
  }

  N.supplies = {
    time: ['Den 1', '07:05'], mood: 'day', sfx: 'water',
    enter: function (s) { s.supplies = true; },
    text: [
      'Vana se plní, k tomu všechny hrnce, PET lahve, kýbl. Odhadem 250 litrů. Powerbanky v zásuvkách, notebook, čelovka. V lednici jídlo na čtyři dny, v mrazáku na další tejden, pokud vydrží proud.',
      'Děláš si v hlavě odpočet. Elektrárny bez obsluhy vydrží hodiny, možná pár dní. Vodárna o něco dýl. Mobilní síť pojede na záložní baterky tak den po výpadku.',
      'Takže máš okno. Krátký.',
      'Zavíráš vodu ve vaně. A v tom tichu, co nastane, slyšíš, že voda teče dál.',
      'Ne u tebe. O patro výš. Někdo nad tebou právě pustil kohoutek.',
      'Teče asi deset vteřin. Pak přestane. Žádný kroky. Nic. Soused nahoře je starší chlap, co žije sám. Jeho auto stojí před barákem.'
    ],
    choices: waterChoices()
  };

  N.water = {
    time: ['Den 1', '07:15'], mood: 'dread', sfx: 'water',
    text: [
      'O patro výš teče voda. Deset vteřin. Pak přestane.',
      'Žádný kroky. Nic. Soused nahoře je starší chlap, co žije sám. Jeho auto stojí před barákem.'
    ],
    choices: waterChoices()
  };

  N.door = {
    time: ['Den 1', '06:58'], mood: 'dread',
    enter: function (s) { s.sawLock = true; },
    text: [
      'Zámek není poškozenej. Klíč trčí zevnitř. Někdo odemkl z bytu, ne z chodby.',
      'Procházíš pokoje. Nic nechybí. Peněženka, notebook, klíče od auta, všechno na místě.',
      'Jedna věc přibyla. Nebo spíš ubyla. Na pracovním stole leží tvůj poznámkovej blok. Byl skoro novej. Teď je znatelně tenčí.'
    ],
    choices: [{ t: 'Vzít ten blok do ruky.', to: 'block' }]
  };

  N.block = {
    time: function (s) { return ['Den 1', s.noteSeen ? '10:52' : '07:05']; }, mood: 'dread', sfx: 'scrape',
    enter: function (s) { s.knowsLoop = true; },
    text: function (s, P) {
      var t = [];
      if (s.noteSeen) {
        t.push('Píšeš tu samou větu vedle. *Nechoď nahoru.* Stejný. Ne podobný, stejný. Sklon, tlak, i to, jak ti u „h“ ujíždí oblouček.');
        t.push('Přiložíš lístek ke hřbetu bloku na stole. Roztrženej okraj sedí přesně.');
      }
      t.push('Počítáš útržky ve hřbetu. Chybí ' + tallyM(s, P) + ' stránek. Nepamatuješ si, že bys napsal jedinou.');
      t.push('Vezmeš tužku a jemně vystínuješ horní čistej list. Vylezou bílý rýhy. Tvoje písmo:');
      t.push('~ Pokus ' + tallyM(s, P) + '. Nahoře to vypadá jako on. Mluví to jeho hlasem. Ve 12 jsem mu uvěřil. Voda ve vaně vydrží, tu nech. Tentokrát NEVYPÍNEJ TELEFON, potřebuješ čas na');
      t.push('Tam to končí. Zbytek byl na další stránce, a ta je pryč.');
      t.push('Takže nejsi tu poprvý. Něco se opakuje a ty si to nepamatuješ.');
      if (s.phoneOff) t.push('Telefon jsi vypnul před třema hodinama.');
      return t;
    },
    choices: [
      { t: 'Dál.', to: function (s) { return s.noteSeen ? 'p_home' : 'water'; }, do: function (s) { if (s.noteSeen) act('block')(s); else s.done.block = true; } }
    ]
  };

  N.pc1 = {
    time: ['Den 1', '07:20'], mood: 'dread',
    enter: function (s) { s.sawCams = true; },
    text: [
      'Internet jede. Webkamery z celýho světa běží. Tokio, New York, Praha. Všude prázdný ulice, rozsvícený světla, stojící auta. V Tokiu je odpoledne a nikde ani noha.',
      'Zmizeli všichni ve stejnej okamžik. Na záznamu z nádraží je to vidět: jeden snímek lidi, další snímek nic. Žádnej záblesk, žádnej zvuk. Zvířata zůstala. Na Václaváku holubi.',
      'Pustíš si ten záznam zpomaleně. Snímek po snímku.',
      'Na tom posledním, kde ještě lidi jsou, se všichni dívaj stejným směrem. Šikmo, mimo záběr. Všichni. I dítě v kočárku.'
    ],
    choices: [{ t: 'Dál.', to: 'msg' }]
  };

  N.listen = {
    time: ['Den 1', '07:20'], mood: 'dread',
    text: [
      'Po špičkách do čtvrtýho patra, v ruce kladivo. Jeho dveře jsou pootevřený na šířku dlaně. Jde z nich teplo.',
      'Přiložíš ucho k zárubni. Někdo uvnitř stojí. Slyšíš, jak dýchá. Pomalu, pravidelně, a mezi nádechama šeptá.',
      'Šeptá čísla. Pak ti dojde, že to nejsou čísla. Počítá tvoje kroky na schodech, zpětně, jeden po druhým. U posledního se zastaví.',
      '! „No tak pojď. Už jsi skoro tady.“',
      'Pod dveřma je světlo. Je tam jasněji než na chodbě u okna.'
    ],
    choices: [
      { t: 'Strčit do dveří.', to: 'end_up' },
      { t: 'Couvat. Dolů. Zamknout.', to: 'lock' }
    ]
  };

  N.broom = {
    time: ['Den 1', '07:18'], mood: 'dread', sfx: 'knock',
    text: [
      'Třikrát udeříš násadou do stropu.',
      'Ticho. Pak tři údery zpátky. Přesně nad tebou. Ať uděláš krok kamkoliv, další tři údery přijdou přesně nad tvou hlavou.',
      'A pak tlumeně, skrz beton:',
      '! „Tak pojď nahoru, když už víš, že jsem doma.“'
    ],
    choices: [{ t: 'Zamknout se. Hned.', to: 'lock' }]
  };

  N.lock = {
    time: ['Den 1', '07:25'], mood: 'dread',
    text: function (s) {
      var t = ['Zamykáš na dva západy, řetízek. Nahoře je ticho.'];
      if (!s.sawCams) {
        t.push('Otevřeš notebook. Webkamery z celýho světa běží, všude prázdno. Na záznamu z nádraží: jeden snímek lidi, další nic. Na tom posledním se všichni dívaj stejným směrem, mimo záběr. I dítě v kočárku.');
      } else {
        t.push('Teď víš, že nad tebou něco je. A ono možná ví, že ty jsi tady.');
      }
      return t;
    },
    enter: function (s) { s.sawCams = true; },
    choices: [{ t: 'Dál.', to: 'msg' }]
  };

  N.msg = {
    time: ['Den 1', '07:31'], mood: 'dread', sfx: 'buzz',
    text: [
      'Zavibruje ti telefon. Zpráva z neznámýho čísla. Bez předvolby, jen čtyři číslice: 0314.',
      '> Proč jsi nešel nahoru?',
      'Nahoře teče voda.'
    ],
    choices: [
      { t: 'Odepsat: „Kdo jsi?“', to: 'chat1' },
      { t: 'Neodpovídat. Vypnout telefon, vytáhnout SIM.', to: 'tv' },
      { t: 'Jít nahoru. Tohle už není prasklý potrubí.', to: 'end_up' },
      { t: 'Zavolat na to číslo zpátky.', to: 'call' },
      { t: 'Sbalit batoh a zmizet oknem, ať tě ze schodiště není vidět.', to: 'city' }
    ]
  };

  N.chat1 = {
    time: ['Den 1', '07:34'], mood: 'dread', sfx: 'buzz',
    text: [
      'Odpověď přijde dřív, než pustíš tlačítko.',
      '> Ten, na koho se všichni podívali. Ty jediný ne.',
      '> Pojď nahoru. Nic ti neudělám. Ani nemůžu.',
      'Píšeš, kde jsou všichni. Tři tečky. Dlouho.',
      '> Zeptej se mě zítra. Jestli si to budeš pamatovat.',
      'Z chodby se ozve tichý cvaknutí. Někdo zvenku zkusil kliku. Jednou, zlehka. Řetízek drží.'
    ],
    choices: [{ t: 'Dál.', to: 'knock' }]
  };

  N.tv = {
    time: ['Den 1', '07:58'], mood: 'dread',
    enter: function (s) { s.phoneOff = true; },
    text: [
      'Telefon vypnutej, SIM venku, wifi na routeru taky. Přišel jsi o mapy, kamery a jediný okno do světa.',
      'Dvacet minut ticho. Pak se v obýváku sama zapne televize. Černá obrazovka, bílej text:',
      '> TO NEBYLO HEZKÝ.',
      'Vytrhneš ji ze zásuvky. Zabliká displej na mikrovlnce. Místo hodin tam svítí 03:14. Na troubě taky. Na budíku v ložnici taky.',
      'Takže to nejde přes mobilní síť. Jde to přes cokoliv, co má displej.',
      'Z chodby se ozve tichý cvaknutí. Někdo zvenku zkusil kliku. Jednou, zlehka. Řetízek drží.'
    ],
    choices: [{ t: 'Dál.', to: 'knock' }]
  };

  N.call = {
    time: ['Den 1', '07:35'], mood: 'dread',
    text: [
      'Vyzvání to jednou. Někdo to zvedne.',
      'Slyšíš tekoucí vodu. A dech. Tvůj vlastní, o půl vteřiny zpožděnej. Když zadržíš dech, zadrží ho i telefon.',
      'Pak z reproduktoru i ze stropu zároveň:',
      '! „Slyšíš, jak jsi blízko?“',
      'Típneš to. Z chodby se ozve tichý cvaknutí. Někdo zvenku zkusil kliku. Řetízek drží.'
    ],
    choices: [{ t: 'Dál.', to: 'knock' }]
  };

  N.knock = {
    time: ['Den 1', '08:02'], mood: 'dread', sfx: 'click',
    text: [
      'Stojíš v chodbě a díváš se na vlastní dveře. Klika se už nehýbe.',
      'Zatím ti to nic neudělalo. Jen se ptá. Skoro jako by chtělo, abys šel nahoru sám, dobrovolně.'
    ],
    choices: [
      { t: 'Podívat se kukátkem.', to: 'peephole' },
      { t: 'Shodit hlavní jistič. Ať to nemá čím mluvit.', to: 'breaker' },
      { t: 'Promluvit přes dveře: „Co chceš?“', to: 'speak' },
      { t: 'Batoh, voda, čelovka a ven oknem, dokud to stojí u dveří.', to: 'city' },
      { t: 'Nedělat nic. Sednout si zády ke zdi, s nožem v ruce, a čekat.', to: 'wait' }
    ]
  };

  function noteText() {
    return [
      'Pod dveřma se pomalu zasouvá přeloženej list. Je to stránka vytržená z bloku. Propiskou, ve spěchu:',
      '~ Nechoď nahoru. Ať ti napíše cokoliv. Displejům nevěř, klice jo. Jsem ve sklepě, kóje 7. Přijď za světla. Klepej třikrát.',
      'Čteš to podruhý a zvedá se ti žaludek. Je to tvoje písmo. Tvoje „ř“, tvůj způsob, jak píšeš sedmičku s čárkou.',
      'Za dveřma se vzdalujou kroky. Dolů po schodech.'
    ];
  }

  N.peephole = {
    time: ['Den 1', '08:04'], mood: 'dread',
    enter: function (s) { s.sawHand = true; s.noteSeen = true; },
    text: function () {
      return [
        'Přiložíš oko ke kukátku.',
        'Na chodbě stojí soused ze čtvrtýho. Zády k tobě, v županu. Něco drží v ruce. Stojí úplně nehybně a hlavu má zvrácenou dozadu. Dívá se do stropu.',
        'Pak se shýbne. Hlavu přitom nesklopí. Shýbá se poslepu, obličejem pořád nahoru.'
      ].concat(noteText(), ['Kukátkem vidíš, jak schází dolů. Celou cestu se dívá do stropu.']);
    },
    choices: noteChoices()
  };
  N.breaker = {
    time: ['Den 1', '08:10'], mood: 'dread',
    enter: function (s) { s.noteSeen = true; },
    text: function () {
      return ['Cvak. Lednice ztichne, displeje zhasnou. Byt je mrtvej. Mrazák ti začíná odtávat.', 'V tom tichu zašustí papír.'].concat(noteText());
    },
    choices: noteChoices()
  };
  N.speak = {
    time: ['Den 1', '08:05'], mood: 'dread',
    enter: function (s) { s.noteSeen = true; },
    text: function () {
      return ['„Co chceš?“', 'Dlouho nic. Pak šepot, těsně u dveří. Tvůj vlastní hlas:', '! „Nemluv nahlas. Slyší to.“'].concat(noteText());
    },
    choices: noteChoices()
  };
  N.wait = {
    time: ['Den 1', '10:40'], mood: 'dread',
    enter: function (s) { s.noteSeen = true; s.waited = true; },
    text: function () {
      return [
        'Hodina. Dvě. Nohy ti dřevění. Ale něco ses dozvěděl: ať je to cokoliv, dovnitř to samo nejde. Řetízek by to nezastavil. Buď nemůže, nebo nechce.',
        'V 10:40 zhasnou displeje. Všechny naráz. Lednička ztichne. Proud je pryč. Dřív, než jsi počítal.'
      ].concat(noteText());
    },
    choices: noteChoices()
  };

  function noteChoices() {
    return [
      { t: 'Vyrazit ze dveří a dohnat to na schodech.', to: 'chase' },
      { t: 'Počkat půl hodiny a jít do sklepa. Kóje 7, třikrát zaklepat.', to: 'cellar', do: act('cellar') },
      { t: 'Nevěřit ničemu. Sbalit se a zmizet z baráku.', to: 'city' },
      { t: 'Porovnat to písmo. A zjistit, jestli ten papír není z tvýho bloku.', to: 'block', if: function (s) { return !s.done.block; } },
      { t: 'Jít nahoru. Když ti dvě různý věci říkaj opak, chceš vidět, kterou to nasere.', to: 'end_up' },
      { t: 'Zůstat doma a rozmyslet si to.', to: 'hub' }
    ];
  }

  N.chase = {
    time: ['Den 1', '10:45'], mood: 'dread',
    enter: function (s) { s.sawHand = true; },
    text: [
      'Odhodíš řetízek a bereš schody po třech. Doženeš ho v mezipatře.',
      'Je to soused ze čtvrtýho. Zastaví se. Neotočí hlavu, tu má zvrácenou ke stropu. Otočí se celej, jako figurína na podstavci.',
      'Oči má obrácený nahoru tak, že je vidět jen bělmo.',
      '! „Tak přece jdeš.“',
      'Vezme tě za zápěstí. Ruku má teplou a suchou a vůbec netlačí. Jen drží a čeká. Schody nahoru jsou hned za ním.'
    ],
    choices: [
      { t: 'Nechat se vést.', to: 'end_up' },
      { t: 'Vytrhnout se a letět zpátky do bytu.', to: 'hub', do: function (s) { s.actions++; } }
    ]
  };

  N.search = {
    time: function (s) { return ['Den ' + s.day, s.day === 1 ? '12:34' : '09:10']; }, mood: 'dread',
    enter: function (s) { s.found = true; },
    text: function (s, P) {
      return [
        'Hledáš tam, kam by ses schoval ty sám před sebou.',
        '**Za zrcadlem v koupelně:** čárky vyrytý do omítky. ' + tallyM(s, P) + '. Poslední je čerstvá, prach pod ní ještě leží na umyvadle.',
        '**V mrazáku pod hráškem,** v sáčku:',
        '~ Reset je ve 03:14. Zůstane jen to, co je psaný rukou, a to, co je vyrytý. Všechno ostatní se vrátí. I ty.',
        '**V botě na dně skříně:**',
        '~ Všichni se podívali. Ty jsi spal. Ono to ví a chce to dokončit. Stačí mu, aby ses podíval. Dobrovolně.',
        '**Pod matrací,** přilepený izolepou:',
        '~ Do sklepa nechoď. Ten v kóji 7 nejsem já. Pokus 9.',
        'Lístek zpod matrace je taky tvoje písmo. Skoro. Sedmička v „kóji 7“ nemá čárku. Ty ji píšeš s čárkou vždycky, od základky.',
        s.noteSeen ? 'Na vzkazu zpod dveří čárku má. Takže jeden z těch dvou je podvrh.' : 'Proč bys najednou psal sedmičku jinak?'
      ];
    },
    choices: [{ t: 'Dál.', to: 'p_home' }]
  };

  N.carve1 = {
    time: ['Den 1', '13:48'], mood: 'dread', sfx: 'scrape',
    enter: function (s) { s.carved1 = true; s.sevenBurned = true; s.knowsSeven = true; },
    text: function (s, P) {
      return [
        'Sundáš zrcadlo v koupelně. Rytí nožem do omítky jde pomalu, na každý písmeno pár tahů.',
        '# ' + (tallyM(s, P) + 1) + '. NAHORU NE. SOUSED = ONO. DOVNITŘ SAMO NEJDE. DVA VZKAZY, 7 S ČÁRKOU A BEZ',
        'Když dopisuješ, sjede ti nůž níž. Omítka je tam jiná. Hladší, světlejší. Někdo ji přetřel. Seškrábneš kousek. Pod nátěrem jsou starší rýhy, tvoje ruka:',
        '# OD POKUSU 8 PÍŠU 7 BEZ ČÁRKY. SCHVÁLNĚ. ONO TO NEVÍ.',
        'Chvíli na to jen zíráš. Takže vzkaz bez čárky je pravej. A ten dnešní zpod dveří, s poctivou čárkou, psal někdo, kdo tě zná až moc dobře, ale o pár pokusů pozadu.',
        'A ještě jedna věc se ti nelíbí: kdo to zatřel? Ty bys vlastní vzkaz nepřemalovával.'
      ];
    },
    choices: [{ t: 'Dál.', to: 'p_home' }]
  };

  N.scrape = {
    time: function (s) { return ['Den ' + s.day, s.day === 1 ? '14:40' : '11:10']; }, mood: 'dread', sfx: 'scrape',
    enter: function (s) { s.sawLock = true; },
    text: [
      'Škrábeš dál, celou plochu pod zrcadlem. Barva jde dolů v plátech. Pod ní vrstvy rýh přes sebe, některý zatřený několikrát.',
      '# VE 03:14 NESPI. POD POSTEL, OBLIČEJ DO ZEMĚ.',
      '# ZRCADLO NE. ZKUSIL JSEM. NE.',
      '# NEVÍM, KDO ZATÍRÁ. DVEŘE JSOU RÁNO ODEMČENÝ ZEVNITŘ.',
      'To poslední je vyrytý tak hluboko, že nůž projel až na cihlu.'
    ],
    choices: [{ t: 'Dál.', to: 'p_home' }]
  };

  N.testNeighbor = {
    time: function (s) { return ['Den ' + s.day, '12:50']; }, mood: 'dread',
    text: [
      'Zakřičíš ke stropu: „Jak se jmenoval váš pes?“',
      '! „Bárt. Umřel předloni v březnu, vždyť jste mi ho pomáhal nést do auta.“',
      'To sedí. Zkusíš druhou. Co ti řekl, když ses nastěhoval. Odpoví slovo od slova.',
      'Pak si uvědomíš, že třetí otázku jsi nahlas neřekl. Jen sis ji pomyslel. A shora už jde odpověď.',
      '! „Sedmnáct. Bylo ti sedmnáct. A nikomu jsi to neřekl.“',
      'Soused by tohle vědět nemohl. Tohle víš jen ty.'
    ],
    choices: [{ t: 'Přestat mluvit. Přestat myslet nahlas.', to: 'p_home' }]
  };

  N.phoneOn = {
    time: ['Den 1', '13:00'], mood: 'dread', sfx: 'buzz',
    enter: function (s) { s.phoneOff = false; s.lostTime = true; },
    text: [
      'SIM zpátky, zapnout. Signál pořád plnej. Jedna nová zpráva.',
      '> Vítej zpátky. Nezlobím se.',
      'Pustíš si kamery, co ještě běžej. Na posledním snímku před 03:14 se všichni na světě dívaj stejným směrem. Na to, abys spočítal kam, už ti dneska nezbyde čas.'
    ],
    choices: [{ t: 'Dál.', to: 'p_pc' }]
  };

  // ---------- sklep ve dne ----------
  N.cellar = {
    time: function (s) { return ['Den ' + s.day, s.day === 1 ? '11:30' : '07:30']; }, mood: 'cellar',
    enter: function (s) { s.knowsFourth = true; if (s.metNight) s.verified = true; },
    text: function (s, P) {
      var c = tallyC(s, P), t = [];
      t.push('Čelovka, nůž, dolů po schodech. Ve dne je sklep jen sklep. Zatuchlina, kola, lyže po sousedech.');
      if (!s.metNight) {
        t.push('Kóje 7. Třikrát zaklepeš. Nic. Není zamčeno.');
        t.push('Uvnitř deka, ohořelá svíčka, propiska. Nikdo. Ale někdo tu bydlí. A stěny.');
      } else {
        t.push('Kóje 7. Deka, svíčka. Všechno, jak jsi to viděl jeho očima.');
      }
      t.push('Od podlahy po strop vyrytý čárky, po pěti, přeškrtnutý. Tři bloky oddělený tlustou rýhou. První: 212. Pod ním vyryto ŠEL NAHORU. Druhej: 187. ŠEL NAHORU. Třetí: ' + c + ', poslední čerstvá.');
      t.push((399 + c) + ' dní.' + (s.metNight ? ' V tomhle nelhal.' : ' Jestli jsou to dny, tak tohle trvá přes rok.'));
      t.push('U podlahy za dekou je omítka rozrytá jinak. Text, přes něj škrábance, někdo se ho snažil zničit a pak toho nechal:');
      t.push('# 4: KDYŽ MĚ PUSTÍ K VOLANTU DŘÍV, NEMUSÍM HO VRACET. DEN BY BYL MŮJ. ON BY BYL TEN, CO MÁ TŘI HODINY.');
      t.push('A pod tím, pořád dokola, různě hluboko, jak v různý dny:');
      t.push('# NEUDĚLÁM TO. NEUDĚLÁM TO. NEUDĚLÁM TO.');
      if (s.metNight) {
        t.push('Počítáš i tyhle. ' + (s.fortyTwo ? 'Dvaačtyřicetkrát' : 'Jedenačtyřicetkrát') + '. Poslední je vyrytý ' + (s.fortyTwo ? 'nejhloubějc ze všech.' : 'nejmělčeji ze všech.'));
        t.push('Třetí cesta vyžaduje, abys mu předal řízení. Čtvrtá, ta, co ti zamlčel, je přesně ten samej krok. Rozdíl je jen v tom, co udělá potom.');
      } else {
        t.push('Nerozumíš z toho ani slovu. Kdo koho kam pouští? Je to tvoje písmo. A sedmička na dveřích kóje je bez čárky.');
        t.push('Celou dobu máš pocit, že ti někdo čte přes rameno.');
      }
      return t;
    },
    choices: [{ t: 'Zpátky na schody.', to: 'p_house' }]
  };

  // ---------- město / útěk ----------
  N.city = {
    time: function (s) { return ['Den ' + s.day, '13:00']; }, mood: 'day',
    enter: function (s) { s.animals = true; },
    text: function (s) {
      var t = [
        'Auto na křižovatce má klíček v zapalování. Projíždíš město krokem. Semafory přepínaj pro nikoho. Před pekárnou stojí fronta kabelek a tašek na zemi.',
        'Ve výlohách elektra svítí všechny televize. Na každý to samý: 03:14.',
        'Před řeznictvím sedí v řadě šest psů a čekaj. Ve 13:20 uvnitř něco cvakne, dveře chladicího boxu povolej a psi vejdou jeden za druhým. Bez rvačky. Jako by to dělali každej den.',
        'Jedeš dál, ven z města. Pole, dálnice plná stojících aut s otevřenejma dveřma. Nikde nikdo. Sto kilometrů a pořád nic.'
      ];
      if (s.day > 1) t.push('Telefon na sedadle spolujezdce zavibruje. Nečteš to.');
      t.push('Slunce jde dolů. Musíš se rozhodnout, kde budeš, až bude tma.');
      return t;
    },
    choices: [
      { t: 'Otočit to a vrátit se domů, než se setmí.', to: 'evening', do: function (s) { s.actions = 9; } },
      { t: 'Přespat v autě na odpočívadle. Sklopit sedačku, zamknout se.', to: 'end_sky' },
      { t: 'Najít penzion. Pokoj v přízemí, nad tebou ještě patro.', to: 'evening', do: function (s) { s.actions = 9; s.away = true; } }
    ]
  };

  // =====================================================================
  //  VEČER A NOC
  // =====================================================================
  N.evening = {
    time: function (s) { return ['Den ' + s.day, s.day === 1 ? '22:05' : '21:30']; }, mood: 'night',
    sfx: function (s) { return s.day === 1 && !s.away ? 'knock' : null; },
    text: function (s) {
      var t = [];
      if (s.away) {
        t.push('Penzion u silnice, recepce prázdná, klíče visej na háčcích. Bereš jedničku v přízemí. Zamkneš, zatáhneš, židli pod kliku.');
        t.push('Venku je tma, jakou jsi v životě neviděl. A hvězdy jsou špatně. Ne jinde, jen jich je nějak víc.');
        if (s.day === 1) {
          t.push('Ve 22:05 se sama zapne televize na zdi.');
          t.push('> Ve 03:14 nesmíš být vzhůru. Tehdy jsi to přežil, protože jsi spal.');
        }
      } else if (s.day === 1) {
        t.push('Skříň před dveře, matrace na okno v ložnici, deky přes ostatní. Svíčky, čelovka, nůž.');
        t.push('Stmívá se v 16:20. Město venku je černý. Žádný lampy, žádný okna. A hvězdy jsou špatně. Ne jinde, jen jich je nějak víc.');
        t.push('Ve 22:05 tři zaklepání na dveře. Pak tvůj vlastní hlas, unaveně:');
        t.push('! „Nepřišel jsi. Chápu. Tak aspoň tohle: ve 03:14 nesmíš být vzhůru. Tehdy jsi to přežil, protože jsi spal.“');
        t.push('Kroky dolů. Ticho.');
      } else {
        t.push('Večer. Zamčeno, zataženo. Ve 12:34 volal soused, na minutu jako vždycky. Město venku je černý a hvězd je víc, než by mělo.');
        if (s.trapSet) t.push('Inkoust na klice, na rámu zrcadla a na plechovce s barvou zasychá.');
        if (s.lied) t.push('> Dnes v noci tedy. Těším se.');
        if (s.knowsWays) t.push('Víš, kde máš stát ve 03:10, kdyby ses rozhodl.');
      }
      if (s.done.diary) t.push('Ty hvězdy navíc. Teď víš, co jsou zač. Každá z nich je něčí čtvrtý patro.');
      if (s.hasDog && !s.away) t.push('Kulich zalezl pod postel už za šera. Leží tam s čumákem mezi tlapama a nejde vytáhnout.');
      t.push('Do 03:14 zbejvá pár hodin.');
      return t;
    },
    choices: [
      { t: 'Poslechnout. Prášek na spaní, špunty do uší a spát.', to: 'end_amnesia', if: function (s) { return s.day === 1; } },
      { t: 'Zkusit to prostě zaspat.', to: 'end_amnesia', if: function (s) { return s.day > 1; } },
      { t: 'Zůstat vzhůru a počkat si na to.', to: function (s) { return s.nights === 0 ? 'n0314' : 'night'; } },
      { t: 'Přivázat se řetězem od kola k topení. Klíč vyhodit z okna.', to: 'night', do: function (s) { s.chain = true; }, if: function (s) { return s.knowsSelf && !s.away && !s.metNight; } },
      { t: 'Třetí cesta. Šátek přes oči, ve 03:10 na schodech pod čtvrtým patrem.', to: 'stairs', if: function (s) { return s.knowsWays && !s.away; } }
    ]
  };

  N.n0314 = {
    time: function (s) { return ['Den ' + s.day, '03:13']; }, mood: 'event', bleach: 1,
    text: function (s) {
      var t = [
        'Zkoušíš neusnout. Jde to samo.',
        '= 03:09',
        s.away ? 'V pokoji nad tebou začnou kroky. V penzionu, kde nikdo není. Pomalu, od okna ke dveřím, pořád dokola.' : 'Nahoře u souseda začnou kroky. Pomalu, od okna ke dveřím, pořád dokola.',
        '= 03:12',
        'Kroky přestanou. Všechno přestane. I tvoje hodinky. Sekundovka stojí.',
        '= 03:13',
        'Přes závěsy začne prosvítat světlo. Shora. Bledý, bez stínů. A s ním přijde pocit, kterej není tvůj: klid, obrovskej, teplej. Jistota, že stačí zvednout hlavu a všechno se vysvětlí. Že tam nahoře jsou všichni. Že na tebe čekaj.',
        'Strop nad tebou tiše praská. Jako by už nebyl úplně pevnej.',
        'Brada se ti zvedá sama. Máš vteřiny.'
      ];
      if (s.hasDog && !s.away) t.splice(t.length - 1, 0, 'Pod postelí se ozve tichý zakňučení. Kulich tam leží celou dobu. Oči má zavřený.');
      return t;
    },
    choices: [
      { t: 'Na břicho pod postel, obličej do podlahy, oči zavřený, ruce přes hlavu.', to: 'survive1' },
      { t: 'Nedívat se nahoru, ale do zrcadla. Vidět to aspoň v odrazu.', to: 'end_mirror' },
      { t: 'Poslepu čmárat na papír všechno, co cítíš a slyšíš. Pro příště.', to: 'end_blind' },
      { t: 'Zařvat: „Kde jsou?!“ Když to chce tvůj souhlas, ať nejdřív odpoví.', to: 'shout' },
      { t: 'Podívat se.', to: 'end_look' }
    ]
  };

  N.shout = {
    time: function (s) { return ['Den ' + s.day, '03:14']; }, mood: 'event', bleach: 2,
    text: [
      '„Kde jsou?!“',
      'Světlo se zachvěje. Odpověď přijde ze všech stran, bez dechu:',
      '! „Tady. Všichni. Podívej se a uvidíš je.“',
      'A pak jeden hlas z těch, který znáš nejlíp na světě. Blízko. Vystrašenej. Řekne tvoje jméno a zeptá se, proč nejdeš.',
      'Krk se ti napíná jako lano.'
    ],
    choices: [
      { t: 'Podívat se.', to: 'end_look' },
      { t: 'Vrhnout se na zem pod postel a zakousnout se do rukávu.', to: 'survive1' }
    ]
  };

  N.survive1 = {
    time: function (s) { return ['Den ' + s.day, '03:14']; }, mood: 'event', bleach: 2,
    text: [
      'Čelo na lino, oči zavřený, dlaně přes zátylek.',
      'Světlo zesílí tak, že ho vidíš i přes víčka. Strop přestane praskat. Má to horší zvuk: žádnej. Jako by tam už nebyl.',
      'Pak hlasy. Stovky, tisíce, šeptem, všechny naráz. Některý znáš. Neříkaj nic zlýho. Jen tvoje jméno, laskavě, trpělivě.',
      'Něco sestoupí do pokoje. Neslyšíš kroky, ale lino se vedle postele prohne. Stojí to tam. Cítíš to na kůži jako teplo z kamen.',
      'Trvá to minutu. Možná hodinu. Pak hlas, jeden jedinej, těsně u ucha, bez dechu:',
      '! „Tolikrát jsi to prospal. Tohle je poprvý, co ses rozhodl.“',
      'Světlo zhasne.'
    ],
    choices: [{ t: 'Tma.', to: 'after' }]
  };

  N.night = {
    time: function (s) { return ['Den ' + s.day, '03:13']; }, mood: 'event', bleach: 1,
    text: function (s) {
      var t = [];
      if (s.chain) t.push('Řetěz kolem kotníku a kolem trubky topení, klíč letí z okna do tmy. Na předloktí si propiskou napíšeš: NEVSTÁVEJ.');
      t.push('= 03:12');
      t.push('Kroky nahoře přestanou. Hodinky se zastaví.');
      t.push('= 03:13');
      t.push('Světlo shora, bledý, bez stínů. Ten cizí klid. Strop tiše praská. Brada se ti zvedá sama.');
      if (s.hasDog && !s.away) t.push('Kulich je pod postelí už od večera.');
      if (s.nights >= 1) t.push('Jde to o chlup líp, když víš, co čekat. Ale jen o chlup.');
      return t;
    },
    choices: [
      { t: 'Obličej do podlahy. Zavřít oči. Vydržet.', to: 'survive' },
      { t: 'Zkusit se podívat aspoň do zrcadla.', to: 'end_mirror' },
      { t: 'Dneska se podívat.', to: 'end_look' }
    ]
  };

  N.survive = {
    time: function (s) { return ['Den ' + s.day, '03:14']; }, mood: 'event', bleach: 2,
    text: function (s) {
      var t = ['Světlo, hlasy, teplo vedle postele. Lino se prohne. Zatneš zuby do rukávu.'];
      if (s.nights + 1 >= 3 && !s.metNight) t.push('! „Potřetí. Tak dobře. Dívej se.“');
      else if (s.trapSet) t.push('! „Chytrý. Ale nebude se ti to líbit.“');
      else if (s.lied) t.push('! „Lhal jsi mi. To já tobě nikdy.“');
      else t.push('Hlas u ucha dneska neřekne nic. To je horší než cokoliv předtím.');
      t.push('Světlo zhasne.');
      return t;
    },
    choices: [{ t: 'Tma.', to: 'after' }]
  };

  // přechod noc -> ráno
  N.after = {
    enter: function (s) {
      s.nights++; s.day++; s.actions = 0; s.today = {}; s.phoneOff = false; s.lostTime = false;
      if (s.away) { s.wasAway = true; s.away = false; }
      if (s.metNight) s.erosion++;
      if (s.trapSet) { s.trapSet = false; s.trapResult = true; s.knowsSelf = true; }
      if (s.chain) { s.chain = false; s.chainMorning = true; if (s.nights < 3) s.nights = 3; }
      if (s.lied) { s.lied = false; s.offerGone = true; s.liedCaught = true; }
    },
    redirect: function (s) {
      if (s.erosion >= 5) return 'end_fourth';
      if (s.nights >= 3) return 'passenger';
      return 'morning';
    }
  };

  // =====================================================================
  //  RÁNA A DNY 2+
  // =====================================================================
  N.morning = {
    time: function (s) { return ['Den ' + s.day, '06:47']; }, mood: 'day', sfx: 'buzz',
    text: function (s) {
      var t = [], o = offer(s);
      if (s.nights === 1) {
        t.push('Budí tě ticho. Jen lednička.');
        t.push('Lednička. Proud jde.');
        t.push((s.wasAway ? 'Ležíš ve svý posteli. Doma. Sto kilometrů od penzionu, kde jsi zavřel oči. Ta věc nebyla nad barákem. Byla nad tebou.' : 'Ležíš v posteli, ne pod ní. Skříň stojí na svým místě, deky jsou ve skříni.') + ' Na lince hrnek s kávou, kouří se z ní. Telefon zapnutej, poslední zprávy 03:14. Vchodový dveře odemčený.');
        t.push('Ale ty si pamatuješ všechno. Tolik pokusů se resetovalo i s hlavou. Tenhle ne.');
        t.push('> Pamatuješ si. To se nemělo stát. Promluvíme si?');
        t.push('A nahoře teče voda. O šestnáct minut dřív než včera.');
        if (s.hasDog) t.push('O dvě minuty pozdějc něco škrábe na dveře. Kulich. Reset ho vrátil na ulici a on si cestu pamatuje.');
        return t;
      }
      t.push('Lednička. Káva. Postel. Dveře odemčený.');
      if (s.chainMorning) { t.push('Řetěz je pryč, jako by nikdy nebyl. Nápis na předloktí zůstal. NEVSTÁVEJ. Někdo k němu propiskou připsal smajlíka.'); s.chainMorning = false; }
      if (s.trapResult) {
        t.push('Mouka by nevydržela. Inkoust vydržel.');
        t.push('Klika je rozmazaná, zevnitř. Někdo ji vzal a odemkl. Zevnitř ven. Rám zrcadla má otisky prstů, modrý šmouhy vedou po zdi k zatřenýmu místu. Barva je zase vlhká.');
        t.push('Jdeš po šmouhách zpátky. Komora. Chodba. Ložnice. Končej u postele.');
        t.push('Podíváš se na svoje ruce. Pravá dlaň je modrá. Za nehtama máš bílou barvu.');
        t.push('Nikdo sem neleze. Mezi 03:14 a 06:47 vstáváš ty. Zatíráš vlastní vzkazy, odemykáš dveře a jdeš si zase lehnout. A nic z toho nevíš.');
        t.push('> Říkal jsem to. Teď už se zeptáš?');
        s.trapResult = false;
      }
      if (s.justMet) {
        t.push('Pamatuješ si každý jeho slovo.');
        if (s.knowsWays && !s.knowsFourth) t.push('> Tři cesty. Řekl ti o třech. Zeptej se ho někdy, proč zamlčel čtvrtou.');
        else if (s.knowsWays) t.push('> Tři cesty. A o čtvrté, tu, cos četl ve sklepě, pomlčel. Zajímavé, ne?');
        else t.push('> Hezky jste si popovídali. Na to hlavní ses ho ale nezeptal: jak to končí.');
        s.heardTease = true; s.justMet = false;
      }
      if (s.liedCaught) { t.push('> Řekl jsi ano a neudělal jsi nic. Nabídka padá. Já ti nikdy nelhal.'); s.liedCaught = false; }
      if (o === 'reduced' && !s.today.offerMsg) t.push('> Půlnoc byla včera. Nabídka platí dál, ale bez proudu a vody. Jeden člověk a prázdný studený svět. Zítra to bude už jen ten svět.');
      if (o === 'bare' && !s.bareTold) { t.push('> Už jen ten svět. Nikoho ti nevrátím. Rozmysli si, kolik ještě chceš prohrát čekáním.'); s.bareTold = true; }
      if (s.erosion === 3) t.push('Ruce tě po ránu bolej víc než jindy. Jako bys celou noc do něčeho ryl. A tlačil čím dál míň.');
      if (s.erosion === 4) t.push('Na zrcadle v koupelně je prstem do páry napsáno: UŽ DLOUHO NE. Tvým písmem.');
      if (s.hasDog) t.push('V 06:49 škrábe na dveře Kulich. Jako každý ráno.');
      t.push('Nahoře teče voda.');
      return t;
    },
    choices: [{ t: 'Vstát.', to: 'hub' }]
  };

  // =====================================================================
  //  ROZCESTNÍK: přesuny mezi místy jsou zadarmo, každá pořádná věc stojí kus dne
  // =====================================================================
  var CLOCK1 = ['11:10', '12:40', '14:10'], CLOCKN = ['07:00', '10:30', '14:00'], BUDGET = 3;
  function hubTime(s) { var c = s.day === 1 ? CLOCK1 : CLOCKN; return ['Den ' + s.day, c[Math.min(s.actions, 2)]]; }
  function dusk(s) { return s.actions >= BUDGET ? 'evening' : null; }
  function left(s) {
    var n = BUDGET - s.actions;
    return n === 1 ? 'Stihneš ještě jednu věc, než se setmí.' : 'Než se setmí, stihneš ještě ' + (n === 3 ? 'tři' : 'dvě') + ' věci.';
  }
  function dayMood(s) { return s.day === 1 ? 'dread' : 'day'; }
  function online(s) { return !s.phoneOff; }

  N.hub = {
    time: hubTime, mood: dayMood, redirect: dusk,
    text: function (s) {
      var t = [];
      if (s.day === 1) {
        if (s.actions === 0) {
          t.push('Zamčeno, řetízek. Na stole leží lístek s tvým písmem.');
          if (s.sawHand) t.push('Pod dveře ti ho strčil soused ze čtvrtýho. Tvým písmem. Hlavou ke stropu.');
        } else if (s.actions === 1) {
          t.push('Je po poledni. V listopadu se stmívá po čtvrtý.');
          t.push('Shora se ozve hlas, tlumeně přes strop:');
          t.push('! „Haló, sousede? Jste tam dole? Prosím vás, pojďte mi pomoct. Já nevím, co se děje.“');
          t.push('Zní to přesně jako on.');
        } else {
          t.push('Venku se začíná šeřit. Hlas nahoře volal ještě dvakrát. Potřetí už neprosil. Jen řekl klidně: „Dobře. Mám čas.“');
        }
      } else {
        if (s.actions === 0) t.push('Máš zpátky celej den, proud a internet. A víš, co přijde v noci.');
        else if (s.actions === 1) t.push('Dopoledne je pryč. Ve 12:34 začne soused volat o pomoc, na minutu přesně.');
        else t.push('Odpoledne. Stíny se dloužej a hlas nahoře už neprosí. Čeká.');
        if (s.shaken) t.push('Pořád slyšíš ten hlas za dveřma.');
      }
      if (!s.hubSeen) { t.push('Rozhlížet se můžeš, jak dlouho chceš. Každá pořádná věc ti ale vezme kus dne.'); s.hubSeen = true; }
      t.push(left(s));
      return t;
    },
    choices: [
      { t: 'Byt. Zdi, skříně, zrcadlo, okno.', to: 'p_home' },
      { t: 'Telefon a notebook.', to: 'p_pc' },
      { t: 'Barák. Schránky, sousedi, sklep.', to: 'p_house' },
      { t: 'Ven na ulici.', to: 'p_street' },
      { t: 'Opevnit se v bytě a počkat na noc.', to: 'evening', if: function (s) { return s.day === 1; } },
      { t: 'Nedělat už nic a počkat na večer.', to: 'evening', if: function (s) { return s.day > 1; } }
    ]
  };

  // ---------- byt ----------
  N.p_home = {
    time: hubTime, mood: dayMood, redirect: dusk,
    text: function (s) {
      var t = [];
      if (s.day === 1) t.push('Tvůj byt. Všechno je na svým místě a nic není v pořádku. Káva na lince dávno vystydla.');
      else t.push(s.actions === 0 ? 'Tvůj byt. Z kávy na lince se kouří, jako každý ráno. Už ji ani nevyléváš.' : 'Tvůj byt. Káva na lince mezitím vystydla. Zejtra bude zase teplá.');
      if (s.hasDog) t.push('Kulich leží na prahu ložnice a nespouští z tebe oči.');
      t.push(left(s));
      return t;
    },
    choices: [
      { t: 'Porovnat písmo z lístku a prohlídnout blok na stole.', to: 'block', if: function (s) { return s.day === 1 && !s.done.block; } },
      { t: 'Prohledat byt. Jestli jsi tu nebyl poprvý, mohl sis nechat vzkazy.', to: 'search', do: act('search'), if: function (s) { return (s.knowsLoop || s.day > 1) && !s.done.search; } },
      { t: 'Vyrýt nožem do omítky za zrcadlo, co víš. Pro příště.', to: 'carve1', do: act('carve1'), if: function (s) { return s.day === 1 && s.knowsLoop && !s.done.carve1; } },
      { t: 'Zeď za zrcadlem. Vyrýt, co víš.', to: 'mirrorwall', do: act('mirrorwall'), if: function (s) { return s.day > 1 && !s.done.mirrorwall; } },
      { t: 'Doškrábat zbytek zatřený omítky za zrcadlem.', to: 'scrape', do: act('scrape'), if: function (s) { return (s.done.carve1 || s.done.mirrorwall) && !s.done.scrape; } },
      { t: 'Vyrýt to nejdůležitější zespodu do desky stolu. Tam se nikdo nedívá.', to: 'carveDesk', do: function (s) { s.actions++; s.today.desk = true; }, if: function (s) { return s.done.mirrorwall && !s.today.desk; } },
      { t: 'Zjistit, kdo ti každou noc odemyká dveře.', to: 'doorCheck', do: act('doorCheck'), if: function (s) { return s.day > 1 && !s.done.doorCheck && !s.knowsSelf; } },
      { t: 'Nastražit past na noční návštěvu.', to: 'trap', do: act('trap'), if: function (s) { return s.day > 1 && !s.done.trap && !s.knowsSelf && (s.done.doorCheck || s.sawWetPaint); } },
      { t: 'Odpovědět sousedovi přes strop. Zeptat se na něco, co ví jen on.', to: 'testNeighbor', do: act('test'), if: function (s) { return s.actions >= 1 && !s.done.test; } },
      { t: 'Podívat se z okna.', to: 'window' },
      { t: 'Jinam.', to: 'hub' }
    ]
  };

  N.window = {
    time: hubTime, mood: dayMood,
    text: function (s) {
      var t = ['Ulice pod tebou. Auto uprostřed křižovatky, dveře řidiče dokořán, motor pořád běží.'];
      if (!s.hasDog) t.push('Na chodníku leží vodítko. A kousek od něj, u vašeho vchodu, sedí pes. Střapatej voříšek. Nedívá se na ulici. Dívá se nahoru, přímo do tvýho okna. Když se pohneš, zavrtí ocasem.');
      t.push('Holubi sedí na všech střechách v ulici. Na tý vaší ani jeden.');
      if (s.nights >= 1) t.push('Přes křižovatku přeběhne liška. Včera přeběhla ve stejnou vteřinu. Zastaví se u stejný popelnice a čeká, až z ní spadne stejnej pytel.');
      else t.push('Přes křižovatku přeběhne liška. Jde najisto, jako po vlastní zahradě.');
      return t;
    },
    choices: [{ t: 'Odstoupit od okna.', to: 'p_home' }]
  };

  // ---------- telefon a notebook ----------
  N.p_pc = {
    time: hubTime, mood: dayMood, redirect: dusk,
    text: function (s) {
      var t = [];
      if (s.phoneOff) t.push('Telefon je vypnutej, SIM leží na stole, router taky. Notebook je bez internetu jen těžítko.');
      else {
        t.push('Notebook na stole, telefon vedle. Signál plnej, internet jede. Číslo 0314 je online. Je online pořád.');
        if (s.lostTime && !s.done.triang) t.push('Kamery by šly projít znova, ale spočítat z nich něco pořádnýho už dneska nestihneš.');
      }
      t.push(left(s));
      return t;
    },
    choices: [
      { t: 'Zapnout telefon a router zpátky.', to: 'phoneOn', do: act('phoneOn'), if: function (s) { return s.phoneOff; } },
      { t: 'Napsat číslu 0314.', to: 'chat', if: online },
      { t: 'Stáhnout záznamy z kamer a spočítat, kam se všichni dívali.', to: 'triang', do: act('triang'), if: function (s) { return online(s) && !s.done.triang && !s.lostTime; } },
      { t: 'Najít, co Hrubeš ze čtvrtýho psal na astronomický fórum.', to: 'forum', do: act('forum'), if: function (s) { return online(s) && s.done.mailbox && !s.done.forum; } },
      { t: 'Chtít po 0314 důkaz: ať ti toho jednoho vrátí na pět minut.', to: 'proofAsk', if: function (s) { var o = offer(s); return online(s) && (o === 'full' || o === 'reduced'); } },
      { t: 'Napsat 0314, že nabídku bereš. A v noci jít třetí cestou.', to: 'lie', do: act('lie'), if: function (s) { return online(s) && offer(s) !== 'none' && s.knowsWays && !s.lied; } },
      { t: 'Jinam.', to: 'hub' }
    ]
  };

  N.forum = {
    time: hubTime, mood: 'dread',
    enter: function (s) { s.knowsPoint = true; },
    text: [
      'Fórum astronomický společnosti. Uživatel hrubes_v, 4 812 příspěvků. Jeho poslední vlákno má přes tři sta odpovědí.',
      'První tejdny si z něj dělaj srandu. Na fotkách nic není, jen jeden přepálenej pixel, ať exponuje jakkoliv krátce. Pak se začnou ozejvat další. Hamburk. Osaka. Někdo z Chile. Všichni to viděj okem, nikdo to nevyfotí.',
      'Jenže každej to vidí jinde. V Brně nízko nad severovýchodem. V Hamburku na jihovýchodě. V Chile pod obzorem, píše ten člověk, a že ví, jak to zní.',
      'Hrubeš z těch hlášení počítá paralaxu. Jeho poslední příspěvek má čas 03:11.',
      '! „Vychází mi vzdálenost v metrech. Ne ve světelných letech, v metrech. Souřadnice: můj obývací pokoj. Výška: můj strop. Někde mám chybu. Jdu se podívat.“',
      'Pod tím jediná odpověď. 03:13, někdo z Osaky.',
      '! „I see it now. Everyone here is looking.“',
      'Hrubešův obývák je přesně nad tvou ložnicí.'
    ],
    choices: [{ t: 'Zaklapnout notebook.', to: 'p_pc' }]
  };

  // ---------- barák ----------
  N.p_house = {
    time: hubTime, mood: 'dread', redirect: dusk,
    text: function (s) {
      var t = ['Schodiště. V přízemí schránky a dveře do sklepa, v každým patře dvoje dveře. Některý jsou pootevřený.', 'Shora, ze čtvrtýho, se po schodech valí teplej vzduch. Jako z otevřený trouby.'];
      if (s.hasDog) t.push('Kulich jde s tebou až do třetího patra. Na první schod vejš nešlápne. Lehne si a kňučí.');
      t.push(left(s));
      return t;
    },
    choices: [
      { t: 'Schránky v přízemí.', to: 'mailbox', do: act('mailbox'), if: function (s) { return !s.done.mailbox; } },
      { t: 'Byt naproti přes chodbu. Dveře jsou pootevřený.', to: 'nextdoor', do: act('nextdoor'), if: function (s) { return !s.done.nextdoor; } },
      { t: 'Sklep. Kóje 7.', to: 'cellar', do: function (s) { s.actions++; s.done.cellar = true; if (s.metNight) s.done.cellar2 = true; }, if: function (s) { return s.metNight ? !s.done.cellar2 : !s.done.cellar; } },
      { t: 'Sklep, kóje 9. Podle seznamu patří Hrubešovi ze čtvrtýho.', to: 'diary', do: act('diary'), if: function (s) { return s.done.mailbox && !s.done.diary; } },
      { t: 'Vyrýt ve sklepě nabídku pro toho nočního. Ať se vyjádří.', to: 'carveOffer', do: act('carveOffer'), if: function (s) { return s.metNight && offer(s) !== 'none' && !s.done.carveOffer; } },
      { t: 'Vzít nabídku. Vyrýt nočnímu, ať se dokouká.', to: 'end_deal', if: function (s) { var o = offer(s); return o === 'full' || o === 'reduced'; } },
      { t: 'Druhá cesta. Vyrýt nočnímu, ať se dokouká a odejde celej.', to: 'end_alone', if: function (s) { var o = offer(s); return s.knowsWays && (o === 'none' || o === 'bare'); } },
      { t: 'Čtvrtý patro. Jít nahoru, teď, za světla.', to: 'end_up' },
      { t: 'Jinam.', to: 'hub' }
    ]
  };

  N.mailbox = {
    time: hubTime, mood: 'dread',
    text: [
      'Schránky v přízemí. Z tý tvojí trčej letáky.',
      'Schránka ze čtvrtýho patra má na štítku strojem: Ing. V. Hrubeš. Dvířka jsou nedovřený. Uvnitř výzva k vyzvednutí balíku z obchodu s optikou a obálka s razítkem astronomický společnosti.',
      'V obálce je zpravodaj. Jeden článek je zatrženej propiskou: „Hlášení neobvyklého objektu v zenitu. V. Hrubeš, člen od roku 1979.“',
      'Čteš to ve stoje. Před šesti tejdny si všiml slabýho bodu přímo nad hlavou. Není v žádným katalogu. Nehejbe se s oblohou, celou noc stojí na místě. Prosí kolegy o ověření a dodává, že podrobnosti píše na fórum společnosti.',
      'Na dveřích do sklepa visí seznam kójí. Hrubeš, 4. patro: kóje 9.',
      'Bod přímo nad hlavou. Nad jeho hlavou. To je i nad tvojí.'
    ],
    choices: [{ t: 'Vrátit zpravodaj do schránky.', to: 'p_house' }]
  };

  N.nextdoor = {
    time: hubTime, mood: 'dread',
    text: function (s) {
      var t = [
        'Byt naproti. Mladá rodina, znáte se od vidění. Na botníku klíče, v ložnici dvě rozházený peřiny.',
        'V dětským pokoji postýlka a nad ní chůvička s kamerou. Bliká na ní, že má plnou paměť. Přetočíš záznam na 03:13.',
        'Dítě spí na břiše, zadek nahoru. Ve 03:13:51 otevře oči. Nepláče. Postaví se, chytí se šprušlí a zvedne hlavu. Dívá se šikmo nahoru, do rohu stropu. Usměje se.',
        'Ve 03:14:00 je postýlka prázdná. Peřinka ještě chvíli klesá.',
        'Nikdo ho nevzbudil. Vzbudilo ho to. A ten roh stropu, kam se dívalo, je směrem k tvýmu bytu. O patro vejš.'
      ];
      if (s.found) t.push('Lístek v botě tvrdil, že jsi přežil, protože jsi spal. Tohle dítě spalo taky.');
      return t;
    },
    choices: [{ t: 'Vypnout chůvičku a odejít.', to: 'p_house' }]
  };

  N.diary = {
    time: hubTime, mood: 'cellar',
    text: [
      'Kóje 9 je zavřená jen na petlici. Uvnitř regály a krabice od banánů, v každý svázaný sešity. Deníky pozorování, rok po roce, od devětasedmdesátýho. Drobný technický písmo, tužkou.',
      'Poslední sešit leží nahoře. Letošní podzim.',
      '+ 1. 10. Nový bod v zenitu, asi 6 mag. V katalogu nic. Nehýbe se s oblohou.',
      '+ 9. 10. V dalekohledu slábne. Pouhým okem sílí. Jako by mu sklo vadilo.',
      '+ 20. 10. Zkouška, 14 nocí. Když se nedívám, je druhý den slabší. Když o něm napíšu a podívají se další, je jasnější. Roste z toho, že se na něj díváme.',
      '+ 2. 11. Kolem přibývají další, slabé. Napočítal jsem jich přes dvě stě. Žádný není v katalogu. Každý vypadá přesně jako ten můj před měsícem.',
      '+ 11. 11. Už ho vidí i lidé, kteří o něm nikdy neslyšeli. Už se nedá nedívat. Pořád myslím na jedno: světlo jde oběma směry. Kdo se dívá, je taky vidět.',
      'Zaklapneš sešit. Přes dvě stě bodů a každej jako ten jeho před měsícem. Každej z nich byl někdy něčí slabá hvězda přímo nad hlavou.'
    ],
    choices: [{ t: 'Vrátit sešit na regál.', to: 'p_house' }]
  };

  // ---------- ulice ----------
  N.p_street = {
    time: hubTime, mood: dayMood, redirect: dusk,
    text: function (s) {
      var t = ['Ulice. Ticho, jaký město neumí. Jen motor auta na křižovatce, kterej běží od čtvrt na čtyři ráno.'];
      t.push('Holubi sedí na všech střechách kromě tý vaší.');
      if (!s.hasDog) t.push('Na chodníku leží vodítko. Pes, co k němu patří, sedí u vchodu a dívá se na tebe, jako by čekal, až si vzpomeneš.');
      else t.push('Kulich ti jde u nohy. Na vodítku ne, to nepotřebuje.');
      t.push(left(s));
      return t;
    },
    choices: [
      { t: 'To vodítko. A ten pes u vchodu.', to: 'dog', do: act('dog'), if: function (s) { return !s.done.dog; } },
      { t: 'Auto na křižovatce. Na skle má kameru.', to: 'dashcam', do: act('dashcam'), if: function (s) { return !s.done.dashcam; } },
      { t: 'Postavit se přes ulici a podívat se na čtvrtý patro.', to: 'outside', do: act('outside'), if: function (s) { return !s.done.outside; } },
      { t: 'Sednout do auta a ujet. Zjistit, jestli tě to najde i jinde.', to: 'city' },
      { t: 'Zpátky do baráku.', to: 'hub' }
    ]
  };

  N.dog = {
    time: hubTime, mood: 'day',
    enter: function (s) { s.hasDog = true; s.animals = true; },
    text: [
      'Zvedneš vodítko. Je na něm karabina a kus přetrženýho obojku.',
      'Pes vyrazí dřív, než se narovnáš. Střapatej voříšek, jedno ucho dolů. Skáče ti do pasu, kňučí, olizuje ruce, točí se dokola. Tak se vítá někdo, kdo se vrátil po roce.',
      'Nikdy v životě jsi ho neviděl.',
      'Na známce má vyraženo: Kulich. Sedne si ti na botu a opře se o tebe celou vahou, jako by to dělal odjakživa.',
      'Pak tě vede. Ke vchodu, po schodech, rovnou ke tvejm dveřím ve třetím patře. Ví, který jsou tvoje. Na schody do čtvrtýho se podívá, stáhne ocas a zalehne.',
      'Zvířata tu zůstala. A tenhle tě zná. Odněkud, odkud si to ty nepamatuješ.'
    ],
    choices: [{ t: 'Pustit ho dovnitř.', to: 'hub' }]
  };

  N.dashcam = {
    time: hubTime, mood: 'dread',
    enter: function (s) { s.knowsPoint = true; },
    text: [
      'Auto na křižovatce. Nádrž skoro plná, v rádiu šum. Na čelním skle kamera, nahrává ve smyčce.',
      'Přetočíš na 03:13. Řidič jede prázdnou ulicí. Ve 03:13:52 sundá nohu z plynu. Auto dojede doprostřed křižovatky a zastaví. On otevře dveře a vystoupí. Nezhasne, nezabrzdí.',
      'Stojí před kapotou, zády ke kameře, a dívá se šikmo nahoru.',
      'Kamera zabírá to samý co on. Váš barák. Čtvrtý patro. Jedno okno je na záznamu přepálený do bíla, jako by z něj někdo svítil reflektorem přímo do objektivu. Jedinej bílej bod v celý tmavý ulici.',
      'Ve 03:14:00 před kapotou nikdo nestojí.',
      'To okno je přímo nad tvou ložnicí.'
    ],
    choices: [{ t: 'Vystoupit z auta.', to: 'p_street' }]
  };

  N.chat = {
    time: hubTime, mood: 'dread',
    text: function (s) {
      if (s.day === 1) return ['Píšeš. Otázku za otázkou. Tři tečky se objevěj a zase zmizej.', '> Zítra. Jestli si to budeš pamatovat.'];
      return ['Kurzor bliká v prázdným poli. Číslo 0314 je online. Je online pořád.', 'Na co se zeptáš?'];
    },
    choices: [
      { t: '„Kde jsou všichni?“', to: 'chat_where', if: function (s) { return s.day > 1 && !s.q.where; } },
      { t: '„Proč zrovna tady? Proč nad mojí postelí?“', to: 'chat_why', if: function (s) { return s.day > 1 && s.knowsPoint && !s.q.why; } },
      { t: '„Jsi ten bod, co šest tejdnů sledoval Hrubeš?“', to: 'chat_star', if: function (s) { return s.day > 1 && s.done.mailbox && !s.q.star; } },
      { t: '„Proč tu zůstala zvířata?“', to: 'chat_animals', if: function (s) { return s.day > 1 && s.animals && !s.q.animals; } },
      { t: '„Kdo mi v noci leze do bytu?“', to: 'chat_who', if: function (s) { return s.day > 1 && (s.sawWetPaint || s.done.doorCheck) && !s.knowsSelf && !s.q.who; } },
      { t: '„Jaká čtvrtá cesta?“', to: 'chat_fourth', if: function (s) { return s.heardTease && !s.q.fourth; } },
      { t: '„A co jsi ty? Co z toho máš, když mi radíš?“', to: 'chat_what', if: function (s) { return s.metNight && s.offerDay === null; } },
      { t: 'Nic. Položit telefon displejem dolů.', to: 'p_pc' }
    ]
  };
  function chatDo(key) { return function (s) { s.q[key] = true; s.actions++; }; }
  N.chat_where = {
    time: hubTime, mood: 'dread', sfx: 'buzz', enter: chatDo('where'),
    text: ['> Tady. Všichni. Nic je nebolí.', '> Chybíš jen ty. A půl.', 'Píšeš: půl čeho? Tři tečky se objevěj a zase zmizej. Třikrát.', '> Zeptej se svých rukou.'],
    choices: [{ t: 'Dál.', to: 'p_pc' }]
  };
  N.chat_why = {
    time: hubTime, mood: 'dread', sfx: 'buzz', enter: function (s) { chatDo('why')(s); s.knowsLamp = true; },
    text: ['> Nevybíral jsem. Dveře se musí otevřít někde.', '> Každé dveře mají práh. Někdo pod ním vždycky leží. Na každém světě zbude jeden.', 'Na každým světě.', '> Podívej se v noci na hvězdy. Všiml sis, že jich je víc.'],
    choices: [{ t: 'Dál.', to: 'p_pc' }]
  };
  N.chat_who = {
    time: hubTime, mood: 'dread', sfx: 'buzz', enter: chatDo('who'),
    text: ['> Nikdo k tobě nechodí. Já nemůžu. A nikdo jiný není.', '> Dveře se odemykají zevnitř. Podívej se ráno na své ruce.', 'Podíváš se na ně hned. Nic. Jen pod nehtem malíčku něco bílýho. Jako od barvy.'],
    choices: [{ t: 'Dál.', to: 'p_pc' }]
  };
  N.chat_fourth = {
    time: hubTime, mood: 'dread', sfx: 'buzz', enter: function (s) { chatDo('fourth')(s); s.knowsFourth = true; },
    text: ['> Když mu jednou předáš řízení dřív, nemusí ti ho vrátit. Den by byl jeho. Ty bys měl tři hodiny ve sklepě.', '> Má to vyryté u podlahy za dekou. Zkoušel to seškrábat. Běž se podívat, jestli mi nevěříš.', '> Já ti to říkám narovinu. On ne. To je rozdíl mezi námi.'],
    choices: [{ t: 'Dál.', to: 'p_pc' }]
  };
  N.chat_what = {
    time: hubTime, mood: 'dread', sfx: 'buzz',
    enter: function (s) { s.actions++; s.offerDay = s.day; },
    text: [
      'Odpověď chvíli nejde. Pak přijde celá naráz, bez jediný chyby.',
      '> Jsem to, na co se podívali. Soused je moje ruka. Tohle číslo je můj hlas.',
      '> Nejsem zlý. Jsem skoro hotový. Chybí mi jeden a půl člověka.',
      '> Reset není můj. Je jeho. Když tehdy v půlce uhnul, zasekl dveře. Ty jsi vězeň ve svém bytě. Já jsem vězeň ve čtvrtém patře.',
      '> Nabídka. Nech ho dokoukat. Odejdu a svět ti nechám i s proudem a vodou. A jednoho ti vrátím. Jednoho člověka, kterého si vybereš. Celého, jak byl ve 03:13.',
      '> Osm miliard za jednoho není spravedlivé. Ale třetí cesta je sázka, kterou nikdo nikdy nezkusil.',
      '> Do půlnoci.',
      'Jedna věc ti na tom nesedí. Jestli mu je jedno, kterou cestou odejde, proč mu tolik záleží na tom, abys nešel tou třetí?'
    ],
    choices: [{ t: 'Dál.', to: 'p_pc' }]
  };
  N.chat_star = {
    time: hubTime, mood: 'dread', sfx: 'buzz', enter: chatDo('star'),
    text: ['> Bod je to, jak vypadám, když se dívá jeden člověk.', '> Tvůj soused se díval šest týdnů. Každou noc. Byl první a byl nejblíž. Proto mi z něj zbylo nejvíc.', '> Teď se dívá osm miliard. Skoro.'],
    choices: [{ t: 'Dál.', to: 'p_pc' }]
  };
  N.chat_animals = {
    time: hubTime, mood: 'dread', sfx: 'buzz', enter: chatDo('animals'),
    text: function (s) {
      var t = ['> Dívají se taky. Ale nevědí, na co. To se nepočítá.', '> Pohled musí být rozhodnutí. Proto s tebou mluvím, místo abych ti prostě zvedl hlavu.'];
      if (s.hasDog) t.push('> Ten pes tě má rád. Zná tě déle, než si myslíš.');
      return t;
    },
    choices: [{ t: 'Dál.', to: 'p_pc' }]
  };

  N.triang = {
    time: function (s) { return ['Den ' + s.day, '10:15']; }, mood: 'dread',
    enter: function (s) { s.knowsPoint = true; s.knowsLamp = true; },
    text: [
      'Stahuješ poslední snímky před 03:14. Praha, Tokio, New York, Sydney, Reykjavík, Kapský Město. A měříš, kam přesně se kdo dívá.',
      'V Praze k východu, nízko nad obzor. V Tokiu skoro do země, šikmo dolů skrz podlahu nástupiště. V Sydney taky dolů. V Reykjavíku na jihovýchod.',
      'Nedívali se do nebe. Dívali se na jedno místo. Každej ze svý strany planety, i skrz ni.',
      'Tři hodiny počítáš úhly. Čáry se sbíhaj. Tvoje město. Tvoje ulice. Tvůj barák. Výška odhadem čtvrtý patro.',
      'Jsi ve třetím.',
      'Celej svět se ve 03:14 podíval na byt nad tvou postelí. A tys ležel přímo pod tím. Nepřežil jsi, protože jsi spal. Spala půlka Evropy a zmizela taky. Přežil jsi, protože jsi byl moc blízko. Jako člověk, co stojí pod lampou.',
      '> Už víš kde. Tak se zeptej proč tady.'
    ],
    choices: [{ t: 'Dál.', to: 'p_pc' }]
  };

  N.mirrorwall = {
    time: function (s) { return ['Den ' + s.day, '10:20']; }, mood: 'dread', sfx: 'scrape',
    enter: function (s) { s.sawWetPaint = true; },
    text: function (s, P) {
      var t = ['Sundáš zrcadlo a zarazíš se dřív, než přiložíš nůž.'];
      if (s.carved1) {
        t.push('Čárky tam jsou. ' + tallyM(s, P) + '. Tvoje rytí z prvního dne taky. Ale ne celý. Řádek o sedmičce je pryč. Zatřenej.');
        t.push('Sáhneš na to. Barva je ještě vlhká.');
        t.push('Někdo tu byl. Mezi 03:14 a 06:47, zatímco jsi ležel v posteli tři metry odsud. A ten někdo si tvoje rytí přečetl. Sedmička byla jediná pojistka. Tys ji napsal na zeď.');
        t.push('Jako na zavolanou zašustí papír pod dveřma.');
        t.push('~ Vím, že si pamatuješ. Kóje 7. Prosím.');
        t.push('Sedmička bez čárky.');
      } else {
        t.push('Čárky tam jsou. ' + tallyM(s, P) + '. Ale pod nima je pruh omítky jinej. Hladší, světlejší. Přetřenej.');
        t.push('Sáhneš na to. Barva je ještě vlhká.');
        t.push('Někdo tu byl. Mezi 03:14 a 06:47, zatímco jsi ležel v posteli tři metry odsud. Proto ty odemčený dveře, každý ráno.');
        t.push('Seškrábneš kus. Pod barvou tvoje ruka:');
        t.push('# OD POKUSU 8 PÍŠU 7 BEZ ČÁRKY. SCHVÁLNĚ. ONO TO NEVÍ.');
        s.knowsSeven = true;
      }
      t.push('Zeď za zrcadlem je spálená. Co sem vyryješ, to někdo čte a zatírá. Čárky ale nechává. Chce, abys věděl, kolikátej pokus to je. Jen ne, co ses naučil.');
      return t;
    },
    choices: [{ t: 'Dál.', to: 'p_home' }]
  };

  N.carveDesk = {
    time: function (s) { return ['Den ' + s.day, '11:30']; }, mood: 'dread', sfx: 'scrape',
    enter: function (s, P) {
      P.carv = P.carv || {};
      P.carv.bed = true;
      if (s.knowsPoint) P.carv.point = true;
      if (s.metNight) P.carv.night = true;
    },
    text: function (s, P) {
      var t = ['Lehneš si pod pracovní stůl a ryješ zespodu do desky.', '# ' + (tallyM(s, P) + 1) + '. PAMATUJU SI. VE 03:14 POD POSTEL, NEDÍVAT SE, NEUSNOUT.'];
      if (s.knowsPoint) t.push('# VŠICHNI SE DÍVALI NA 4. PATRO NAD POSTELÍ. VE DNE TAM NECHOĎ.');
      if (s.metNight) t.push('# TEN V KÓJI 7 JSI TY. VĚŘ MU. LÍSTKY POD DVEŘMI NEPÍŠE ON.');
      t.push('Dřevo drží líp než omítka. Tohle tu zůstane. I kdyby se všechno ostatní vrátilo.');
      return t;
    },
    choices: [{ t: 'Dál.', to: 'p_home' }]
  };

  N.doorCheck = {
    time: function (s) { return ['Den ' + s.day, '08:00']; }, mood: 'dread',
    enter: function (s) { s.sawLock = true; },
    text: [
      'Klečíš u zámku s lupou z šuplíku. Žádný škrábance, žádný stopy po šperháku. Klíč je v zámku zevnitř, pootočenej.',
      'Nikdo se sem nedobýval. Někdo odemkl z bytu a nechal odemčeno. Jako když jdeš jen na skok dolů a hned se vracíš.',
      'V komoře stojí poloprázdná plechovka bílý barvy a štětec. Štětec je vlhkej. Nepamatuješ si, že bys ji kdy otevřel.'
    ],
    choices: [{ t: 'Dál.', to: 'p_home' }]
  };

  N.trap = {
    time: function (s) { return ['Den ' + s.day, '11:40']; }, mood: 'dread',
    enter: function (s) { s.trapSet = true; },
    text: [
      'Mouka na podlahu v chodbě, nit přes dveře, telefon ve skříni s kamerou na zrcadlo.',
      'Pak se zarazíš. Reset vrátí všechno, co není psaný rukou nebo vyrytý. Mouka zmizí ve 03:14, video taky. A návštěva chodí až potom.',
      'Potřebuješ past, co reset přežije. Vezmeš propisku, rozlomíš náplň a inkoustem natřeš kliku z obou stran, rám zrcadla a víko plechovky s barvou.',
      'Inkoust z ruky je skoro rukopis. Uvidíme.'
    ],
    choices: [{ t: 'Dál.', to: 'p_home' }]
  };

  N.outside = {
    time: function (s) { return ['Den ' + s.day, '14:00']; }, mood: 'dread',
    text: [
      'Stojíš přes ulici, zády k výloze. Čtvrtý patro. Okno nad tvou ložnicí.',
      'Stojí v něm soused. Čelem do ulice, ale hlavu má zvrácenou ke stropu. Nehýbe se. Za ním je v pokoji světlo. Uprostřed dne je tam jasněji než venku.',
      'Vytáhneš telefon a přiblížíš si to. Foťák nemůže zaostřit. Přejíždí tam a zpátky, jako by v tom pokoji nebylo nic, čeho se chytit.',
      'Ještě kousek zoomu a uvidíš strop.'
    ],
    choices: [
      { t: 'Přiblížit. Je to jen displej. Displej není pohled.', to: 'end_screen' },
      { t: 'Sklopit telefon. Hned.', to: 'p_street' }
    ]
  };

  N.carveOffer = {
    time: function (s) { return ['Den ' + s.day, '12:30']; }, mood: 'cellar', sfx: 'scrape',
    enter: function (s) { s.offerCarved = true; if (!s.done.cellar2) { s.done.cellar2 = true; s.done.cellar = true; s.knowsFourth = true; s.verified = true; } },
    text: [
      'Kóje 7. Vyryješ to celý. Nabídku, lhůtu, i to, že víš o čtvrtý cestě, tý u podlahy za dekou.',
      'Trvá to do oběda. Ruka tě bolí až do ramene.',
      'Jestli se k tomu má někdo vyjádřit, tak ten, koho se to týká nejvíc.'
    ],
    choices: [{ t: 'Zpátky nahoru.', to: 'p_house' }]
  };

  N.proofAsk = {
    time: function (s) { return ['Den ' + s.day, '13:13']; }, mood: 'event', sfx: 'knock',
    enter: function (s) { s.offerGone = true; },
    text: [
      '> Pět minut. Dobře.',
      'Zaklepání na dveře. Obyčejný, lidský.',
      'Nejmenoval jsi nikoho. Vybralo si samo. Vybralo správně.',
      'Stojí na chodbě, v tom, v čem šel včera spát. Celej, jak byl ve 03:13. Usměje se na tebe, jako by se nic nestalo.',
      'Pět minut mluví. Že je to nahoře krásný. Že tam jsou všichni. Že nechápe, proč tu stojíš. Vezme tě za ruku a táhne ke schodům, jemně, jako když tě někdo vede ukázat ti překvapení.',
      '! „Pojď. Jen se pojď podívat. Prosím.“',
      'Celou dobu se ti nepodívá do očí. Dívá se kousek nad tebe.'
    ],
    choices: [
      { t: 'Jít. Je to on. Je to opravdu on.', to: 'end_proof' },
      { t: 'Vytrhnout ruku. Zavřít dveře. Zamknout. Neposlouchat.', to: 'hub', do: function (s) { s.shaken = true; s.actions++; } }
    ]
  };

  N.lie = {
    time: function (s) { return ['Den ' + s.day, '12:00']; }, mood: 'dread', sfx: 'buzz',
    enter: function (s) { s.lied = true; },
    text: [
      'Píšeš: *Beru to.*',
      '> Dobře. Dnes v noci tedy.',
      'Nic dalšího. Žádná otázka, žádná podmínka.',
      'Položíš telefon a snažíš se myslet na cokoliv jinýho než na schody ve 03:10. Jde to blbě. Zkus nemyslet na bílýho medvěda.'
    ],
    choices: [{ t: 'Dál.', to: 'p_pc' }]
  };

  // =====================================================================
  //  NOČNÍ JÁ
  // =====================================================================
  N.passenger = {
    time: function (s) { return ['Noc', '03:40']; }, mood: 'cellar',
    enter: function (s) {
      s.first = !s.metNight;
      s.metNight = true; s.knowsSelf = true; s.justMet = s.first;
      s.qLeft = s.first ? 2 : 1;
      s.trapResult = false;
    },
    text: function (s, P) {
      var t = [];
      if (s.first) {
        t.push('Světlo zhasne. A ty tentokrát neusneš.');
        t.push('Ležíš v posteli. Chceš se posadit. Nejde to. Chceš pohnout prstem. Nic.');
        t.push('Pak se posadíš. Jenže ne ty. Tělo vstane samo, klidně, jako po tisící. Jsi v něm jen spolujezdec.');
        t.push('Jde do komory, vezme barvu, zatře zeď za zrcadlem. Pak odemkne dveře a jde po schodech dolů. Potmě, bez zaváhání. Sklep. Kóje 7.');
        if (s.hasDog) t.push('Na dece už leží Kulich. Zvedne hlavu a zavrtí ocasem. Tělo ho podrbe za uchem, tak samozřejmě, jak se to dělá po sté.');
        t.push('Tělo si sedne na deku, zapálí svíčku a řekne nahlas, tvým hlasem, do prázdna:');
        t.push('! „Vím, že tam dneska jsi. Cítím, jak se díváš. Tak poslouchej, v 06:47 mě zase vypneš.“');
        t.push('! „Já jsem ten z pokusu 3. Byl jsem vzhůru a podíval jsem se. Napůl. Pak jsem uhnul. Půlka mě je od tý doby tam nahoře a půlka tady, tři a půl hodiny denně. Zbytek dne patříš sobě a nepamatuješ si nic.“');
        t.push('! „Zatírám ti vzkazy, protože ono je čte přes tvoje oči. Čím víc víš ve dne, tím víc ví ono. Čárky nechávám, abys nezešílel.“');
        if (s.hasDog) t.push('! „Kulich za mnou chodí každou noc, přes rok. Je jedinej, kdo zná nás oba.“');
        t.push('! „Slyším tě, když myslíš nahlas. Máš jednu, možná dvě otázky, než se rozední. Vyber dobře.“');
      } else {
        t.push('Světlo zhasne. Tělo vstane bez tebe. Schody, sklep, kóje 7, svíčka.');
        if (s.offerCarved) {
          s.offerCarved = false; s.fortyTwo = true;
          t.push('Posvítí si na tvoje rytí. Čte dlouho. U řádku o čtvrtý cestě zavře oči a ty cítíš, jak se mu stáhne hrdlo. Tvoje hrdlo.');
          t.push('! „Jo. Zamlčel jsem to. Styděl jsem se. Když máš tři hodiny denně ve sklepě, napadaj tě věci.“');
          t.push('! „Ale poslouchej, co jsi mi napsal. Stovky dní nenabídlo nic. Ani jednou. Jen čekalo. A teď najednou proud, voda, člověk zpátky a lhůta. To není obchodník. To je někdo, kdo se bojí.“');
          t.push('! „Jestli to vezmeš, nebudu se zlobit. Jsem unavenej tak, že si to neumíš představit. Záruku ti nedám, žádnou nemám.“');
          t.push('Vezme nůž a pod jedenačtyřicet řádků vyryje dvaačtyřicátej. Hluboko, až odletuje omítka.');
          t.push('# NEUDĚLÁM TO.');
        } else if (s.erosion >= 3) {
          t.push('Dlouho jen sedí a dívá se na stěnu u podlahy. Na ty řádky, co ryje čím dál mělčeji.');
          t.push('! „Rozhodni se. Prosím tě. Já už dlouho ne.“');
        } else {
          t.push('! „Zase ty. To je dobře. Je tu tma, když se nikdo nedívá.“');
        }
        var left = ['a', 'b', 'c', 'd', 'e'].filter(function (k) { return !s.q['p' + k]; }).length;
        if (left) t.push('! „Ptej se. Jednu stihneme.“'); else { t.push('! „Už víš všechno, co vím já. Zbytek je na tobě.“'); s.qLeft = 0; }
      }
      return t;
    },
    choices: function (s) { return pqChoices(s).concat([{ t: 'Neptat se. Jen s ním sedět, dokud nezačne šednout.', to: 'morning' }]); }
  };

  function pqChoices(s) {
    if (s.qLeft <= 0) return [];
    var L = [
      ['a', '„Co je nahoře ve čtvrtým patře?“'],
      ['b', '„Co se stalo ty dvakrát, co jsem šel nahoru?“'],
      ['c', '„Kdo mi píše z 0314 a kdo strká lístky pod dveře?“'],
      ['d', '„Dá se to ukončit? A jak?“'],
      ['e', '„Jak mám vědět, že nejsi ono ty?“']
    ];
    return L.filter(function (x) { return !s.q['p' + x[0]]; }).map(function (x) {
      return { t: x[1], to: 'pq_' + x[0] };
    });
  }
  function pq(key, lines, extra) {
    N['pq_' + key] = {
      time: function () { return ['Noc', key === 'd' ? '05:50' : '04:30']; }, mood: 'cellar',
      enter: function (s) { s.q['p' + key] = true; s.qLeft--; if (extra) extra(s); },
      text: lines,
      choices: function (s) {
        var c = pqChoices(s);
        return c.concat([{ t: c.length ? 'To stačí. Okýnkem do sklepa začíná šednout.' : 'Okýnkem do sklepa začíná šednout.', to: 'morning' }]);
      }
    };
  }
  pq('a', [
    '! „Dveře. Jednu minutu denně, ve 03:14. Zbytek dne tam žádný dveře nejsou. Je tam jen jeho ruka, ten starej, a čeká, až zvedneš hlavu.“',
    '! „Proto tě láká ve dne. Ve dne se tam dá jen podívat. Nic jinýho se tam ve dne dělat nedá.“',
    '! „Nechoď tam ve dne. Slib mi to.“'
  ]);
  pq('b', [
    'Tělo se podívá na dvě tlustý rýhy na stěně. Na ty dvě slova pod nima.',
    '! „Nevím. Slyšel jsem tě ráno jít po schodech nahoru. Pak ticho. A ve 03:14 jsi ležel v posteli a nepamatoval sis ani ty čárky. Musel jsem začít novej blok.“',
    '! „Podíval ses, to je jasný. Jenže dokud jsem já půlka tady, nemůže si tě vzít celýho. Tak tě vrátí na začátek a zkouší to znova. A já taky.“',
    '! „Dvakrát. Dvě stě dvanáct dní a sto osmdesát sedm. Potřetí už to počítat nechci.“'
  ]);
  pq('c', [
    '! „0314 je jeho hlas. Skoro nelže. To je na něm nejhorší. Řekne ti pravdu přesně ve chvíli, kdy se mu hodí.“',
    '! „Lístky pod dveře nepíšu já. Ve dne nejsem. Strká ti je jeho ruka, ten starej ze čtvrtýho. Tvoje písmo umí, protože čte všechno, co čteš ty.“',
    '! „Proč tě posílá do sklepa? Aby sis přečetl moje zdi. Co přečteš ty, přečte ono. A proč ti večer říká, ať spíš? Protože když to prospíš, ráno nevíš nic a ono začíná od nuly s někým, kdo mu ještě věří.“'
  ]);
  pq('d', [
    'Tělo dlouho mlčí. Svíčka praská.',
    '! „Dá. Vím o třech cestách. Žádná není zadarmo.“',
    '! „První: podíváš se. Celej, dobrovolně. Půjdeš za ostatníma. Moje půlka tam je a necítím z ní nic. Ani bolest, ani klid. Nic.“',
    '! „Druhá: dokoukám se já. Pak budu tam celej a ty tady celej. Reset přestane. Zůstaneš na světě sám, napořád. Proud dojde, voda dojde, a už se to nevrátí. Zestárneš tu.“',
    '! „Třetí jsem nikdy nezkusil. Všichni se dívali dovnitř. Nikdo nikdy ven. Jenže já mám půlku očí na druhý straně. Kdybych se odtamtud podíval ven, musel bych mít na co. Na někoho, kdo stojí přesně v tom bodě. Čtvrtý patro, nad tvou postelí, ve 03:14, se zavřenýma očima.“',
    '! „Ve 03:10 stojíš na schodech pod čtvrtým patrem, oči zavázaný. Řekneš nahlas ‚řiď‘. Vyjdu nahoru poslepu, znám to tam po hmatu. Postavím tě do bodu. Pak ti tělo vrátím a jdu se dívat z druhý strany. Čtyři minuty mi musíš věřit.“',
    '! „Možná se vrátí všichni. Možná si to vezme i tebe. A ono tohle všechno slyší přes tebe. Bude připravený. Nesundávej ten šátek. Ať řekne cokoliv.“'
  ], function (s) { s.knowsWays = true; });
  pq('e', [
    'Tělo se zasměje. Krátce, tvým smíchem, kterej jsi dlouho neslyšel.',
    '! „Nemáš jak. Mám tvoje ruce, tvoje písmo, tvoje vzpomínky. Ono taky skoro všechno.“',
    '! „Jeden rozdíl. Ono tě chce nahoře ve dne, nebo spícího v noci. Já ti říkám: ve dne tam nechoď a v noci nespi. Kdo z nás dvou ti kdy poradil něco, co tě udrželo naživu?“',
    '! „A ještě jedno. Ono nikdy nesklopí hlavu. Ani na vteřinu. Já se dívám do země už přes rok.“'
  ]);

  // =====================================================================
  //  FINÁLE
  // =====================================================================
  N.stairs = {
    time: function (s) { return ['Den ' + s.day, '03:10']; }, mood: 'event',
    redirect: function (s) { return s.lied ? 'end_stairs' : null; },
    text: function (s) {
      var t = [
        'Den strávíš tak, jak se trávěj poslední dny. Sníš to nejlepší z lednice. Telefon píše celej den. Nečteš to.',
        '= 03:10',
        'Stojíš na schodech pod čtvrtým patrem. Šátek přes oči, dvakrát obtočenej, uzel vzadu. Srdce ti buší v krku.'
      ];
      if (s.knowsFourth && !s.verified) t.push('O čtvrtý cestě víš jen od toho, kdo chce, abys tu nestál. Nešel ses přesvědčit. Teď už je pozdě.');
      else if (s.knowsFourth && s.fortyTwo) t.push('Dvaačtyřicet řádků. Ten poslední nejhloubějc.');
      else if (s.knowsFourth) t.push('Jedenačtyřicet řádků ve sklepě. Poslední nejmělčeji ze všech. A stejně tu stojíš.');
      t.push('„Řiď.“');
      t.push('Je to jako usnout ve stoje. Ruce přestanou být tvoje. Tělo se nadechne, protáhne prsty a tiše řekne:');
      t.push('! „Díky.“');
      return t;
    },
    choices: [{ t: 'Dvanáct schodů.', to: 'finalwalk' }]
  };

  N.finalwalk = {
    time: function (s) { return ['Den ' + s.day, '03:13']; }, mood: 'event', bleach: 1,
    text: function (s) {
      return [
        'Dvanáct schodů, odpočívadlo, doleva. Klika. Dveře souseda nejsou zamčený.',
        'Uvnitř je teplo. A plno. Nevidíš nic, ale cítíš to, jako když vejdeš potmě do místnosti, kde stojej lidi a mlčej.',
        'Pak začnou mluvit. Hlasy, který znáš nejlíp na světě. Jeden po druhým, zblízka, vystrašený. Že je jim zima. Že tě nevidí. Ať se na ně aspoň podíváš.',
        'Tělo jde dál. Šest kroků, sedmej. Zastaví se.',
        '! „Tady. Přesně nad tvou postelí. Nehni se.“',
        'A pak ti vrátí ruce. Prostě tak. Kolena se ti podlomí vlastní vahou, ustojíš to.',
        s.fortyTwo ? '! „Dvaačtyřicet,“ řekne ti ještě v hlavě, už z dálky. „Jdu se dívat.“' : '! „Neudělal jsem to,“ řekne ti ještě v hlavě, už z dálky. „Jdu se dívat.“',
        'Jsi v tom sám.'
      ];
    },
    choices: [{ t: '03:14.', to: 'final' }]
  };

  N.final = {
    time: function (s) { return ['Den ' + s.day, '03:14']; }, mood: 'event', bleach: 3,
    text: [
      'Světlo. Tady nahoře nemá směr, jsi uvnitř něj. Podlaha pod nohama měkne. Hlasy ztichnou a místo nich promluví to jedno, bez dechu, ze všech stran:',
      '! „Stojíš ve dveřích. Nikdo nikdy nestál ve dveřích.“',
      'Něco se dotkne uzlu na tvým zátylku. Prsty. Starý, suchý, sousedovy. Šátek povolí a sklouzne ti na ramena.',
      'Máš zavřený oči. Zatím.',
      '! „On se dívá ven a nevidí nic. Je tam tma. Potřebuje světlo, a to se rozsvítí, jen když otevřeš oči. Neřekl ti to, protože to nevěděl. Otevři je a všichni tě uvidí. Nebo je nech zavřený a za čtyřicet vteřin se dveře zavřou s ním uvnitř celým a s tebou tady.“',
      'Může to být pravda. Může to být poslední lež.',
      'Zevnitř, strašně zdaleka, slyšíš vlastní hlas křičet něco, čemu nerozumíš.',
      'Čtyřicet vteřin.'
    ],
    choices: [
      { t: 'Oči zavřený, ať se děje cokoliv. Věřit plánu, jak byl.', to: 'end_good' },
      { t: 'Otevřít oči, ale dívat se dolů. Na vlastní nohy, na podlahu.', to: 'end_floor' },
      { t: 'Zařvat dovnitř, na všech osm miliard: „Otočte se! Dívejte se ven, na mě!“', to: 'end_good', do: function (s) { s.shouted = true; } },
      { t: 'Snažit se rozumět tomu vzdálenýmu křiku. Je to tvůj hlas.', to: 'end_good', do: function (s) { s.listened = true; } },
      { t: 'Otevřít oči a podívat se.', to: 'end_look' }
    ]
  };

  // =====================================================================
  //  KONCE
  // =====================================================================
  function end(id, node) { node.end = id; node.choices = []; N['end_' + id] = node; }

  end('good', {
    time: ['Den 1', '06:47'], mood: 'dawn', bleach: 0,
    text: function (s) {
      var t = [];
      if (s.shouted) {
        t.push('Zařveš to, až ti přeskočí hlas. Do světla, do všech těch hlasů.');
        t.push('Ticho. A pak jeden hlas zdaleka, tvůj vlastní, a směje se: „VIDÍM TĚ! NEOTVÍREJ! VIDÍM TĚ!“');
      } else if (s.listened) {
        t.push('Přestaneš poslouchat to bezdechý kolem sebe a posloucháš jen ten křik. Je to jedno slovo, pořád dokola.');
        t.push('„NEOTVÍREJ! VIDÍM TĚ! NEOTVÍREJ!“');
      } else {
        t.push('Zatneš víčka, až to bolí. Ruce v pěst. Stojíš. Sousedovy prsty ti přejedou po víčkách, zlehka, skoro něžně. Neucukneš.');
        t.push('A pak tomu vzdálenýmu křiku konečně rozumíš. Je to jedno slovo, pořád dokola: „NEOTVÍREJ! VIDÍM TĚ! NEOTVÍREJ!“');
      }
      t.push('Světlo nikdy nepotřeboval. Stojíš ve dveřích, jediná tmavá věc v tom jasu. Silueta. Jediný, co se z druhý strany dá vidět.');
      t.push('Podíval se ven. Na tebe. A protože se podíval on, otočil se ten vedle něj. A další. Cítíš to jako průvan, kterej změnil směr. Osm miliard pohledů, a všechny se opřou do tebe jako vítr do plachty.');
      t.push('To bezdechý kolem tebe řekne poslední věc. Nezní to vztekle. Zní to překvapeně:');
      t.push('! „Aha.“');
      t.push('= 06:47');
      t.push('Budí tě hluk. Auta. Soused s vrtačkou. Někdo na ulici nadává, že mu kdosi nechal auto uprostřed křižovatky.');
      t.push('Byt není prázdnej. Z vedlejšího pokoje slyšíš dýchání a pak ty nejobyčejnější ranní zvuky na světě. Chvíli jen ležíš a posloucháš je.');
      t.push('Zprávy jsou plný jediný věci: celá planeta má tříhodinový okno, na který si nikdo nepamatuje. Do tejdne to přebije fotbal.');
      if (s.hasDog) t.push('Na chodníku někdo venčí střapatýho voříška s jedním uchem dolů. Pes se u vašeho vchodu zastaví, podívá se nahoru do tvýho okna a zavrtí ocasem. Pak se nechá odtáhnout.');
      t.push('Odpoledne sejdeš do sklepa. Kóje 7 je prázdná. Stěny holý. Až na jedno místo u podlahy:');
      t.push('# ' + (s.fortyTwo ? '42. ' : '') + 'NEUDĚLAL JSEM TO.');
      t.push('Tu noc se ve 03:14 vzbudíš sám od sebe. Venku normální tma, normální lampy. Nahoře nic neteče. Usínáš skoro hned. Jen si předtím všimneš, že spíš celej. Poprvý po víc než roce.');
      t.push('A o patro výš starej soused stojí u okna, dívá se do ulice a snaží se vzpomenout, proč má na prstech modrej inkoust.');
      return t;
    }
  });

  end('up', {
    time: function (s) { return ['Den ' + s.day, '']; }, mood: 'dark', bleach: 2,
    text: function (s) {
      var t = [
        'Čtvrtý patro. Dveře povolej, sotva se jich dotkneš.',
        'Uvnitř je teplo a jasno. Soused stojí uprostřed pokoje, zády k tobě, v županu, ruce podél těla. Hlavu má zvrácenou dozadu. Dívá se do stropu.',
        '! „Jsem rád, že jste přišel. Podívejte. Já tomu nerozumím.“',
        'Uděláš krok. Druhej. Nechceš se dívat nahoru. Chceš se podívat na něj. Jenže on ukáže prstem, a oči jdou za prstem samy, tak jako vždycky.'
      ];
      if (s.metNight) t.push('Slíbil jsi mu, že sem ve dne nepůjdeš.');
      t.push('Na stropě nic není. To je na tom to nejhorší. Je tam všechno.');
      t.push('= 06:47');
      t.push('Budí tě ticho. Jen lednička. Na lince se kouří z kávy. Nepamatuješ si nic.');
      t.push('Ve sklepě, v kóji 7, někdo vyryje pod poslední blok čárek tlustou vodorovnou rýhu a dvě slova. Pak začne novej blok. Od jedničky.');
      return t;
    }
  });

  end('look', {
    time: function (s) { return ['Den ' + s.day, '03:14']; }, mood: 'dark', bleach: 3,
    text: [
      'Zvedneš hlavu.',
      'Strop tam není. Není tam ani nebe. Je tam to, na co se dívali všichni, a je to tak samozřejmý, že nechápeš, jak ses mohl celou dobu dívat jinam.',
      'Jsou tam. Všichni. Dívaj se stejným směrem jako ty.',
      'Poslední věc, kterou cítíš, je úleva. Poslední věc, kterou si pomyslíš, je, že ta úleva není tvoje.',
      '! „Hotovo.“',
      'V prázdným bytě ve třetím patře dojde za čtyři dny proud. Káva na lince vystydne. Tentokrát doopravdy.'
    ]
  });

  end('mirror', {
    time: function (s) { return ['Den ' + s.day, '03:14']; }, mood: 'dark', bleach: 3,
    text: [
      'Zrcadlo opřený o zeď. Skloníš se k němu a v odrazu vidíš pokoj, postel, a nad ní kus toho, co je místo stropu.',
      'Jen roh. Jen na vteřinu. Pak sebou trhneš a zrcadlo se rozletí o podlahu.',
      'Pozdě. Odraz je taky pohled. Poloviční. A poloviční už tu jeden byl.',
      '= 06:47',
      'Budí tě ticho. Jsi v posteli a jsi tam jen z třetiny. Nevíš to, jen ti všechno připadá vzdálenější. Barvy, zvuky, vlastní ruce.',
      'Ve sklepě sedí někdo s tvým obličejem a zjišťuje, že má od dneška jen hodinu a půl. A že mu ve tmě přibyl spolubydlící, kterej nemluví a jen se dívá do stropu.'
    ]
  });

  end('sky', {
    time: function (s) { return ['Den ' + s.day, '03:14']; }, mood: 'dark', bleach: 3,
    text: [
      'Odpočívadlo u dálnice, dvě stě kilometrů od domova. Zamkneš se, sklopíš sedačku. Střecha auta je celá ze skla. Hvězd je moc.',
      'Kolem třetí tě vzbudí ticho. Hodiny na palubce stojej na 03:12.',
      'Ta věc nebyla nad barákem. Byla nad tebou. Doma jsi měl nad hlavou strop a nad stropem cizí byt, a v tom bytě se to otevíralo. Byl jsi pod prahem, ve slepým úhlu.',
      'Tady nad tebou není nic. Jen sklo.',
      'Zavřeš oči. Světlo jde skrz víčka, skrz dlaně, skrz deku přetaženou přes hlavu. Není kam zalézt. Není pod co.',
      'Vydržíš jedenáct vteřin.'
    ]
  });

  end('screen', {
    time: function (s) { return ['Den ' + s.day, '14:03']; }, mood: 'dark', bleach: 2,
    text: [
      'Dva prsty od sebe. Obraz skočí blíž, rozmaže se, zaostří.',
      'Strop sousedova pokoje. Na displeji je to jen bílá plocha, přepálená, pár čtverečních centimetrů světla.',
      'Lístek říkal: displejům nevěř. Myslel sis, že jde o to, co na nich píše.',
      'Ta bílá plocha se neodlepí. Sklopíš telefon a je pořád tam, uprostřed všeho, na co se podíváš. A roste.',
      'Soused v okně poprvý sklopí hlavu a podívá se přímo na tebe. Usměje se. Už se nahoru dívat nemusí.',
      'Pohled je pohled.'
    ]
  });

  end('floor', {
    time: function (s) { return ['Den ' + s.day, '03:14']; }, mood: 'dark', bleach: 3,
    text: [
      'Otevřeš oči a přitiskneš bradu k hrudi. Jen podlaha. Jen vlastní boty.',
      'Jenže podlaha tu ve 03:14 není. Je průhledná jako voda. Vidíš skrz ni dolů do svý ložnice. Postel. A v ní sebe, jak spíš, tu první noc, klidně, na boku.',
      'Ten dole otevře oči a podívá se přímo na tebe. Nahoru.',
      'Nemělo to světlo. Mělo to dva konce. Nahoře a dole se dívaj oba stejným směrem: do dveří.',
      '! „Děkuju. Stačilo by cokoliv. Ale tohle je skoro elegantní.“',
      'Zdaleka slyšíš svůj hlas křičet jedno slovo. Teď mu rozumíš. Bylo to „neotvírej“.'
    ]
  });

  end('deal', {
    time: function (s) { return ['Den ' + (s.day + 1), '06:47']; }, mood: 'dark',
    text: function (s) {
      var full = offer(s) === 'full', t = [
        'Vyryješ to do stěny kóje 7. Dvě slova. *Dokoukej se.*',
        'Ve 03:14 ležíš pod postelí a poprvý nic nepřijde. Žádný světlo, žádný hlasy. Jen ve sklepě pod tebou někdo dlouho vydechne.',
        '= 06:47'
      ];
      t.push(full ? 'Lednička běží. Voda teče. Poběží a poteče napořád, bez elektráren, bez lidí. Dodrželo slovo.' : 'V bytě je zima. Lednička mlčí. Z kohoutku vyteče deci rezavý vody a konec. I tohle dodrželo.');
      t.push('A z vedlejšího pokoje slyšíš dýchání.');
      t.push('Je to on. Celej, jak byl ve 03:13. Obejme tě, směje se, ptá se, co je to za blbej sen, že se mu zdálo, že všichni zmizeli. Držíš ho tak dlouho, až se začne ošívat.');
      t.push('Ve 03:13 ho probudí ticho. Posadí se na posteli. Ve 03:14 zvedne hlavu ke stropu a zůstane tak. Minutu. Pak si lehne a ráno o ničem neví.');
      t.push('Každou noc. Celej, jak byl ve 03:13. Vteřinu před pohledem, napořád.');
      t.push('Kóje 7 je prázdná. Na stěně u podlahy je nedopsanej řádek. NEUDĚL');
      return t;
    }
  });

  end('proof', {
    time: function (s) { return ['Den ' + s.day, '13:18']; }, mood: 'dark', bleach: 2,
    text: [
      'Je to jeho ruka. Poznal bys ji poslepu.',
      'Vede tě po schodech a povídá. O včerejšku, o úplných blbostech, přesně tak, jak mluví vždycky. Na odpočívadle se zasměje něčemu, co jsi řekl před rokem.',
      'Dveře ve čtvrtým patře jsou dokořán.',
      '! „Tady. Koukej.“',
      'Pustí tvou ruku a ukáže. A ty se podíváš, protože ukázal on.',
      'Pět minut uplynulo ve chvíli, kdy jsi zvedl hlavu. Stojíš v tom pokoji sám. Nikdy tam s tebou nikdo nebyl.',
      '> Neřekl jsem, že ti ho vrátím opravdového. Řekl jsem, že ti ho vrátím celého, jak byl. Byl takový. Díval se.'
    ]
  });

  end('stairs', {
    time: function (s) { return ['Den ' + s.day, '03:10']; }, mood: 'dark', bleach: 2,
    text: [
      'Schody pod čtvrtým patrem. Šátek přes oči, uzel vzadu. Nadechneš se, abys řekl to slovo.',
      'Někdo ti položí ruku na rameno. Teplou, suchou.',
      '! „Řekl jsi, že bereš. Tak jsem ti přišel naproti.“',
      'Celej den jsi myslel na tyhle schody. Na 03:10. Na šátek. Četlo to každou tu myšlenku, jednu po druhý, tvejma očima. Lhát někomu, kdo ti sedí v hlavě, nejde.',
      'Prsty najdou uzel. Šátek sklouzne. Máš zavřený oči a stojíš na schodech, o dvanáct stupňů níž, než je bod. Tady tě nikdo z druhý strany neuvidí. Tady jsi jen člověk se zavřenejma očima.',
      'Ve sklepě někdo křičí tvým hlasem. Pak ti dvě suchý dlaně vezmou hlavu, zlehka, a zakloněj ji.',
      'Víčka vydržej čtyři minuty. Je 03:14.'
    ]
  });

  end('fourth', {
    time: ['Noc', '03:14'], mood: 'dark',
    text: [
      'Probudíš se ve tmě. Není to tvoje postel. Pod zády máš deku na betonu a nad hlavou trubky.',
      'Kóje 7. Svíčka je dohořelá. Na stěně u podlahy jsou řádky, který znáš. Poslední z nich někdo přeškrtl. Jedním tahem, zhluboka.',
      'Vedle leží lístek. Tvoje písmo. Sedmička bez čárky.',
      '~ Promiň. Čekal jsem moc dlouho a tys pořád jen čekal taky. Vzal jsem si den. Máš 03:14 až 06:47, jako jsem míval já. Zvykneš si. Čárky ti nechám.',
      'Nahoře, ve třetím patře, se někdo protahuje v tvý posteli a poprvý po víc než roce se těší na ráno.',
      'Máš tři a půl hodiny. Vezmeš nůž a vyryješ první čárku.'
    ]
  });

  end('alone', {
    time: function (s) { return ['Den ' + (s.day + 1), '06:47']; }, mood: 'bleak',
    text: [
      'Vyryješ to do stěny kóje 7. *Dokoukej se. Díky za všechno.*',
      'Ve 03:14 ležíš pod postelí a nic nepřijde. Žádný světlo. Jen ve sklepě pod tebou někdo dlouho vydechne, jako člověk, kterej si konečně sedl.',
      '= 06:47',
      'Budí tě zima. Lednička mlčí. Káva na lince je studená a má na hladině škraloup. Je to ta nejkrásnější studená káva na světě. Je včerejší.',
      'Čas jde dál. Dveře jsou zamčený, jak jsi je nechal. Ve čtvrtým patře je prázdnej byt s otevřeným oknem.',
      'Máš celou planetu. Naučíš se generátory, studny, zavařování. Na jaře zaseješ. Mluvíš nahlas, aby sis pamatoval, jak zní hlas.',
      'Za zrcadlem v koupelně vedeš čárky dál. Nikdo ti je nezatírá.',
      'Někdy, kolem třetí ráno, se vzbudíš a máš pocit, že se na tebe někdo dívá. Z velký dálky. Zevnitř. A že mává.'
    ]
  });

  end('amnesia', {
    time: function (s) { return ['Den 1', '06:47']; }, mood: 'bleak',
    text: function (s) {
      return [
        s.day === 1 ? 'Hlas za dveřma zněl jako ty. Poradil ti jako ty. Prášek zabere za dvacet minut.' : 'Jsi unavenej. Jednu noc. Jen jednu noc to zaspat.',
        'Ve 03:14 se nad tvou postelí otevře strop. Spíš. Něco sestoupí do pokoje, chvíli stojí u postele a dívá se, jak dejcháš.',
        '! „Dobrou. Zítra to zkusíme znova. Od začátku.“',
        '= 06:47',
        'Budí tě ticho. Žádná auta, žádnej soused s vrtačkou. Jen lednička.',
        'Na lince stojí hrnek s kávou, kouří se z ní. Vchodový dveře jsou odemčený. Večer jsi zamykal. Víš to jistě.',
        'Za zrcadlem v koupelně přibyla jedna čárka.'
      ];
    }
  });

  end('blind', {
    time: function (s) { return ['Den 1', '06:47']; }, mood: 'bleak',
    enter: function (s, P) { P.carv = P.carv || {}; P.carv.blind = true; },
    text: [
      'Propiska, blok, oči zavřený. Píšeš přes sebe, řádky se křížej. Světlo. Hlasy. Teplo zleva. Lino se prohnulo. Nedívej se nedívej se nedívej se.',
      'Brada jde nahoru sama. Zabodneš si propisku do stehna a píšeš dál.',
      'Nepodíval ses. Ale taky ses nerozhodl. Jen jsi zapisoval. Když světlo zhasne, tma tě vezme s sebou jako každou noc.',
      '= 06:47',
      'Budí tě ticho. Jen lednička. Nepamatuješ si nic.',
      'Jen v posteli, pod polštářem, leží zmuchlanej list počmáranej přes sebe. Skoro nic se nedá přečíst. Jen čtyři slova, obtažený tolikrát, že protrhly papír:',
      '~ pod postel. hned. nedívej se. nespi.'
    ]
  });

  // =====================================================================
  //  CO VÍM: stopy se odvozují ze stavu, nic se neukládá zvlášť
  // =====================================================================
  var QUESTIONS = [
    ['q1', 'Co se stalo ve 03:14?'],
    ['q2', 'Proč jsem tu zůstal já?'],
    ['q3', 'Co je to nahoře?'],
    ['q4', 'Proč se ten den opakuje?'],
    ['q5', 'Kdo chodí do mého bytu a kdo píše lístky?'],
    ['q6', 'Jak to skončit?']
  ];
  var CLUES = [
    { id: 'cams', q: 'q1', has: function (s) { return s.sawCams; }, t: 'Všichni zmizeli ve stejnou vteřinu. Na posledním snímku se dívají stejným směrem.' },
    { id: 'baby', q: 'q1', has: function (s) { return s.done.nextdoor; }, t: 'Podívali se i ti, co spali. Něco je vzbudilo.' },
    { id: 'point', q: 'q1', has: function (s) { return s.knowsPoint; }, t: 'Nedívali se do nebe. Dívali se na jedno místo: byt ve čtvrtém patře, přímo nad mou postelí.' },

    { id: 'slept', q: 'q2', has: function (s) { return s.found; }, t: function (s) { return 'Lístek z boty tvrdí, že proto, že jsem spal.' + (s.done.nextdoor || s.knowsLamp ? ' To nesedí. Spali i jiní.' : ''); } },
    { id: 'lamp', q: 'q2', has: function (s) { return s.knowsLamp; }, t: 'Ležel jsem přímo pod tím. Pod prahem, ve slepém úhlu. Jako člověk pod lampou.' },
    { id: 'follow', q: 'q2', has: function (s) { return s.wasAway; }, t: 'Není to nad barákem. Je to nade mnou. Jde to se mnou.' },

    { id: 'consent', q: 'q3', has: function (s) { return s.found || s.waited || s.knowsWays; }, t: 'Do bytu to nemůže a nic mi neudělá. Potřebuje, abych se podíval sám a dobrovolně.' },
    { id: 'star', q: 'q3', has: function (s) { return s.done.mailbox; }, t: 'Soused Hrubeš je astronom. Šest týdnů sledoval nový bod přímo nad barákem.' },
    { id: 'parallax', q: 'q3', has: function (s) { return s.done.forum; }, t: 'Nebylo to na obloze. Podle jeho výpočtu to viselo pár metrů od něj, u stropu. Na fotkách jen přepálený bod.' },
    { id: 'grows', q: 'q3', has: function (s) { return s.done.diary; }, t: 'Sílí to, když se na to někdo dívá. Čím víc lidí, tím víc. Bez pohledu slábne.' },
    { id: 'worlds', q: 'q3', has: function (s) { return s.done.diary || s.q.why; }, t: 'Na obloze přibyly stovky stejných bodů. Každý z nich je nejspíš jeden hotový svět.' },
    { id: 'voice', q: 'q3', has: function (s) { return s.q.pc || s.offerDay !== null; }, t: 'Číslo 0314 je jeho hlas, soused jeho ruka. Skoro nelže. Řekne pravdu, když se mu hodí.' },
    { id: 'choice', q: 'q3', has: function (s) { return s.q.animals; }, t: 'Zvířata se dívají taky, ale nevědí na co. To se nepočítá. Musí to být rozhodnutí.' },

    { id: 'loop', q: 'q4', has: function (s) { return s.knowsLoop; }, t: 'Nejsem tu poprvé. Z bloku chybí stránky a nepamatuju si, že bych je psal.' },
    { id: 'reset', q: 'q4', has: function (s) { return s.found; }, t: 'Ve 03:14 se všechno vrátí. Zůstane jen to, co je psané rukou nebo vyryté.' },
    { id: 'animals', q: 'q4', has: function (s) { return s.animals; }, t: 'Zvířata si pamatují. Žijí ten samý den už dlouho a znají ho nazpaměť.' },
    { id: 'decide', q: 'q4', has: function (s) { return s.nights >= 1; }, t: 'Kdo ve 03:14 nespí a nepodívá se, ten si pamatuje.' },
    { id: 'tally', q: 'q4', has: function (s) { return s.done.cellar; }, t: 'V kóji 7 je přes čtyři sta čárek. Dvakrát už jsem šel nahoru.' },
    { id: 'half', q: 'q4', has: function (s) { return s.metNight; }, t: 'Kdysi jsem se podíval napůl a uhnul. Tím se zasekly dveře. Ta smyčka je moje, ne jeho.' },

    { id: 'inside', q: 'q5', has: function (s) { return s.sawLock; }, t: 'Dveře jsou každé ráno odemčené zevnitř.' },
    { id: 'seven', q: 'q5', has: function (s) { return s.knowsSeven; }, t: 'Od pokusu 8 píšu sedmičku bez čárky. Lístek s čárkou není ode mě.' },
    { id: 'hand', q: 'q5', has: function (s) { return s.sawHand || s.q.pc; }, t: 'Lístky pod dveře strká soused. Mým písmem, s hlavou zvrácenou ke stropu.' },
    { id: 'self', q: 'q5', has: function (s) { return s.knowsSelf; }, t: 'Vstávám já. Mezi 03:14 a 06:47 zatírám vlastní vzkazy a nevím o tom.' },
    { id: 'reads', q: 'q5', has: function (s) { return s.metNight; }, t: 'Zatírá je, protože ono čte všechno, co čtu já.' },

    { id: 'mirror', q: 'q6', has: function (s) { return s.done.scrape; }, t: 'Zrcadlo ve 03:14 nepomůže. Už jsem to zkusil.' },
    { id: 'daydoor', q: 'q6', has: function (s) { return s.q.pa; }, t: 'Ve dne nahoře žádné dveře nejsou, jen jeho ruka. Dveře tam jsou jednu minutu, ve 03:14.' },
    { id: 'ways', q: 'q6', has: function (s) { return s.knowsWays; }, t: 'Tři cesty. Podívat se. Nechat nočního dokoukat a zůstat sám. Nebo stát ve 03:14 v tom bodě se zavřenýma očima, zatímco se on podívá ven.' },
    { id: 'fourth', q: 'q6', has: function (s) { return s.knowsFourth && (s.metNight || s.q.fourth); }, t: 'Čtvrtá cesta: když mu předám řízení, nemusí mi ho vrátit.' },
    { id: 'offer', q: 'q6', has: function (s) { return s.offerDay !== null; }, t: 'Nabídka: nechat nočního dokoukat, výměnou za jednoho člověka. Čím déle čekám, tím je menší.' },
    { id: 'fear', q: 'q6', has: function (s) { return s.fortyTwo; }, t: 'Stovky dní nenabízelo nic. Teď nabízí. Bojí se třetí cesty.' },
    { id: 'seen', q: 'q6', has: function (s) { return s.done.diary; }, t: 'Hrubeš si zapsal: světlo jde oběma směry. Kdo se dívá, je taky vidět.' }
  ];
  function clueText(c, s) { return typeof c.t === 'function' ? c.t(s) : c.t; }
  function clueIds(s) { return CLUES.filter(function (c) { return !!c.has(s); }).map(function (c) { return c.id; }); }
  function notebook(s) {
    var found = 0;
    var groups = QUESTIONS.map(function (q) {
      var mine = CLUES.filter(function (c) { return c.q === q[0]; });
      var have = mine.filter(function (c) { return !!c.has(s); });
      found += have.length;
      return { title: q[1], items: have.map(function (c) { return clueText(c, s); }), missing: mine.length - have.length };
    });
    return { found: found, total: CLUES.length, groups: groups };
  }
  function clueById(id, s) { var c = CLUES.filter(function (x) { return x.id === id; })[0]; return c ? clueText(c, s) : ''; }

  root.STORY = { N: N, ENDINGS: ENDINGS, newState: newState, START: 'start', clueIds: clueIds, clueById: clueById, notebook: notebook };
})(typeof window !== 'undefined' ? window : globalThis);
