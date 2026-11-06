/* Brandeglio — mappe interattive (contrade e sentieri).
   Disegna in SVG i dati di js/mappa-dati.js (OpenStreetMap) e i contenuti qui sotto.
   Per spostare un punto basta correggere lat/lon; per aggiungere Bucini, scrivere le sue coordinate
   al posto di null nella voce "bucini". */
(function () {
  "use strict";
  var D = window.BRANDEGLIO_MAPDATA;
  if (!D) return;
  var NS = "http://www.w3.org/2000/svg";

  function toXY(lat, lon) { return [(lon - D.origin[1]) * 111320 * D.cos, -(lat - D.origin[0]) * 111320]; }
  function lang() { return document.documentElement.lang === "en" ? "en" : "it"; }
  function T(o) { return o == null ? "" : (typeof o === "string" ? o : (o[lang()] || o.it)); }

  /* ------------------------------------------------------------------ testi */
  var UI = {
    zoomIn: { it: "Ingrandisci", en: "Zoom in" },
    zoomOut: { it: "Riduci", en: "Zoom out" },
    reset: { it: "Centra la mappa", en: "Re-centre the map" },
    wheel: { it: "Per lo zoom usa Ctrl + rotellina, il pizzico o i pulsanti", en: "To zoom, use Ctrl + scroll, pinch or the buttons" },
    mapPaese: { it: "Mappa delle contrade di Brandeglio", en: "Map of the districts of Brandeglio" },
    mapSentieri: { it: "Mappa dei sentieri intorno a Brandeglio", en: "Map of the trails around Brandeglio" },
    gPaese: { it: "Nel paese", en: "In the village" },
    gIntorno: { it: "Intorno al paese", en: "Around the village" },
    gStays: { it: "Dove dormire", en: "Where to stay" },
    gTrails: { it: "Sentieri", en: "Trails" },
    introPaese: { it: "Tocca un nome nell'elenco o un punto sulla mappa per leggerne la scheda. I nomi delle contrade vengono dalla cartografia storica raccolta dal Comune di Bagni di Lucca.", en: "Tap a name in the list or a point on the map to read about it. The district names come from the historic maps collected by the Municipality of Bagni di Lucca." },
    introSentieri: { it: "Scegli un sentiero per vederne il percorso sulla mappa, il profilo altimetrico e i dati.", en: "Choose a trail to see its route on the map, its elevation profile and key figures." },
    km: { it: "Distanza", en: "Distance" },
    up: { it: "Salita", en: "Ascent" },
    down: { it: "Discesa", en: "Descent" },
    max: { it: "Quota max", en: "Highest point" },
    oneway: { it: "Andata", en: "One way" },
    rt: { it: "Andata e ritorno", en: "Return trip" },
    diff: { it: "Difficoltà", en: "Difficulty" },
    diffE: { it: "E – escursionistico (indicativa)", en: "E – hiking trail (indicative)" },
    start: { it: "Partenza", en: "Start" },
    road: { it: "su strada asfaltata", en: "on tarmac road" },
    gpx: { it: "Scarica la traccia GPX", en: "Download the GPX track" },
    gpxNote: { it: "La traccia GPX si scarica dal sito pubblicato.", en: "The GPX track can be downloaded from the published website." },
    osm: { it: "Apri in OpenStreetMap", en: "Open in OpenStreetMap" },
    site: { it: "Sito e prenotazioni", en: "Website and booking" },
    unplaced: { it: "Posizione sulla mappa da inserire.", en: "Map position still to be added." },
    warn: { it: "Percorso ricavato da OpenStreetMap: verifica la segnaletica sul posto, porta acqua e calzature adatte. Tempi e dislivelli sono stime.", en: "Route taken from OpenStreetMap: check the signs on site and bring water and proper footwear. Times and elevation figures are estimates." },
    profile: { it: "Profilo altimetrico", en: "Elevation profile" },
    showAll: { it: "Torna alla presentazione", en: "Back to overview" }
  };

  var CAT = {
    piazza: { it: "Luogo d'incontro", en: "Meeting place" },
    acqua: { it: "Acqua", en: "Water" },
    culto: { it: "Culto e devozione", en: "Worship" },
    difesa: { it: "Difesa", en: "Defence" },
    rilievo: { it: "Rilievo", en: "Landform" },
    toponimo: { it: "Toponimo storico", en: "Historic place name" },
    ospitale: { it: "Ospitalità medievale", en: "Medieval hospice" },
    via: { it: "Contrada", en: "District" },
    stay: { it: "Alloggio", en: "Accommodation" },
    trail: { it: "Sentiero", en: "Trail" }
  };

  var CONTRADE = [
    { id: "piazza", group: "paese", cat: "piazza", lat: 44.00019, lon: 10.63700, side: "b",
      name: { it: "Alla Piazza", en: "Alla Piazza (the square)" },
      text: { it: "Il cuore del paese, oggi Piazza Santa Maria: la fontana con l'iscrizione di F. Cianelli, la Cappella della Madonna delle Grazie detta «La Margine» e il monumento ai caduti. Qui si svolge la Festa di Santa Maria.",
              en: "The heart of the village, today Piazza Santa Maria: the fountain with the inscription by F. Cianelli, the Chapel of the Madonna delle Grazie known as «La Margine» and the war memorial. This is where the Feast of Santa Maria takes place." } },
    { id: "chiesa", group: "paese", cat: "culto", lat: 44.00098, lon: 10.63784, side: "r", church: true,
      name: { it: "La Chiesa", en: "The Church" },
      text: { it: "Santa Maria Assunta, ricordata dal 1260. L'edificio attuale fu costruito nel centro del paese «per maggior comodità del popolo» e rimaneggiato nel 1903, quando si cominciò il campanile. All'interno, la pala dell'Assunzione di Giovanni Maria Graziani (1546).",
              en: "Santa Maria Assunta, recorded since 1260. The present building was put up in the centre of the village «for the greater convenience of the people» and remodelled in 1903, when the bell tower was begun. Inside is the Assumption altarpiece by Giovanni Maria Graziani (1546)." } },
    { id: "pozzo", group: "paese", cat: "acqua", lat: 44.00057, lon: 10.63665, side: "l",
      name: { it: "Al Pozzo", en: "Al Pozzo (the well)" },
      text: { it: "Il nome ricorda il pozzo che dava acqua a questa parte del paese.", en: "The name recalls the well that supplied water to this part of the village." } },
    { id: "croce", group: "paese", cat: "culto", lat: 44.00009, lon: 10.63598, side: "b",
      name: { it: "Alla Croce", en: "Alla Croce (the cross)" },
      text: { it: "Contrada di tradizione devozionale sul lato occidentale del paese. Il nome sopravvive in via della Croce.", en: "A district with a devotional tradition on the western side of the village. The name lives on in Via della Croce." } },
    { id: "porta", group: "paese", cat: "difesa", lat: 44.00067, lon: 10.63783, side: "r",
      name: { it: "Alla Porta", en: "Alla Porta (the gate)" },
      text: { it: "Il nome ricorda una porta del borgo fortificato. Il castello di Brandeglio («Castrum Brandelli») è documentato dal 1312 e nel 1398 era ancora tra le fortezze di confine della Repubblica di Lucca.", en: "The name recalls a gate of the fortified village. Brandeglio castle («Castrum Brandelli») is recorded from 1312, and in 1398 it was still one of the border fortresses of the Republic of Lucca." } },
    { id: "portasotto", group: "paese", cat: "difesa", lat: 44.00143, lon: 10.63899, side: "r",
      name: { it: "Alla Porta di sotto", en: "Alla Porta di sotto (the lower gate)" },
      text: { it: "Una seconda porta, sul lato più basso del paese. Le mura del castello erano ancora visibili nel Seicento; oggi non se ne conoscono tracce sicure.", en: "A second gate, on the lower side of the village. The castle walls could still be seen in the 17th century; no certain traces are known today." } },
    { id: "colletto", group: "paese", cat: "rilievo", lat: 44.00091, lon: 10.63815, side: "t",
      name: { it: "Al Colletto", en: "Al Colletto (the little hill)" },
      text: { it: "La piccola altura accanto alla chiesa da cui prende il nome.", en: "The small rise next to the church that gives the district its name." } },
    { id: "monticchioro", group: "paese", cat: "rilievo", lat: 44.00026, lon: 10.63677, side: "l",
      name: { it: "Monticchioro", en: "Monticchioro" },
      text: { it: "Il nome di un piccolo rilievo nel centro del paese, a ridosso della piazza.", en: "The name of a small rise in the centre of the village, just above the square." } },
    { id: "sardigna", group: "paese", cat: "toponimo", lat: 44.00054, lon: 10.63699, side: "t",
      name: { it: "In Sardigna", en: "In Sardigna" },
      text: { it: "Antico nome di una contrada del centro, registrato nelle mappe storiche. L'origine del nome non è nota.", en: "An old name for a district in the centre, recorded on historic maps. Its origin is unknown." } },
    { id: "crocca", group: "paese", cat: "toponimo", lat: 44.00089, lon: 10.63565, side: "l",
      name: { it: "A Crocca", en: "A Crocca" },
      text: { it: "Toponimo storico sul lato occidentale dell'abitato.", en: "A historic place name on the western edge of the village." } },
    { id: "nellora", group: "paese", cat: "toponimo", lat: 44.00184, lon: 10.63556, side: "l",
      name: { it: "A Nellora", en: "A Nellora" },
      text: { it: "Toponimo storico a nord-ovest del paese, verso il colle di Montaglione.", en: "A historic place name north-west of the village, towards the Montaglione hill." } },
    { id: "bucini", group: "paese", cat: "via", lat: null, lon: null,
      name: { it: "Bucini", en: "Bucini" },
      text: { it: "La contrada di via Bucini.", en: "The district of Via Bucini." } },

    { id: "montaglioni", group: "intorno", cat: "rilievo", lat: 44.00403, lon: 10.63293, side: "l",
      name: { it: "Montaglioni", en: "Montaglioni" },
      text: { it: "Il primo nucleo che si incontra salendo dalla statale, con la cappellina della Santissima Annunziata, sotto il colle di Montaglione. Alle pendici del colle passava l'antica via che dal fondovalle saliva a Brandeglio.", en: "The first cluster of houses you reach coming up from the main road, with the little chapel of the Santissima Annunziata, below the Montaglione hill. The old road from the valley floor to Brandeglio ran along the foot of the hill." } },
    { id: "castelvecchio", group: "intorno", cat: "difesa", lat: 44.00604, lon: 10.63137, side: "l",
      name: { it: "Castel Vecchio", en: "Castel Vecchio" },
      text: { it: "Il nome fa pensare a una seconda fortificazione, ipotizzata dallo storico Emilio Romiti; sul terreno non ne sono state trovate tracce.", en: "The name suggests a second fortification, proposed by the historian Emilio Romiti; no traces have been found on the ground." } },
    { id: "santo", group: "intorno", cat: "culto", lat: 44.00668, lon: 10.63720, side: "r",
      name: { it: "Al Santo", en: "Al Santo" },
      text: { it: "Ruderi della chiesa di San Michele e dello Spirito Santo, nel bosco a nord del paese. Forse è l'antica parrocchiale di Santa Maria, che nel 1553 si diceva abbandonata «da tempo immemorabile», a mezzo miglio dal paese. Il sentiero per il Rio dell'Acqua Buona passa a circa 100 metri.", en: "Ruins of the church of San Michele and the Holy Spirit, in the woods north of the village. It may be the old parish church of Santa Maria, described in 1553 as abandoned «since time immemorial», half a mile from the village. The trail to the Rio dell'Acqua Buona passes about 100 metres away." } },
    { id: "basilica", group: "intorno", cat: "culto", lat: 44.00917, lon: 10.63739, side: "r",
      name: { it: "Basilica", en: "Basilica" },
      text: { it: "Il «loco Basirica» di un documento del 985, dove sorgeva una chiesa di Santa Maria dipendente dalla pieve di Casabasciana.", en: "The «loco Basirica» of a document from 985, site of a church of Santa Maria that belonged to the parish of Casabasciana." } },
    { id: "spedaletto", group: "intorno", cat: "ospitale", lat: 44.01298, lon: 10.62177, side: "r",
      name: { it: "Allo Spedaletto", en: "Allo Spedaletto" },
      text: { it: "Qui sorgeva l'ospedale di San Francesco a Cruciana, ricovero per i viandanti citato nel 1260 e già in rovina nel 1467. Ne resta il nome di Pian di Ospedaletto.", en: "Site of the hospice of San Francesco a Cruciana, a shelter for travellers recorded in 1260 and already in ruins by 1467. Its memory survives in the name Pian di Ospedaletto." } }
  ];

  var STAYS = [
    { id: "canonica", group: "stays", cat: "stay", lat: 44.00126, lon: 10.638317, side: "r", stay: true,
      name: { it: "La Canonica", en: "La Canonica" },
      url: "https://to-tuscany.com/lacanonica/",
      text: { it: "Villa in pietra all'estremità del paese: 6 camere, fino a 12 ospiti, piscina privata e giardino terrazzato. Consigliata dal Comitato.", en: "Stone villa at the edge of the village: 6 bedrooms, up to 12 guests, private pool and terraced garden. Recommended by the Committee." } },
    { id: "villette", group: "stays", cat: "stay", lat: 44.001468, lon: 10.638874, side: "r", stay: true,
      name: { it: "Le villette di Brandeglio", en: "The Brandeglio cottages" },
      url: "https://to-tuscany.com/brandeglio/ciliegio",
      text: { it: "Quattro villette con una camera (2 ospiti ciascuna) intorno a un giardino terrazzato con piscina condivisa.", en: "Four one-bedroom cottages (2 guests each) around a terraced garden with a shared pool." } }
  ];

  var VILLAGES = [
    { n: "Brandeglio", lat: 44.00035, lon: 10.63773, main: true },
    { n: "Boveglio", lat: 43.96811, lon: 10.64169 },
    { n: "Casabasciana", lat: 44.01709, lon: 10.65182 },
    { n: "Crasciana", lat: 44.00569, lon: 10.66309 },
    { n: "Benabbio", lat: 43.9988, lon: 10.60359 },
    { n: "Pian di Ospedaletto", lat: 44.01279, lon: 10.6216 },
    { n: "Fabbriche di Casabasciana", lat: 44.02296, lon: 10.63842 }
  ];

  var WATER = { "Torrente Lima": [44.0243, 10.6300], "Torrente Diana": null, "Torrente Liegora": null,
                "Rio dell'Acqua Buona": null, "Acqua di Rialto": [44.0038, 10.6782], "Rio Ceppa": null };

  var TRAIL_TEXT = {
    boveglio: {
      color: 1,
      name: { it: "Brandeglio – Boveglio", en: "Brandeglio – Boveglio" },
      start: { it: "Piazza Santa Maria, Brandeglio", en: "Piazza Santa Maria, Brandeglio" },
      text: { it: "Dalla piazza si prendono le mulattiere che salgono verso sud nel bosco di castagni, fino a circa 750 metri, e poi si scende su Boveglio, paese del comune di Villa Basilica. L'ultimo tratto è sulla strada provinciale. Il percorso segue in parte l'antica via che da Brandeglio, per le Pizzorne, portava a Villa Basilica.",
              en: "From the square, mule tracks climb south through the chestnut woods to about 750 metres, then drop down to Boveglio, a village in the municipality of Villa Basilica. The last stretch is on the provincial road. The route partly follows the old way that led from Brandeglio over the Pizzorne to Villa Basilica." } },
    acquabuona: {
      color: 2,
      name: { it: "Brandeglio – Rio dell'Acqua Buona", en: "Brandeglio – Rio dell'Acqua Buona" },
      start: { it: "Piazza Santa Maria, Brandeglio", en: "Piazza Santa Maria, Brandeglio" },
      text: { it: "Una passeggiata breve verso nord: dal paese una carrareccia e poi un sentiero scendono nel bosco fino al Rio dell'Acqua Buona, passando a circa 100 metri dai ruderi del Santo. Il ritorno è in salita sulla stessa strada.",
              en: "A short walk north: from the village a cart track and then a path lead down through the woods to the Rio dell'Acqua Buona stream, passing about 100 metres from the «Al Santo» ruins. The way back climbs along the same route." } },
    rialto: {
      color: 3,
      name: { it: "Crasciana – Acqua di Rialto", en: "Crasciana – Acqua di Rialto" },
      start: { it: "Imbocco della Via di Rialto, Crasciana (raggiungibile in auto)", en: "Start of the Via di Rialto, Crasciana (reachable by car)" },
      text: { it: "Da Brandeglio non c'è un sentiero diretto: si raggiunge Crasciana in auto. Dall'imbocco della Via di Rialto, al margine del paese, una carrareccia e poi un sentiero a mezza costa portano nella valle dove nasce l'Acqua di Rialto.",
              en: "There is no direct trail from Brandeglio, so drive to Crasciana. From the start of the Via di Rialto, at the edge of the village, a cart track and then a hillside path lead into the valley where the Acqua di Rialto stream rises." } }
  };

  var TRAILS = (D.trails || []).map(function (t) {
    var extra = TRAIL_TEXT[t.id] || {};
    var o = {};
    Object.keys(t).forEach(function (k) { o[k] = t[k]; });
    Object.keys(extra).forEach(function (k) { o[k] = extra[k]; });
    o.cat = "trail"; o.group = "trails"; o.trail = true;
    o.xy = t.pts.split(" ").map(function (p) { return p.split(",").map(Number); });
    return o;
  });

  [CONTRADE, STAYS].forEach(function (list) {
    list.forEach(function (it) { it.xy = it.lat == null ? null : toXY(it.lat, it.lon); });
  });
  VILLAGES.forEach(function (v) { v.xy = toXY(v.lat, v.lon); });

  /* ------------------------------------------------------------------ utilità */
  function svg(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(e);
    return e;
  }
  function html(tag, cls, parent, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function fmtMin(m) {
    m = Math.round(m / 5) * 5;
    if (m < 60) return "~" + m + " min";
    var h = Math.floor(m / 60), r = m % 60;
    return "~" + h + " h" + (r ? " " + r + " min" : "");
  }
  function fmtKm(k) { return (lang() === "it" ? String(k).replace(".", ",") : String(k)) + " km"; }
  function osmUrl(lat, lon) { return "https://www.openstreetmap.org/?mlat=" + lat + "&mlon=" + lon + "#map=18/" + lat + "/" + lon; }
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var IN_PREVIEW = /claude|anthropic/i.test(location.hostname);

  /* ------------------------------------------------------------------ mappa */
  function BMap(root) {
    var kind = root.getAttribute("data-map");
    var self = this;
    this.kind = kind;
    this.items = kind === "paese" ? CONTRADE.concat(STAYS) : TRAILS.slice();
    this.byId = {};
    this.items.forEach(function (it) { self.byId[it.id] = it; });
    this.selected = null;
    this.home = kind === "paese" ? { cx: -25, cy: -55, w: 480 } : { cx: 600, cy: 520, w: 7600 };

    root.innerHTML = "";
    root.classList.add("bmap");
    var stage = html("div", "bmap-stage", root);
    this.stage = stage;
    this.svg = svg("svg", { role: "img", "class": "bmap-svg" }, stage);
    var tools = html("div", "bmap-tools", stage);
    this.btnIn = html("button", "bmap-btn", tools, "+");
    this.btnOut = html("button", "bmap-btn", tools, "−");
    this.btnReset = html("button", "bmap-btn", tools);
    this.btnReset.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="7"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/></svg>';
    [this.btnIn, this.btnOut, this.btnReset].forEach(function (b) { b.type = "button"; });
    this.hint = html("div", "bmap-hint", stage);
    this.hint.hidden = true;
    var attr = html("div", "bmap-attrib", stage);
    attr.innerHTML = '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>';
    var scale = html("div", "bmap-scale", stage);
    this.scaleBar = html("span", "bmap-scale-bar", scale);
    this.scaleText = html("span", "bmap-scale-text", scale);

    var side = html("div", "bmap-side", root);
    this.detail = html("div", "bmap-detail", side);
    this.detail.setAttribute("aria-live", "polite");
    this.listWrap = html("div", "bmap-list", side);

    this.drawBase();
    this.drawItems();
    this.bind();
    this.vb = null;
    this.fitHome(false);
    this.renderTexts();
    if (window.ResizeObserver) new ResizeObserver(function () { self.onResize(); }).observe(stage);
    else window.addEventListener("resize", function () { self.onResize(); });
  }

  BMap.prototype.drawBase = function () {
    var L = D.layers, s = this.svg;
    var gBase = svg("g", { "class": "m-base" }, s);
    function lines(key, cls, parent) {
      (L[key] || []).forEach(function (p) { svg("polyline", { points: p, "class": cls }, parent); });
    }
    var gW = svg("g", {}, gBase);
    lines("stream", "m-stream", gW); lines("river", "m-river", gW);
    var gB = svg("g", {}, gBase);
    (L.bld || []).forEach(function (p) { svg("polygon", { points: p, "class": "m-bld" }, gB); });
    var gT = svg("g", {}, gBase);
    lines("t", "m-track", gT); lines("p", "m-path", gT);
    var gC = svg("g", {}, gBase);
    ["r4", "r3", "r2", "r1"].forEach(function (k) { lines(k, "m-case m-" + k, gC); });
    var gR = svg("g", {}, gBase);
    ["r4", "r3", "r2", "r1"].forEach(function (k) { lines(k, "m-road m-" + k, gR); });

    // etichette dei torrenti
    this.waterLabels = [];
    var gWL = svg("g", { "class": "m-wlabels" }, s);
    var self = this;
    var fromData = {};
    (D.waterLabels || []).forEach(function (w) { fromData[w.n] = [w.x, w.y]; });
    Object.keys(WATER).forEach(function (name) {
      var pos = WATER[name] ? toXY(WATER[name][0], WATER[name][1]) : fromData[name];
      if (!pos) return;
      var t = svg("text", { "class": "m-wlabel" }, gWL);
      t.textContent = name;
      self.waterLabels.push({ el: t, x: pos[0], y: pos[1], text: name });
    });
    // nomi dei paesi
    this.villageLabels = [];
    var gV = svg("g", { "class": "m-villages" }, s);
    if (this.kind === "sentieri") {
      VILLAGES.forEach(function (v) {
        var dot = svg("circle", { "class": "m-vdot" + (v.main ? " is-main" : "") }, gV);
        var t = svg("text", { "class": "m-vlabel" + (v.main ? " is-main" : "") }, gV);
        t.textContent = v.n;
        self.villageLabels.push({ el: t, dot: dot, x: v.xy[0], y: v.xy[1], text: v.n, main: v.main });
      });
    }
  };

  BMap.prototype.drawItems = function () {
    var self = this, s = this.svg;
    var gTr = svg("g", { "class": "m-trails" }, s);
    var gP = svg("g", { "class": "m-points" }, s);
    this.items.forEach(function (it) {
      if (it.trail) {
        var pts = it.pts;
        var g = svg("g", { "class": "m-trail c" + it.color, "data-id": it.id }, gTr);
        svg("polyline", { points: pts, "class": "m-trail-case" }, g);
        svg("polyline", { points: pts, "class": "m-trail-line" }, g);
        svg("polyline", { points: pts, "class": "m-trail-hit" }, g);
        it.startDot = svg("circle", { "class": "m-trail-start" }, g);
        it.endDot = svg("circle", { "class": "m-trail-end" }, g);
        it.g = g;
        g.addEventListener("click", function () { if (!self.dragged) self.select(it.id, { fit: true, from: "map" }); });
        return;
      }
      if (!it.xy) return;
      var cls = "m-pt" + (it.stay ? " is-stay" : "") + (it.church ? " is-church" : "") + (it.group === "intorno" ? " is-out" : "");
      var gp = svg("g", { "class": cls, "data-id": it.id }, gP);
      it.hit = svg("circle", { "class": "m-pt-hit" }, gp);
      it.mark = it.stay ? svg("rect", { "class": "m-pt-mark" }, gp) : svg("circle", { "class": "m-pt-mark" }, gp);
      it.label = svg("text", { "class": "m-pt-label" }, gp);
      it.g = gp;
      gp.addEventListener("click", function () { if (!self.dragged) self.select(it.id, { from: "map" }); });
    });
  };

  /* ---------- vista ---------- */
  BMap.prototype.size = function () {
    var r = this.stage.getBoundingClientRect();
    return { W: Math.max(1, r.width), H: Math.max(1, r.height) };
  };
  BMap.prototype.setView = function (cx, cy, w) {
    var sz = this.size();
    var bb = D.bbox; // [xmin, ymin, xmax, ymax]
    w = Math.max(this.kind === "paese" ? 120 : 400, Math.min(w, 9000));
    var h = w * sz.H / sz.W;
    cx = Math.max(bb[0], Math.min(bb[2], cx));
    cy = Math.max(bb[1], Math.min(bb[3], cy));
    this.vb = { cx: cx, cy: cy, w: w, h: h };
    this.svg.setAttribute("viewBox", (cx - w / 2) + " " + (cy - h / 2) + " " + w + " " + h);
    this.layout();
  };
  BMap.prototype.animateTo = function (cx, cy, w, animate) {
    var self = this, a = this.vb;
    if (!a || !animate || reduceMotion) { this.setView(cx, cy, w); return; }
    var t0 = performance.now(), dur = 450;
    cancelAnimationFrame(this.raf);
    function step(t) {
      var p = Math.min(1, (t - t0) / dur), e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      var lw = Math.exp(Math.log(a.w) + (Math.log(w) - Math.log(a.w)) * e);
      self.setView(a.cx + (cx - a.cx) * e, a.cy + (cy - a.cy) * e, lw);
      if (p < 1) self.raf = requestAnimationFrame(step);
    }
    this.raf = requestAnimationFrame(step);
  };
  BMap.prototype.fitHome = function (animate) {
    var h = this.home, sz = this.size();
    var w = h.w;
    if (sz.W / sz.H < 1.05) w = h.w * 1.05; // schermi stretti: un poco più largo
    this.animateTo(h.cx, h.cy, w, animate);
  };
  BMap.prototype.fitBounds = function (xs, ys, pad, animate) {
    var sz = this.size();
    var x0 = Math.min.apply(null, xs), x1 = Math.max.apply(null, xs);
    var y0 = Math.min.apply(null, ys), y1 = Math.max.apply(null, ys);
    var w = Math.max((x1 - x0) * pad, (y1 - y0) * pad * sz.W / sz.H, 300);
    this.animateTo((x0 + x1) / 2, (y0 + y1) / 2, w, animate);
  };
  BMap.prototype.zoom = function (f, px, py) {
    var v = this.vb, sz = this.size();
    var mx = px == null ? v.cx : v.cx - v.w / 2 + px / sz.W * v.w;
    var my = py == null ? v.cy : v.cy - v.h / 2 + py / sz.H * v.h;
    var nw = v.w / f;
    this.setView(mx + (v.cx - mx) / f, my + (v.cy - my) / f, nw);
  };
  BMap.prototype.onResize = function () {
    if (!this.vb) return;
    this.setView(this.vb.cx, this.vb.cy, this.vb.w);
  };

  /* ---------- disposizione di simboli ed etichette (dimensione costante sullo schermo) ---------- */
  BMap.prototype.layout = function () {
    var v = this.vb, sz = this.size(), k = v.w / sz.W, self = this;
    var x0 = v.cx - v.w / 2, y0 = v.cy - v.h / 2;
    function scr(x, y) { return [(x - x0) / k, (y - y0) / k]; }
    var boxes = [];
    function free(b) {
      if (b[0] < 2 || b[1] < 2 || b[2] > sz.W - 2 || b[3] > sz.H - 2) return false;
      for (var i = 0; i < boxes.length; i++) {
        var o = boxes[i];
        if (b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]) return false;
      }
      return true;
    }
    function place(el, x, y, text, fs, sides, gap) {
      var p = scr(x, y), tw = text.length * fs * 0.55 + 4, th = fs + 4;
      for (var i = 0; i < sides.length; i++) {
        var sd = sides[i], bx, by, anchor;
        if (sd === "r") { bx = [p[0] + gap, p[1] - th / 2, p[0] + gap + tw, p[1] + th / 2]; anchor = "start"; }
        else if (sd === "l") { bx = [p[0] - gap - tw, p[1] - th / 2, p[0] - gap, p[1] + th / 2]; anchor = "end"; }
        else if (sd === "t") { bx = [p[0] - tw / 2, p[1] - gap - th, p[0] + tw / 2, p[1] - gap]; anchor = "middle"; }
        else { bx = [p[0] - tw / 2, p[1] + gap, p[0] + tw / 2, p[1] + gap + th]; anchor = "middle"; }
        if (free(bx)) {
          boxes.push(bx);
          el.setAttribute("x", (x0 + (anchor === "start" ? bx[0] + 2 : anchor === "end" ? bx[2] - 2 : (bx[0] + bx[2]) / 2) * k));
          el.setAttribute("y", (y0 + (bx[1] + bx[3]) / 2 * k + fs * 0.36 * k));
          el.setAttribute("text-anchor", anchor);
          el.setAttribute("font-size", fs * k);
          el.style.display = "";
          return true;
        }
      }
      el.style.display = "none";
      return false;
    }
    function order(pref) { var all = ["r", "l", "t", "b"]; return [pref || "r"].concat(all.filter(function (s) { return s !== pref; })); }

    // simboli
    this.items.forEach(function (it) {
      if (it.trail) {
        it.startDot.setAttribute("cx", it.xy[0][0]); it.startDot.setAttribute("cy", it.xy[0][1]);
        it.startDot.setAttribute("r", 5 * k); it.startDot.setAttribute("stroke-width", 2 * k);
        var e = it.xy[it.xy.length - 1];
        it.endDot.setAttribute("cx", e[0]); it.endDot.setAttribute("cy", e[1]);
        it.endDot.setAttribute("r", 5 * k); it.endDot.setAttribute("stroke-width", 2 * k);
        return;
      }
      if (!it.xy) return;
      var sel = self.selected === it.id, r = (sel ? 7.5 : 5.5) * k;
      it.hit.setAttribute("cx", it.xy[0]); it.hit.setAttribute("cy", it.xy[1]); it.hit.setAttribute("r", 14 * k);
      if (it.stay) {
        var s = r * 1.7;
        it.mark.setAttribute("x", it.xy[0] - s / 2); it.mark.setAttribute("y", it.xy[1] - s / 2);
        it.mark.setAttribute("width", s); it.mark.setAttribute("height", s); it.mark.setAttribute("rx", 2 * k);
      } else {
        it.mark.setAttribute("cx", it.xy[0]); it.mark.setAttribute("cy", it.xy[1]); it.mark.setAttribute("r", r);
      }
      it.mark.setAttribute("stroke-width", (sel ? 3 : 2) * k);
      boxes.push((function () { var p = scr(it.xy[0], it.xy[1]); return [p[0] - 6, p[1] - 6, p[0] + 6, p[1] + 6]; })());
    });
    // villaggi
    this.villageLabels.forEach(function (v) {
      v.dot.setAttribute("cx", v.x); v.dot.setAttribute("cy", v.y); v.dot.setAttribute("r", (v.main ? 5 : 3.5) * k);
      v.dot.setAttribute("stroke-width", 1.5 * k);
      var p = scr(v.x, v.y); boxes.push([p[0] - 5, p[1] - 5, p[0] + 5, p[1] + 5]);
    });
    // etichette: prima la selezionata, poi paesi, poi punti, poi torrenti
    var sel = this.selected && this.byId[this.selected];
    var stroke = function (el, w) { el.setAttribute("stroke-width", w * k); };
    if (sel && !sel.trail && sel.xy) { place(sel.label, sel.xy[0], sel.xy[1], T(sel.name), 14, order(sel.side), 11); stroke(sel.label, 4); }
    this.villageLabels.forEach(function (v) { place(v.el, v.x, v.y, v.text, v.main ? 14 : 12.5, ["r", "l", "t", "b"], 8); stroke(v.el, 3.5); });
    var showPts = k < 2.2;
    this.items.forEach(function (it) {
      if (it.trail || !it.xy || it === sel) return;
      if (!showPts && !it.stay) { it.label.style.display = "none"; return; }
      place(it.label, it.xy[0], it.xy[1], T(it.name).replace(/ \(.*\)$/, ""), 12.5, order(it.side), 9);
      stroke(it.label, 3.5);
    });
    this.waterLabels.forEach(function (w) { place(w.el, w.x, w.y, w.text, 11, ["t", "b", "r", "l"], 2); stroke(w.el, 3); });

    // barra della scala
    var targetPx = 90, m = targetPx * k, pow = Math.pow(10, Math.floor(Math.log10(m))), n = m / pow;
    var nice = (n >= 5 ? 5 : n >= 2 ? 2 : 1) * pow;
    this.scaleBar.style.width = (nice / k) + "px";
    this.scaleText.textContent = nice >= 1000 ? (nice / 1000) + " km" : nice + " m";
  };

  /* ---------- interazione ---------- */
  BMap.prototype.bind = function () {
    var self = this, svgEl = this.svg, pointers = {}, last = null;
    this.btnIn.addEventListener("click", function () { self.zoom(1.6); });
    this.btnOut.addEventListener("click", function () { self.zoom(1 / 1.6); });
    this.btnReset.addEventListener("click", function () { self.fitHome(true); });

    var down = null;
    svgEl.addEventListener("pointerdown", function (e) {
      pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
      down = { x: e.clientX, y: e.clientY };
      self.dragged = false;
      last = null;
    });
    svgEl.addEventListener("pointermove", function (e) {
      if (!pointers[e.pointerId]) return;
      var prev = pointers[e.pointerId];
      var ids = Object.keys(pointers), sz = self.size(), k = self.vb.w / sz.W;
      if (ids.length === 1) {
        if (e.pointerType === "touch") return; // con un dito si scorre la pagina
        if (!self.dragged) {
          if (Math.hypot(e.clientX - down.x, e.clientY - down.y) < 4) return;
          self.dragged = true;
          try { svgEl.setPointerCapture(e.pointerId); } catch (err) { /* ignorato */ }
          svgEl.classList.add("is-dragging");
        }
        pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
        self.setView(self.vb.cx - (e.clientX - prev.x) * k, self.vb.cy - (e.clientY - prev.y) * k, self.vb.w);
      } else if (ids.length === 2) {
        pointers[e.pointerId] = { x: e.clientX, y: e.clientY };
        var a = pointers[ids[0]], b = pointers[ids[1]];
        var d = Math.hypot(a.x - b.x, a.y - b.y), mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
        if (last) {
          var r = self.stage.getBoundingClientRect();
          self.dragged = true;
          self.setView(self.vb.cx - (mx - last.mx) * k, self.vb.cy - (my - last.my) * k, self.vb.w);
          self.zoom(d / last.d, mx - r.left, my - r.top);
        }
        last = { d: d, mx: mx, my: my };
        e.preventDefault();
      }
    });
    function up(e) {
      delete pointers[e.pointerId]; last = null;
      svgEl.classList.remove("is-dragging");
      setTimeout(function () { self.dragged = false; }, 0);
    }
    svgEl.addEventListener("pointerup", up);
    svgEl.addEventListener("pointercancel", up);
    svgEl.addEventListener("wheel", function (e) {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        var r = self.stage.getBoundingClientRect();
        self.zoom(Math.exp(-e.deltaY * 0.004), e.clientX - r.left, e.clientY - r.top);
      } else {
        self.hint.textContent = T(UI.wheel);
        self.hint.hidden = false;
        clearTimeout(self.hintT);
        self.hintT = setTimeout(function () { self.hint.hidden = true; }, 1600);
      }
    }, { passive: false });
    document.addEventListener("brandeglio:langchange", function () { self.renderTexts(); });
  };

  BMap.prototype.select = function (id, opts) {
    opts = opts || {};
    var it = id && this.byId[id];
    this.selected = it ? id : null;
    var self = this;
    this.items.forEach(function (o) {
      if (o.g) o.g.classList.toggle("is-sel", o.id === self.selected);
      if (o.g && o.trail) o.g.classList.toggle("is-dim", !!self.selected && o.id !== self.selected);
    });
    if (it && it.trail) {
      this.fitBounds(it.xy.map(function (p) { return p[0]; }), it.xy.map(function (p) { return p[1]; }), 1.35, true);
    } else if (it && it.xy) {
      var v = this.vb, m = v.w * 0.12;
      var inside = it.xy[0] > v.cx - v.w / 2 + m && it.xy[0] < v.cx + v.w / 2 - m && it.xy[1] > v.cy - v.h / 2 + m && it.xy[1] < v.cy + v.h / 2 - m;
      var w = v.w;
      if (it.group === "intorno" && w < 700) w = 900;
      if (it.group !== "intorno" && w > 700) w = this.home.w;
      if (!inside || w !== v.w) this.animateTo(it.xy[0], it.xy[1], w, true);
      else this.layout();
    } else {
      this.layout();
    }
    this.renderDetail();
    this.renderList();
  };

  /* ---------- pannello ---------- */
  BMap.prototype.renderTexts = function () {
    this.svg.setAttribute("aria-label", T(this.kind === "paese" ? UI.mapPaese : UI.mapSentieri));
    this.btnIn.setAttribute("aria-label", T(UI.zoomIn)); this.btnIn.title = T(UI.zoomIn);
    this.btnOut.setAttribute("aria-label", T(UI.zoomOut)); this.btnOut.title = T(UI.zoomOut);
    this.btnReset.setAttribute("aria-label", T(UI.reset)); this.btnReset.title = T(UI.reset);
    this.items.forEach(function (it) { if (it.label) it.label.textContent = T(it.name).replace(/ \(.*\)$/, ""); });
    this.renderDetail();
    this.renderList();
    if (this.vb) this.layout();
  };

  BMap.prototype.renderList = function () {
    var self = this, wrap = this.listWrap;
    wrap.innerHTML = "";
    var groups = this.kind === "paese"
      ? [["paese", UI.gPaese], ["intorno", UI.gIntorno], ["stays", UI.gStays]]
      : [["trails", UI.gTrails]];
    groups.forEach(function (g) {
      var items = self.items.filter(function (it) { return it.group === g[0]; });
      if (!items.length) return;
      html("p", "bmap-list-title", wrap, T(g[1]));
      var ul = html("ul", "", wrap);
      items.forEach(function (it) {
        var li = html("li", "", ul);
        var b = html("button", "bmap-chip" + (it.trail ? " c" + it.color : "") + (it.stay ? " is-stay" : "") + (self.selected === it.id ? " is-sel" : ""), li);
        b.type = "button";
        b.setAttribute("aria-pressed", String(self.selected === it.id));
        html("span", "bmap-chip-dot", b);
        html("span", "", b, T(it.name).replace(/ \(.*\)$/, ""));
        b.addEventListener("click", function () { self.select(self.selected === it.id ? null : it.id, { from: "list" }); });
      });
    });
  };

  BMap.prototype.renderDetail = function () {
    var d = this.detail, it = this.selected && this.byId[this.selected];
    d.innerHTML = "";
    if (!it) {
      html("p", "bmap-intro", d, T(this.kind === "paese" ? UI.introPaese : UI.introSentieri));
      return;
    }
    html("p", "eyebrow", d, T(CAT[it.cat]));
    html("h3", "", d, T(it.name));
    if (it.trail) { this.renderTrail(d, it); return; }
    html("p", "", d, T(it.text));
    if (!it.xy) html("p", "bmap-note", d, T(UI.unplaced));
    var links = html("div", "bmap-links", d);
    if (it.url) {
      var a = html("a", "btn btn-primary btn-sm", links, T(UI.site));
      a.href = it.url; a.target = "_blank"; a.rel = "noopener";
    }
    if (it.xy) {
      var o = html("a", "btn btn-ghost btn-sm", links, T(UI.osm));
      o.href = osmUrl(it.lat, it.lon); o.target = "_blank"; o.rel = "noopener";
    }
  };

  BMap.prototype.renderTrail = function (d, it) {
    var oneway = it.min;
    var rt = (it.km / 4 * 2 + (it.up + it.down) / 300) * 60;
    var stats = html("dl", "bmap-stats", d);
    [[UI.km, fmtKm(it.km)], [UI.up, "+" + it.up + " m"], [UI.down, "−" + it.down + " m"], [UI.max, it.eleMax + " m"],
     [UI.oneway, fmtMin(oneway)], [UI.rt, fmtMin(rt)]].forEach(function (p) {
      var w = html("div", "", stats); html("dt", "", w, T(p[0])); html("dd", "", w, p[1]);
    });
    html("p", "bmap-profile-title", d, T(UI.profile));
    d.appendChild(profileSvg(it));
    html("p", "", d, T(it.text));
    var meta = html("ul", "bmap-meta", d);
    html("li", "", meta, T(UI.start) + ": " + T(it.start));
    html("li", "", meta, T(UI.diff) + ": " + T(UI.diffE));
    if (it.roadM) html("li", "", meta, (lang() === "it" ? "Circa " : "About ") + it.roadM + " m " + T(UI.road));
    var links = html("div", "bmap-links", d);
    if (IN_PREVIEW) {
      html("p", "bmap-note", links, T(UI.gpxNote));
    } else {
      var a = html("a", "btn btn-primary btn-sm", links, T(UI.gpx));
      a.href = "files/sentieri/" + it.id + ".gpx"; a.setAttribute("download", "");
    }
    var o = html("a", "btn btn-ghost btn-sm", links, T(UI.osm));
    o.href = osmUrl(it.start[0], it.start[1]); o.target = "_blank"; o.rel = "noopener";
    html("p", "bmap-note", d, T(UI.warn));
  };

  function profileSvg(it) {
    var W = 320, H = 120, padL = 34, padR = 8, padT = 10, padB = 22;
    var P = it.profile, maxD = P[P.length - 1][0];
    var lo = Math.floor((it.eleMin - 10) / 50) * 50, hi = Math.ceil((it.eleMax + 10) / 50) * 50;
    function X(dk) { return padL + dk / maxD * (W - padL - padR); }
    function Y(e) { return padT + (hi - e) / (hi - lo) * (H - padT - padB); }
    var s = svg("svg", { viewBox: "0 0 " + W + " " + H, "class": "bmap-profile c" + it.color, role: "img",
      "aria-label": T(UI.profile) + ": " + it.eleMin + "–" + it.eleMax + " m" });
    [lo, hi].concat(hi - lo > 100 ? [(lo + hi) / 2] : []).forEach(function (e) {
      svg("line", { x1: padL, x2: W - padR, y1: Y(e), y2: Y(e), "class": "pf-grid" }, s);
      var t = svg("text", { x: padL - 5, y: Y(e) + 3.5, "text-anchor": "end", "class": "pf-text" }, s); t.textContent = Math.round(e);
    });
    var step = maxD > 3 ? 1 : 0.5;
    for (var k = 0; k <= maxD + 1e-6; k += step) {
      var t = svg("text", { x: X(k), y: H - 6, "text-anchor": "middle", "class": "pf-text" }, s);
      t.textContent = (lang() === "it" ? String(k).replace(".", ",") : k) + (k === 0 ? " km" : "");
    }
    var line = P.map(function (p, i) { return (i ? "L" : "M") + X(p[0]).toFixed(1) + " " + Y(p[1]).toFixed(1); }).join(" ");
    svg("path", { d: line + " L" + X(maxD) + " " + Y(lo) + " L" + X(0) + " " + Y(lo) + " Z", "class": "pf-area" }, s);
    svg("path", { d: line, "class": "pf-line" }, s);
    var top = P.reduce(function (a, b) { return b[1] > a[1] ? b : a; });
    svg("circle", { cx: X(top[0]), cy: Y(top[1]), r: 3, "class": "pf-dot" }, s);
    return s;
  }

  /* ------------------------------------------------------------------ avvio */
  var maps = {};
  document.querySelectorAll("[data-map]").forEach(function (root) {
    var m = new BMap(root);
    maps[m.kind] = m;
  });

  // pulsanti "Vedi sulla mappa" nel resto della pagina
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-map-show]");
    if (!b) return;
    var m = maps[b.getAttribute("data-map-show")];
    if (!m) return;
    e.preventDefault();
    m.stage.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
    m.select(b.getAttribute("data-item"), { from: "button" });
  });

  window.BrandeglioMaps = maps;
})();
