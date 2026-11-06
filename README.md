# Sito di Brandeglio

Sito informativo non ufficiale sul paese di Brandeglio (Bagni di Lucca, LU), in italiano e inglese, realizzato da un privato.
Non serve nessun programma speciale: sono file HTML, CSS e JavaScript.

## Struttura
- `index.html`: la pagina. I testi italiani sono scritti qui.
- `js/i18n.js`: le traduzioni inglesi (stesse chiavi `data-i18n` dell'HTML).
- `css/style.css`: colori, caratteri e impaginazione.
- `privacy.html`: la nota su privacy e cookie (italiano e inglese), collegata dal piè di pagina.
- `css/fonts.css`, `fonts/`: i caratteri, ospitati sul sito (nessuna richiesta a Google Fonts).
- `img/`: foto da Wikimedia Commons (licenza CC BY-SA 4.0, crediti nel piè di pagina: non toglierli).
- `files/`: qui va il PDF del programma della festa (vedi `files/LEGGIMI-programma.txt`); in `files/sentieri/` ci sono le tracce GPX.
- `js/mappa.js`, `js/mappa-dati.js`: le due mappe interattive (vedi sotto).
- `strumenti/`: lo script che genera i dati delle mappe. Non serve caricarlo online.

## Cose da completare
1. **Programma della festa**: segui `files/LEGGIMI-programma.txt`.
2. **Modificare un testo**: cambia l'italiano in `index.html` e l'inglese con la stessa chiave in `js/i18n.js`.
3. **Date della festa**: aggiorna giorni e anno nella sezione `id="festa"` (e le chiavi `festa.year`, `festa.days.aria`).

## Mappe (contrade e sentieri)
- `js/mappa.js`: contrade, alloggi e testi dei sentieri (in italiano e inglese). Per spostare un punto correggi `lat` e `lon`.
- **Bucini**: nella voce `id: "bucini"` sostituisci `lat: null, lon: null` con le coordinate (in Google Maps: clic destro sul punto, poi clic sulle coordinate per copiarle). Senza coordinate compare solo nell'elenco.
- `js/mappa-dati.js`: strade, mulattiere, torrenti, edifici e tracce dei sentieri. È generato da `strumenti/build_map.py`
  con i dati di OpenStreetMap e le quote di Open Topo Data: non modificarlo a mano. Per rigenerarlo:
  `python3 strumenti/build_map.py . cartella-cache` (serve una connessione a internet).
- `files/sentieri/*.gpx`: le tracce scaricabili dei tre sentieri (generate dallo stesso script).
- I tempi e i dislivelli dei sentieri sono stime; la difficoltà "E" è indicativa. Fatele verificare a chi conosce i percorsi.
- I dati delle mappe vanno sempre accreditati (© OpenStreetMap contributors, ODbL): la scritta è già nel piè di pagina e sulla mappa.
- `js/mappa-dati.js` e le tracce GPX contengono dati derivati da OpenStreetMap e restano disponibili sotto la stessa licenza
  [ODbL 1.0](https://opendatacommons.org/licenses/odbl/1-0/), come richiede la licenza. Vedi anche `LICENZE.md`.

## Pubblicare online
- **Netlify**: vai su app.netlify.com/drop e trascina la cartella `brandeglio-sito-paese`.
- **GitHub Pages**: crea un repository pubblico, carica il contenuto di questa cartella (con `index.html` nella radice)
  e attiva Pages da Settings → Pages → "Deploy from a branch", ramo `main`, cartella `/ (root)`.
  La cartella `strumenti/` si può anche non caricare.
- Hosting tradizionale (Aruba, Register…): carica tutti i file mantenendo le cartelle.

## Lingua
Il pulsante IT / EN in alto cambia lingua; la scelta viene ricordata dal browser.
Alla prima visita la lingua segue quella del browser (italiano se è italiano, altrimenti inglese).
