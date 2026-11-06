"""Genera js/mappa-dati.js e files/sentieri/*.gpx per il sito di Brandeglio.
Dati: OpenStreetMap (Overpass, ODbL) + quote Open Topo Data (EU-DEM 25 m).
Uso: python3 -I build_map.py <cartella_sito> <cartella_cache>
"""
import json, math, heapq, sys, os, time, urllib.request, urllib.parse, collections

SITE, CACHE = sys.argv[1], sys.argv[2]
UA = {"User-Agent": "BrandeglioSiteBuilder/1.0 (static site build)"}
LAT0, LON0 = 44.00024, 10.63747          # Piazza di Brandeglio
COS0 = math.cos(math.radians(LAT0))
M = 111320.0
BBOX = (43.962, 10.600, 44.027, 10.690)   # s, w, n, e

def xy(lat, lon):
    return ((lon - LON0) * M * COS0, -(lat - LAT0) * M)

def dist(a, b):  # a,b = (lat,lon)
    la = math.radians((a[0] + b[0]) / 2)
    return math.hypot((a[0] - b[0]) * M, (a[1] - b[1]) * M * math.cos(la))

def overpass(name, q):
    path = os.path.join(CACHE, name + ".json")
    if os.path.exists(path):
        return json.load(open(path))
    data = urllib.parse.urlencode({"data": q}).encode()
    for attempt in range(4):
        try:
            req = urllib.request.Request("https://overpass-api.de/api/interpreter", data=data, headers=UA)
            raw = urllib.request.urlopen(req, timeout=180).read()
            d = json.loads(raw)
            json.dump(d, open(path, "w"))
            return d
        except Exception as e:
            print("overpass retry", name, e); time.sleep(10)
    raise SystemExit("overpass failed " + name)

s, w, n, e = BBOX
bb = f"({s},{w},{n},{e})"
hw = overpass("hw", f"[out:json][timeout:180];way{bb}[highway];out tags geom;")
ww = overpass("water", f"[out:json][timeout:180];way{bb}[waterway~\"river|stream\"];out tags geom;")
bd = overpass("bld", "[out:json][timeout:120];way(43.9955,10.6310,44.0045,10.6440)[building];out geom;")
print("ways:", len(hw["elements"]), "water:", len(ww["elements"]), "buildings:", len(bd["elements"]))

# ---------- grafo per i percorsi ----------
G = collections.defaultdict(list)
for el in hw["elements"]:
    g = [(round(p["lat"], 7), round(p["lon"], 7)) for p in el["geometry"]]
    h = el["tags"]["highway"]
    for a, b in zip(g, g[1:]):
        d = dist(a, b)
        G[a].append((b, d, h)); G[b].append((a, d, h))
NODES = list(G)
ROADS = {"primary", "secondary", "tertiary", "unclassified", "residential"}

def near(p):
    return min(NODES, key=lambda q: dist(q, p))

def dijkstra(src):
    D = {src: 0.0}; P = {}; q = [(0.0, src)]
    while q:
        c, u = heapq.heappop(q)
        if c > D[u]: continue
        for v, wgt, h in G[u]:
            nc = c + wgt * (4 if h in ROADS else 1)
            if nc < D.get(v, 1e18):
                D[v] = nc; P[v] = (u, h); heapq.heappush(q, (nc, v))
    return D, P

def path_to(P, src, t):
    pts = [t]; kinds = []
    while pts[-1] != src:
        u, h = P[pts[-1]]; kinds.append(h); pts.append(u)
    pts.reverse(); kinds.reverse()
    return pts, kinds

def water_geom(name):
    out = []
    for el in ww["elements"]:
        if el["tags"].get("name", "").lower() == name.lower():
            out += [(p["lat"], p["lon"]) for p in el["geometry"]]
    return out

def best_target(D, wpts, radius=45):
    best = None
    for nd in NODES:
        if nd not in D: continue
        if min(dist(nd, wp) for wp in wpts) <= radius:
            if best is None or D[nd] < D[best]: best = nd
    return best

piazza = near((LAT0, LON0))
D1, P1 = dijkstra(piazza)

