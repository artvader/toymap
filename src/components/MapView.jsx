import { useEffect, useRef, useState } from 'react'
import { loadMapsScript } from '../lib/api'
import { MAP_STYLES } from '../lib/mapStyle'
import { markerIcon } from '../lib/markerIcon'

export default function MapView({ apiKey, stores, selectedId, onSelect, center, userLocation }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef(new Map())
  const initialCenter = useRef(center)
  const onSelectRef = useRef(onSelect)
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    onSelectRef.current = onSelect
  }, [onSelect])

  // 1. Load the script with the key handed over by /api/config, then build the map.
  useEffect(() => {
    if (!apiKey) return undefined
    let cancelled = false

    loadMapsScript(apiKey)
      .then(() => {
        if (cancelled || !containerRef.current) return
        const google = window.google
        mapRef.current = new google.maps.Map(containerRef.current, {
          center: initialCenter.current,
          zoom: 14,
          styles: MAP_STYLES,
          backgroundColor: '#f1f1ef',
          clickableIcons: false,
          disableDefaultUI: true,
          gestureHandling: 'greedy',
          keyboardShortcuts: false,
        })
        google.maps.event.addListener(mapRef.current, 'click', () => onSelectRef.current(null))
        setStatus('ready')
      })
      .catch((error) => {
        console.error(error)
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [apiKey])

  // 2. Re-draw the pins whenever the result set or the selection changes.
  useEffect(() => {
    if (status !== 'ready') return
    const google = window.google
    const map = mapRef.current

    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current.clear()

    for (const store of stores) {
      const isSelected = store.id === selectedId
      const marker = new google.maps.Marker({
        position: { lat: store.lat, lng: store.lng },
        map,
        title: store.name,
        zIndex: isSelected ? 20 : 10,
        icon: markerIcon(google, {
          state: isSelected ? 'selected' : store.status.kind === 'open' ? 'open' : 'closed',
        }),
      })
      marker.addListener('click', () => onSelectRef.current(store.id))
      markersRef.current.set(store.id, marker)
    }

    if (userLocation) {
      const dot = new google.maps.Marker({
        position: { lat: userLocation.lat, lng: userLocation.lng },
        map,
        zIndex: 30,
        title: 'You are here',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 7,
          fillColor: '#16130f',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3,
        },
      })
      markersRef.current.set('__you', dot)
    }
  }, [status, stores, selectedId, userLocation])

  // 3. Follow the selection.
  useEffect(() => {
    if (status !== 'ready' || !selectedId) return
    const store = stores.find((item) => item.id === selectedId)
    if (!store) return
    mapRef.current.panTo({ lat: store.lat, lng: store.lng })
    if (mapRef.current.getZoom() < 15) mapRef.current.setZoom(15)
  }, [selectedId, status, stores])

  // 4. Recentre when the search area changes.
  useEffect(() => {
    if (status !== 'ready' || !center) return
    mapRef.current.panTo({ lat: center.lat, lng: center.lng })
    if (mapRef.current.getZoom() !== 13) mapRef.current.setZoom(13)
  }, [center, status])

  return (
    <div className="absolute inset-0" data-ui aria-hidden={status === 'ready' ? undefined : 'true'}>
      <div ref={containerRef} className="h-full w-full" />
      {status === 'loading' && (
        <div className="absolute inset-0 grid place-items-center bg-ground">
          <p className="text-sm text-muted">Loading the map…</p>
        </div>
      )}
      {status === 'error' && (
        <div className="absolute inset-0 grid place-items-center bg-ground px-8 text-center">
          <p className="max-w-xs text-sm text-muted">
            The map could not load. Check the server’s Google Maps key and try again.
          </p>
        </div>
      )}
    </div>
  )
}
