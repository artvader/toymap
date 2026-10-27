# ToyMap

A mapping service for finding **toy shops near you**. Open the map, allow location access (or just search an area), and get a live list of local toy stores with ratings, opening hours, directions links and distance — backed by Google Maps and the Google Places API.

## What it does

- **Nearby mode** — with no search term, it shows toy stores around your current location (or the default map area) using a Places *Search Nearby* request filtered to the `toy_store` type.
- **Search mode** — type two or more characters to run a text search ("toy store" is appended automatically) biased to the current map area.
- **Live map** — custom-styled map with open/closed pins, tap a pin or a row to select a store, plus a detail sheet with weekly hours, address, rating and links out to Google Maps or the store's website.
- **Open-now filter** — toggle to only show shops currently open.
- **Geolocation** — asks for your location on load and re-centers the map; falls back to Midtown Manhattan if refused.
- **Mobile-first** — a bottom sheet layout designed for phones, usable on desktop.

## Stack

- React 19 + Vite 8, Tailwind CSS v4, Oxlint
- Express 5 serving the built SPA and the `/api` proxy
- Google Maps JavaScript API (map) + Places API (New) (nearby/search), both called server-side

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Get a Google Maps API key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/) and create (or select) a project.
2. Open **Billing** and attach a billing account — Google requires it even for the free tier.
3. Go to **APIs & Services → Library** and enable both:
   - **Maps JavaScript API** (renders the map in the browser)
   - **Places API (New)** (the server-side nearby and text search)
4. Go to **APIs & Services → Credentials → Create credentials → API key**.
5. Copy the key, then click **Edit API key → Application restrictions → Websites** and add your origins (e.g. `http://localhost:5173` and your production domain) so the key can't be reused elsewhere. Under **API restrictions**, restrict the key to the two APIs above.

### 3. Create the `.env` file

Create a file named `.env` **in the project root** — the same folder that contains `package.json` and `vite.config.js` (not inside `src/` or `server/`):

```
project-root/
├── .env          ← put it here
├── package.json
├── vite.config.js
├── server/
└── src/
```

Put exactly one line in it:

```
GOOGLEMAP_API_KEY=your_key_here
```

Notes:

- No quotes, no `export`, no spaces around `=`.
- The file is already listed in `.gitignore`, so it is never committed — **never paste your key into source files**, and never commit `.env`.
- The server reads `.env` itself at startup (no dotenv package needed) and hands the key to the browser only at runtime via `/api/config`, so it stays out of the repo and out of the built bundle.
- Optional: set `PORT` in the same file to change the production server port (default `4173`).

### 4. Run it

Development (Vite with HMR, API served by a Vite middleware):

```bash
npm run dev
```

Production build + server:

```bash
npm run build
npm start
```

Then open the printed URL (default <http://localhost:4173>).

## Scripts

| Command          | What it does                                   |
| ---------------- | ---------------------------------------------- |
| `npm run dev`    | Start the dev server with hot reload           |
| `npm run build`  | Build the production bundle into `dist/`       |
| `npm start`      | Serve `dist/` and the API with Express         |
| `npm run lint`   | Run Oxlint                                     |
| `npm run preview`| Preview the built bundle (API via middleware)  |

## API endpoints

All routes are served under `/api` by the same server that hosts the app:

| Route                       | Purpose                                                       |
| --------------------------- | ------------------------------------------------------------- |
| `GET /api/config`           | Returns the Maps key for the client at runtime                |
| `GET /api/nearby?lat&lng&radius` | Toy stores around a point (Places Search Nearby)         |
| `GET /api/search?q&lat&lng`      | Text search for toy stores biased to a point            |

Responses are `{ stores: [...] }` with normalised fields: id, name, address, lat/lng, rating, reviewCount, priceLevel, website, mapsUri, type, openNow, weekdayDescriptions, status.

## Security note

The API key lives only in `.env` (gitignored) and is read by the server. Keep it that way: if a key ever lands in a commit, revoke it in the Cloud Console and issue a new one.