/**
 * A quiet map: warm land, white roads, muted labels, no POI or transit noise,
 * so the store pins and the sheet carry the screen.
 */
export const MAP_STYLES = [
  { featureType: 'all', elementType: 'labels.text', stylers: [{ color: '#8a857d' }] },
  { featureType: 'all', elementType: 'labels.icon', stylers: [{ saturation: -70 }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#e7e3db' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f1f1ef' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e3ebdc' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#faf9f7' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#f6f5f3' }] },
  { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#dbe6ec' }] },
]

export const MAP_FALLBACK_CENTER = { lat: 40.758, lng: -73.9855 }
