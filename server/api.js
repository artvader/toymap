import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

// Read .env ourselves (no dotenv dependency). Never expose these to the bundle.
function loadEnvFile() {
  const file = path.join(ROOT, '.env')
  if (!existsSync(file)) return
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/)
    if (!match) continue
    let value = match[2]
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (!(match[1] in process.env)) process.env[match[1]] = value
  }
}

loadEnvFile()

export const API_KEY = process.env.GOOGLEMAP_API_KEY || ''

const PLACES_BASE = 'https://places.googleapis.com/v1'

const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.location',
  'places.rating',
  'places.userRatingCount',
  'places.priceLevel',
  'places.websiteUri',
  'places.googleMapsUri',
  'places.regularOpeningHours',
  'places.currentOpeningHours',
  'places.utcOffsetMinutes',
  'places.primaryTypeDisplayName',
  'places.businessStatus',
].join(',')

function normalise(place) {
  return {
    id: place.id,
    name: place.displayName?.text ?? 'Toy store',
    address: place.formattedAddress ?? '',
    lat: place.location?.latitude ?? 0,
    lng: place.location?.longitude ?? 0,
    rating: place.rating ?? null,
    reviewCount: place.userRatingCount ?? null,
    priceLevel: place.priceLevel ?? null,
    website: place.websiteUri ?? null,
    mapsUri: place.googleMapsUri ?? null,
    type: place.primaryTypeDisplayName?.text ?? null,
    openNow: place.currentOpeningHours?.openNow ?? null,
    weekdayDescriptions: place.regularOpeningHours?.weekdayDescriptions ?? [],
    utcOffsetMinutes: place.utcOffsetMinutes ?? null,
    businessStatus: place.businessStatus ?? 'OPERATIONAL',
  }
}

async function placesFetch(pathname, body, fieldMask) {
  const res = await fetch(`${PLACES_BASE}${pathname}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': API_KEY,
      'X-Goog-FieldMask': fieldMask,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Places ${pathname} responded ${res.status}: ${text.slice(0, 300)}`)
  }
  return res.json()
}

function sendJson(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(payload))
}

function numberParam(url, name, fallback) {
  const raw = url.searchParams.get(name)
  const value = Number(raw)
  return Number.isFinite(value) ? value : fallback
}

/**
 * Express-compatible handler mounted at /api.
 * The API key only ever lives here, on the server: the client gets it from
 * /api/config at runtime so it is never written into the bundle or the repo.
 */
export function createApiHandler() {
  return async function api(req, res, next) {
    try {
      const url = new URL(req.url, 'http://localhost')
      const route = url.pathname.replace(/^\/api/, '')

      if (route === '/config') {
        if (!API_KEY) return sendJson(res, 500, { error: 'GOOGLEMAP_API_KEY is not set on the server' })
        return sendJson(res, 200, { googleMapsKey: API_KEY })
      }

      if (route === '/nearby' || route === '/search') {
        if (!API_KEY) return sendJson(res, 500, { error: 'GOOGLEMAP_API_KEY is not set on the server' })

        const lat = numberParam(url, 'lat', 40.758)
        const lng = numberParam(url, 'lng', -73.9855)
        const radius = Math.min(numberParam(url, 'radius', 4000), 20000)
        const query = (url.searchParams.get('q') || '').trim()

        let data
        if (route === '/search') {
          if (!query) return sendJson(res, 200, { stores: [] })
          data = await placesFetch(
            '/places:searchText',
            {
              textQuery: `${query} toy store`,
              maxResultCount: 20,
              locationBias: {
                circle: { center: { latitude: lat, longitude: lng }, radius: Math.max(radius, 20000) },
              },
            },
            FIELD_MASK,
          )
        } else {
          data = await placesFetch(
            '/places:searchNearby',
            {
              includedPrimaryTypes: ['toy_store'],
              maxResultCount: 20,
              locationRestriction: {
                circle: { center: { latitude: lat, longitude: lng }, radius },
              },
            },
            FIELD_MASK,
          )
        }

        const stores = (data.places ?? []).map(normalise).filter((s) => s.businessStatus !== 'CLOSED_PERMANENTLY')
        return sendJson(res, 200, { stores })
      }

      return next?.()
    } catch (error) {
      console.error('[api]', error.message)
      return sendJson(res, 502, { error: 'Upstream Places request failed' })
    }
  }
}