routes = {}
# Boveglio (paese)
t = near((43.96811, 10.64169))
routes["boveglio"] = path_to(P1, piazza, t)
# Rio dell'Acqua Buona
ab = water_geom("Rio dell'Acqua Buona")
t = best_target(D1, ab)
routes["acquabuona"] = path_to(P1, piazza, t)
# Acqua di Rialto, da Crasciana
cr = near((44.00547, 10.66453))
D2, P2 = dijkstra(cr)
# fine della "Via di Rialto" (OSM way 225035666), dove nasce l'Acqua di Rialto (Solco di Rialto)
t = near((44.0066291, 10.6803783))
if t not in D2:
    # in OSM la Via di Rialto non è collegata alle vie del paese: si parte dal suo imbocco, al margine di Crasciana
    print("rialto: partenza dall'imbocco della Via di Rialto")
    cr = near((44.0056338, 10.6667159))
    D2, P2 = dijkstra(cr)
t = t if t in D2 else None
routes["rialto"] = path_to(P2, cr, t) if t else None

# ---------- quote ----------
def densify(pts, step=40):
    out = [pts[0]]; acc = 0.0
    for a, b in zip(pts, pts[1:]):
        d = dist(a, b); k = max(1, int(d // step))
        for i in range(1, k + 1):
            out.append((a[0] + (b[0] - a[0]) * i / k, a[1] + (b[1] - a[1]) * i / k))
    return out

def elevations(pts, key):
    path = os.path.join(CACHE, "ele_" + key + ".json")
    if os.path.exists(path):
        return json.load(open(path))
    res = []
    for i in range(0, len(pts), 100):
        chunk = pts[i:i + 100]
        locs = "|".join(f"{a:.6f},{b:.6f}" for a, b in chunk)
        url = "https://api.opentopodata.org/v1/eudem25m?locations=" + urllib.parse.quote(locs, safe=",|.")
        for attempt in range(4):
            try:
                d = json.loads(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read())
                res += [r["elevation"] for r in d["results"]]
                break
            except Exception as ex:
                print("ele retry", ex); time.sleep(3)
        time.sleep(1.2)
    json.dump(res, open(path, "w"))
    return res

def smooth(v, k=2):
    return [sum(v[max(0, i - k):i + k + 1]) / len(v[max(0, i - k):i + k + 1]) for i in range(len(v))]

def dp(points, tol):  # Douglas-Peucker su coordinate locali
    if len(points) < 3: return points
    (x1, y1), (x2, y2) = points[0], points[-1]
    dx, dy = x2 - x1, y2 - y1; L = math.hypot(dx, dy) or 1e-9
    idx, dmax = 0, 0
    for i in range(1, len(points) - 1):
        x0, y0 = points[i]
        dd = abs(dy * x0 - dx * y0 + x2 * y1 - y2 * x1) / L
        if dd > dmax: idx, dmax = i, dd
    if dmax > tol:
        return dp(points[:idx + 1], tol)[:-1] + dp(points[idx:], tol)
    return [points[0], points[-1]]

def fmt(pts):
    return " ".join(f"{x:.0f},{y:.0f}" for x, y in pts)

trails = []
os.makedirs(os.path.join(SITE, "files", "sentieri"), exist_ok=True)
for key, r in routes.items():
    if not r:
        print("NO ROUTE for", key); continue
    pts, kinds = r
    dense = densify(pts)
    ele = smooth(elevations(dense, key))
    cum = [0.0]
    for a, b in zip(dense, dense[1:]): cum.append(cum[-1] + dist(a, b))
    up = sum(max(0, b - a) for a, b in zip(ele, ele[1:]))
    down = sum(max(0, a - b) for a, b in zip(ele, ele[1:]))
    km = cum[-1] / 1000
    road = sum(dist(a, b) for (a, b), h in zip(zip(pts, pts[1:]), kinds) if h in ROADS)
    tmin = round((km / 4 + up / 300) * 60 / 5) * 5
    # profilo ridotto (~60 punti)
    stepn = max(1, len(dense) // 60)
    prof = [[round(cum[i] / 1000, 2), round(ele[i])] for i in range(0, len(dense), stepn)]
    if prof[-1][0] != round(cum[-1] / 1000, 2): prof.append([round(cum[-1] / 1000, 2), round(ele[-1])])
    loc = dp([xy(*p) for p in pts], 4)
    trails.append({"id": key, "km": round(km, 1), "up": round(up / 10) * 10, "down": round(down / 10) * 10,
                   "eleMin": round(min(ele)), "eleMax": round(max(ele)), "roadM": round(road / 50) * 50,
                   "min": tmin, "pts": fmt(loc), "profile": prof,
                   "start": [round(pts[0][0], 5), round(pts[0][1], 5)], "end": [round(pts[-1][0], 5), round(pts[-1][1], 5)]})
    # GPX
    names = {"boveglio": "Brandeglio - Boveglio", "acquabuona": "Brandeglio - Rio dell'Acqua Buona", "rialto": "Crasciana - Acqua di Rialto"}
    gpx = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<gpx version="1.1" creator="Comitato di Valorizzazione Turistica di Brandeglio" xmlns="http://www.topografix.com/GPX/1/1">',
           f'<metadata><name>{names[key]}</name><copyright author="OpenStreetMap contributors"><license>https://opendatacommons.org/licenses/odbl/</license></copyright></metadata>',
           f'<trk><name>{names[key]}</name><trkseg>']
    for (la, lo), z in zip(dense, ele):
        gpx.append(f'<trkpt lat="{la:.6f}" lon="{lo:.6f}"><ele>{z:.0f}</ele></trkpt>')
    gpx += ['</trkseg></trk>', '</gpx>']
    open(os.path.join(SITE, "files", "sentieri", key + ".gpx"), "w").write("\n".join(gpx))
    print(f"{key}: {km:.2f} km, +{up:.0f}/-{down:.0f} m, {min(ele):.0f}-{max(ele):.0f} m, strada {road:.0f} m, ~{tmin} min, kinds={collections.Counter(kinds)}")

# ---------- strati di base ----------
CLASS = {"primary": "r1", "secondary": "r1", "tertiary": "r2", "unclassified": "r3", "residential": "r3",
         "living_street": "r3", "service": "r4", "pedestrian": "r4", "track": "t", "path": "p", "footway": "p",
         "steps": "p", "bridleway": "p"}
layers = collections.defaultdict(list)
for el in hw["elements"]:
    c = CLASS.get(el["tags"]["highway"])
    if not c: continue
    loc = dp([xy(p["lat"], p["lon"]) for p in el["geometry"]], 3)
    layers[c].append(fmt(loc))
for el in ww["elements"]:
    c = "river" if el["tags"].get("waterway") == "river" else "stream"
    loc = dp([xy(p["lat"], p["lon"]) for p in el["geometry"]], 4)
    layers[c].append(fmt(loc))
for el in bd["elements"]:
    if "geometry" not in el: continue
    loc = [xy(p["lat"], p["lon"]) for p in el["geometry"]][:-1]  # poligono chiuso: niente semplificazione
    layers["bld"].append(" ".join(f"{x:.1f},{y:.1f}" for x, y in loc))
# nomi dei torrenti principali (punto centrale della via più lunga)
wnames = {}; wtotal = collections.Counter()
for el in ww["elements"]:
    nm = el["tags"].get("name")
    if not nm: continue
    g = el["geometry"]
    L = sum(dist((a["lat"], a["lon"]), (b["lat"], b["lon"])) for a, b in zip(g, g[1:]))
    wtotal[nm] += L
    if L > wnames.get(nm, (0,))[0]:
        mid = g[len(g) // 2]
        wnames[nm] = (L, xy(mid["lat"], mid["lon"]))
wlabels = [{"n": k, "x": round(v[1][0]), "y": round(v[1][1]), "len": round(wtotal[k])} for k, v in wnames.items() if wtotal[k] > 500]

out = {"origin": [LAT0, LON0], "cos": COS0,
       "bbox": [round(v) for v in (*xy(BBOX[2], BBOX[1]), *xy(BBOX[0], BBOX[3]))],
       "layers": layers, "waterLabels": wlabels, "trails": trails}
js = ("/* Generato automaticamente da build_map.py - dati (c) OpenStreetMap contributors, ODbL; "
      "quote Open Topo Data / EU-DEM 25 m. Non modificare a mano: le contrade e i testi sono in js/mappa.js. */\n"
      "window.BRANDEGLIO_MAPDATA = " + json.dumps(out, separators=(",", ":"), ensure_ascii=False) + ";\n")
open(os.path.join(SITE, "js", "mappa-dati.js"), "w").write(js)
print("mappa-dati.js", len(js) // 1024, "KB; layers:", {k: len(v) for k, v in layers.items()}, "water labels:", [w["n"] for w in wlabels])
