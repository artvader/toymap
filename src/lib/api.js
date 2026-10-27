async function getJSON(url) {
  const res = await fetch(url)
  if (!res.ok) {
    let detail = ''
    try {
      detail = (await res.json()).error ?? ''
    } catch {
      /* ignore malformed error body */
    }
    throw new Error(detail || `Request failed (${res.status})`)
  }
  return res.json()
}

export function fetchConfig() {
  return getJSON('/api/config')
}

export function fetchNearby(lat, lng, radius = 5000) {
  return getJSON(`/api/nearby?lat=${lat}&lng=${lng}&radius=${radius}`)
}

export function searchStores(query, lat, lng) {
  const params = new URLSearchParams({ q: query, lat: String(lat), lng: String(lng) })
  return getJSON(`/api/search?${params}`)
}

export function loadMapsScript(key) {
  if (window.google?.maps) return Promise.resolve()
  if (window.__toyfinderMapsPromise) return window.__toyfinderMapsPromise

  window.__toyfinderMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    window.__toyfinderMapsReady = () => resolve()
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      key,
    )}&v=weekly&callback=__toyfinderMapsReady`
    script.async = true
    script.onerror = () => reject(new Error('Could not load Google Maps'))
    document.head.appendChild(script)
  })

  return window.__toyfinderMapsPromise
}
