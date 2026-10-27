/**
 * The custom store marker: a pin carrying a toy brick.
 * Drawn as SVG data URIs so it can be used by both google.maps.Marker icons
 * and the brand mark in the header, with no image assets.
 */
const VIEWBOX_W = 48
const VIEWBOX_H = 58

const PIN_PATH =
  'M24 56 C34 42 44 33 44 22 A20 20 0 0 0 4 22 C4 33 14 42 24 56 Z'

const TONES = {
  open: { fill: '#e5352b', stroke: '#ffffff' },
  closed: { fill: '#6e6a63', stroke: '#ffffff' },
  selected: { fill: '#16130f', stroke: '#e5352b' },
}

export function pinSvg(tone = 'open', glyphColor = '#ffffff') {
  const { fill, stroke } = TONES[tone] ?? TONES.open
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${VIEWBOX_W}" height="${VIEWBOX_H}" viewBox="0 0 ${VIEWBOX_W} ${VIEWBOX_H}">
<path d="${PIN_PATH}" fill="${fill}" stroke="${stroke}" stroke-width="3"/>
<g fill="${glyphColor}">
<rect x="13" y="18" width="22" height="13" rx="3.5"/>
<rect x="16" y="13" width="6" height="5" rx="1.5"/>
<rect x="26" y="13" width="6" height="5" rx="1.5"/>
</g>
</svg>`
}

export function pinDataUri(tone = 'open', glyphColor = '#ffffff') {
  return `data:image/svg+xml,${encodeURIComponent(pinSvg(tone, glyphColor))}`
}

/** Plain brick glyph for the header mark. */
export function brickSvg(color = '#e1462b') {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="24" viewBox="0 0 28 24">
<g fill="${color}">
<rect x="2" y="7" width="24" height="15" rx="3.5"/>
<rect x="5" y="1.5" width="6.5" height="5.5" rx="1.5"/>
<rect x="16.5" y="1.5" width="6.5" height="5.5" rx="1.5"/>
</g>
</svg>`
}

export function brickDataUri(color = '#e1462b') {
  return `data:image/svg+xml,${encodeURIComponent(brickSvg(color))}`
}

export function markerIcon(google, { state = 'default' } = {}) {
  const tone = state === 'selected' ? 'selected' : state === 'closed' ? 'closed' : 'open'
  const width = state === 'selected' ? 58 : 46
  const height = (width / VIEWBOX_W) * VIEWBOX_H
  return {
    url: pinDataUri(tone),
    scaledSize: new google.maps.Size(width, height),
    anchor: new google.maps.Point(width / 2, height - 3),
    labelOrigin: new google.maps.Point(width / 2, 22),
  }
}
