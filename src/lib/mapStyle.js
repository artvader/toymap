/**
 * A patchwork-neon map: acid-lime land, hot-pink parks, cyan water, and
 * ink-dark roads with dark labels (light halo), so the map stays playful
 * without losing legibility.
 */
export const MAP_STYLES = [
  { featureType: 'all', elementType: 'labels.text.fill', stylers: [{ color: '#16130f' }] },
  { featureType: 'all', elementType: 'labels.text.stroke', stylers: [{ color: '#f8f7f4' }] },
  { featureType: 'all', elementType: 'labels.icon', stylers: [{ saturation: -70 }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#a8de38' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#cdff3f' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#cdff3f' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#ff5ac8' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#16130f' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#000000' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#2e2a24' }] },
  { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#2de2e6' }] },
]

export const MAP_FALLBACK_CENTER = { lat: 40.758, lng: -73.9855 }
