import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import MapView from './components/MapView'
import SearchBar from './components/SearchBar'
import StoreSheet from './components/StoreSheet'
import { fetchConfig, fetchNearby, searchStores } from './lib/api'
import { distanceMiles } from './lib/format'
import { getStoreStatus } from './lib/hours'
import { MAP_FALLBACK_CENTER } from './lib/mapStyle'

const DEFAULT_AREA = 'Midtown Manhattan, New York'

export default function App() {
  const [apiKey, setApiKey] = useState(null)
  const [configError, setConfigError] = useState(null)
  const [query, setQuery] = useState('')
  const [coords, setCoords] = useState(MAP_FALLBACK_CENTER)
  const [userLocation, setUserLocation] = useState(null)
  const [locating, setLocating] = useState(false)
  const [stores, setStores] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [openOnly, setOpenOnly] = useState(false)
  const [tall, setTall] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)
  const geoAsked = useRef(false)

  // The key never enters the bundle: the server hands it over at runtime.
  useEffect(() => {
    fetchConfig()
      .then((config) => setApiKey(config.googleMapsKey))
      .catch((err) => setConfigError(err.message))
  }, [])

  const locate = useCallback(() => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = { lat: position.coords.latitude, lng: position.coords.longitude }
        setUserLocation(next)
        setCoords(next)
        setLocating(false)
        setQuery('')
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    )
  }, [])

  // Ask once on load; fall back to the default area if it is refused.
  useEffect(() => {
    if (geoAsked.current) return
    geoAsked.current = true
    locate()
  }, [locate])

  // Debounced data fetch: text search while typing, nearby otherwise.
  useEffect(() => {
    let cancelled = false
    const term = query.trim()

    const run = () => {
      setLoading(true)
      setError(null)
      const request =
        term.length >= 2
          ? searchStores(term, coords.lat, coords.lng)
          : fetchNearby(coords.lat, coords.lng)

      request
        .then((data) => {
          if (cancelled) return
          const withStatus = data.stores.map((store) => ({
            ...store,
            status: getStoreStatus(store),
          }))
          setStores(withStatus)
          setTotal(withStatus.length)
          setLoading(false)
        })
        .catch((err) => {
          if (cancelled) return
          setStores([])
          setTotal(0)
          setError(err.message)
          setLoading(false)
        })
    }

    const timer = setTimeout(run, term ? 350 : 0)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query, coords, reloadKey])

  const visible = useMemo(() => {
    let list = stores
    if (openOnly) list = list.filter((store) => store.status.kind === 'open')
    if (userLocation) {
      list = [...list]
        .map((store) => ({ ...store, distance: distanceMiles(userLocation, store) }))
        .sort((a, b) => a.distance - b.distance)
    }
    return list
  }, [stores, openOnly, userLocation])

  const selected = selectedId ? visible.find((store) => store.id === selectedId) ?? null : null

  const handleSelect = useCallback((id) => {
    setSelectedId(id)
    setTall(Boolean(id))
  }, [])

  const areaLabel = query.trim()
    ? `Results for “${query.trim()}”`
    : userLocation
      ? 'Around your location'
      : DEFAULT_AREA

  return (
    <div className="relative h-full overflow-hidden bg-ground">
      <MapView
        apiKey={apiKey}
        stores={visible}
        selectedId={selectedId}
        onSelect={handleSelect}
        center={coords}
        userLocation={userLocation}
      />

      <SearchBar
        query={query}
        onQuery={(value) => {
          setQuery(value)
          if (value) handleSelect(null)
        }}
        onLocate={locate}
        locating={locating}
      />

      <StoreSheet
        stores={visible}
        total={total}
        loading={loading}
        error={error || configError}
        selected={selected}
        onSelect={handleSelect}
        onRetry={() => setReloadKey((key) => key + 1)}
        openOnly={openOnly}
        onToggleOpenOnly={() => setOpenOnly((value) => !value)}
        tall={tall}
        onTallChange={setTall}
        areaLabel={areaLabel}
      />
    </div>
  )
}
