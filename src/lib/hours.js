const WEEKDAY_NAMES = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const TIME_RE = /(\d{1,2}):(\d{2})\s*(AM|PM)/i
const MILITARY_RE = /(\d{1,2}):(\d{2})(?!\s*(?:AM|PM))/i

function toMinutes(hour, minute, meridiem) {
  let h = Number(hour) % 12
  if (/pm/i.test(meridiem || '')) h += 12
  return h * 60 + Number(minute)
}

function parseRanges(body) {
  const text = body.trim()
  if (!text || /^closed$/i.test(text)) return []

  const ampm = [...text.matchAll(new RegExp(TIME_RE, 'g'))]
  const matches = ampm.length ? ampm : [...text.matchAll(new RegExp(MILITARY_RE, 'g'))]
  const ranges = []
  for (let i = 0; i + 1 < matches.length; i += 2) {
    const open = toMinutes(matches[i][1], matches[i][2], matches[i][3])
    let close = toMinutes(matches[i + 1][1], matches[i + 1][2], matches[i + 1][3])
    if (close <= open) close += 24 * 60 // crosses midnight
    ranges.push({ open, close })
  }
  return ranges
}

/**
 * Places returns weekly hours as human strings in the store's own local time,
 * Monday first: ["Monday: 10:00 AM – 9:00 PM", "Tuesday: Closed", ...].
 */
export function parseWeekdayDescriptions(list = []) {
  return list.slice(0, 7).map((line, index) => {
    const split = line.indexOf(':')
    const body = split === -1 ? line : line.slice(split + 1)
    return {
      index,
      name: WEEKDAY_NAMES[index],
      ranges: parseRanges(body),
      listed: true,
    }
  })
}

export function formatTime(minutes) {
  const total = ((minutes % (24 * 60)) + 24 * 60) % (24 * 60)
  const h = Math.floor(total / 60)
  const m = total % 60
  const meridiem = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${String(m).padStart(2, '0')} ${meridiem}` // taste-skill-ignore: this is a clock
}

function formatRanges(ranges) {
  if (!ranges.length) return 'Closed'
  return ranges.map((r) => `${formatTime(r.open)} – ${formatTime(r.close)}`).join(', ')
}

function placeLocalParts(store, now) {
  const offset = store.utcOffsetMinutes ?? -now.getTimezoneOffset()
  const local = new Date(now.getTime() + offset * 60000)
  return {
    dayIndex: (local.getUTCDay() + 6) % 7, // 0 = Monday, matching weekdayDescriptions
    minutes: local.getUTCHours() * 60 + local.getUTCMinutes(),
  }
}

/**
 * The screen's live thing: is this store open right now, and if not, when does
 * it next open. Google's own `openNow` is the truth when it is present; the
 * weekly strings cover stores that publish no current-hours data.
 */
export function getStoreStatus(store, now = new Date()) {
  const week = parseWeekdayDescriptions(store.weekdayDescriptions)
  if (!week.length) {
    return { kind: 'unknown', label: 'Hours not listed', todayLabel: 'Hours not listed', week: [] }
  }

  const { dayIndex, minutes } = placeLocalParts(store, now)
  const today = week[dayIndex]
  const yesterday = week[(dayIndex + 6) % 7]

  const overnight = yesterday.ranges.find((r) => r.close > 24 * 60 && minutes < r.close - 24 * 60)
  const running = today.ranges.find((r) => r.open <= minutes && minutes < r.close)

  const openNow = typeof store.openNow === 'boolean' ? store.openNow : Boolean(running || overnight)

  const activeRange = overnight || running
  const todayLabel = formatRanges(today.ranges)

  if (openNow) {
    const closeAt = activeRange ? activeRange.close : null
    return {
      kind: 'open',
      label: closeAt ? `Open until ${formatTime(closeAt)}` : 'Open now',
      closesAt: closeAt,
      todayLabel,
      week,
      dayIndex,
    }
  }

  for (let step = 0; step < 8; step++) {
    const idx = (dayIndex + step) % 7
    const next = week[idx].ranges.find((r) => step === 0 ? r.open > minutes : true)
    if (next) {
      const when = step === 0 ? 'today' : step === 1 ? 'tomorrow' : week[idx].name
      return {
        kind: 'closed',
        label: `Closed · opens ${when} ${formatTime(next.open)}`,
        todayLabel,
        week,
        dayIndex,
      }
    }
  }

  return { kind: 'closed', label: 'Closed', todayLabel, week, dayIndex }
}
