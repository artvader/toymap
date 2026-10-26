import { useRef } from 'react'
import { formatDistance, formatReviews, PRICE_LEVELS } from '../lib/format'
import { formatTime } from '../lib/hours'
import StoreRow from './StoreRow'

function SkeletonRow() {
  return (
    <li className="flex gap-3 border-b border-line px-4 py-4" aria-hidden="true">
      <div className="size-14 shrink-0 skeleton bg-ground" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3.5 w-2/3 skeleton bg-ground" />
        <div className="h-3 w-1/3 skeleton bg-ground" />
        <div className="h-3 w-1/2 skeleton bg-ground" />
      </div>
    </li>
  )
}

function OpenNowChip({ active, onToggle, disabled }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={active}
      className={`h-9 shrink-0 rounded-full px-4 text-[14px] font-semibold transition disabled:opacity-40 ${
        active ? 'bg-ink text-surface' : 'bg-ground text-muted hover:text-ink'
      }`}
    >
      Open now
    </button>
  )
}

function Detail({ store, onBack }) {
  const distance = formatDistance(store.distance)
  const reviews = formatReviews(store.reviewCount)
  const price = PRICE_LEVELS[store.priceLevel]
  const isOpen = store.status.kind === 'open'
  const directions =
    store.mapsUri ||
    `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`

  return (
    <div className="rise flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex items-center gap-3 px-4 pb-1 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 items-center gap-1.5 rounded-full bg-ground px-3.5 text-[14px] font-semibold transition hover:bg-line"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
            <path
              d="M14.5 5.5L8 12l6.5 6.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          All stores
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <h2 className="mt-3 text-[28px] font-extrabold leading-[1.05] tracking-[-0.03em]">
          {store.name}
        </h2>

        <p className="mt-2 flex items-center gap-2 text-[15px]">
          <span
            aria-hidden="true"
            className={`size-2.5 shrink-0 rounded-full ${isOpen ? 'bg-open' : 'bg-closed'}`}
          />
          <span className={isOpen ? 'font-semibold text-open' : 'text-closed'}>
            {store.status.label}
          </span>
        </p>

        <p className="tnum mt-1 text-[14px] text-muted">Today {store.status.todayLabel}</p>

        <p className="mt-1 text-[15px] leading-snug text-muted">{store.address}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={directions}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 items-center rounded-full bg-accent px-5 text-[15px] font-semibold text-surface transition hover:opacity-90 active:scale-[0.98]"
          >
            Directions
          </a>
          {store.website && (
            <a
              href={store.website}
              target="_blank"
              rel="noreferrer"
              className="flex h-11 items-center rounded-full bg-ground px-5 text-[15px] font-semibold transition hover:bg-line active:scale-[0.98]"
            >
              Website
            </a>
          )}
        </div>

        <dl className="mt-5 flex flex-wrap items-baseline gap-x-6 gap-y-2 border-t border-line pt-4 text-[14px]">
          {store.rating != null && (
            <div className="flex items-baseline gap-1.5">
              <dt className="text-muted">Rating</dt>
              <dd className="tnum font-semibold">
                {store.rating.toFixed(1)} <span className="text-muted">({reviews})</span>
              </dd>
            </div>
          )}
          {distance && (
            <div className="flex items-baseline gap-1.5">
              <dt className="text-muted">From you</dt>
              <dd className="tnum font-semibold">{distance}</dd>
            </div>
          )}
          {price && (
            <div className="flex items-baseline gap-1.5">
              <dt className="text-muted">Price</dt>
              <dd className="font-semibold">{price}</dd>
            </div>
          )}
        </dl>

        <h3 className="mt-6 text-[17px] font-bold">Operating hours</h3>
        {store.status.week.length ? (
          <ul className="mt-2">
            {store.status.week.map((day) => {
              const isToday = day.index === store.status.dayIndex
              const text = day.ranges.length
                ? day.ranges
                    .map((range) => `${formatTime(range.open)} – ${formatTime(range.close)}`)
                    .join(', ')
                : 'Closed'
              return (
                <li
                  key={day.name}
                  className={`flex items-baseline justify-between gap-4 border-b border-line py-2.5 text-[15px] ${
                    isToday ? 'text-ink' : 'text-muted'
                  }`}
                >
                  <span className={isToday ? 'font-semibold' : ''}>
                    {day.name}
                    {isToday && <span className="ml-2 text-[13px] text-accent">Today</span>}
                  </span>
                  <span className={`tnum ${isToday ? 'font-semibold' : ''}`}>{text}</span>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="mt-2 text-[15px] text-muted">This store has not listed its hours.</p>
        )}

        <p className="mt-3 text-[13px] leading-snug text-muted">
          Times are shown in the store’s local time zone.
        </p>
      </div>
    </div>
  )
}

export default function StoreSheet({
  stores,
  total,
  loading,
  error,
  selected,
  onSelect,
  onRetry,
  openOnly,
  onToggleOpenOnly,
  tall,
  onTallChange,
  areaLabel,
}) {
  const dragRef = useRef(null)

  const handlePointerDown = (event) => {
    dragRef.current = { y: event.clientY, moved: false }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const handlePointerMove = (event) => {
    if (dragRef.current && Math.abs(event.clientY - dragRef.current.y) > 6) {
      dragRef.current.moved = true
    }
  }

  const handlePointerUp = (event) => {
    const start = dragRef.current
    dragRef.current = null
    if (!start) return
    const dy = event.clientY - start.y
    if (Math.abs(dy) > 48) onTallChange(dy < 0)
    else if (!start.moved) onTallChange(!tall)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onTallChange(!tall)
    }
  }

  return (
    <section
      aria-label="Nearby toy stores"
      className="absolute inset-x-0 bottom-0 z-20 flex flex-col rounded-t-3xl bg-surface sm:right-auto sm:bottom-4 sm:left-4 sm:w-[440px] sm:rounded-3xl sm:border sm:border-line"
      style={{
        height: tall ? '86dvh' : 'auto',
        maxHeight: tall ? '86dvh' : '48dvh',
      }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={tall}
        aria-label={tall ? 'Collapse the store list' : 'Expand the store list'}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onKeyDown={handleKeyDown}
        className="shrink-0 cursor-grab touch-none px-4 pb-1 pt-3 active:cursor-grabbing" // taste-skill-ignore: the sheet is a real overlay above the map
      >
        <span className="mx-auto block h-1 w-10 rounded-full bg-line" />
      </div>

      {selected ? (
        <Detail store={selected} onBack={() => onSelect(null)} />
      ) : (
        <>
          <div className="shrink-0 px-4 pb-3 pt-2">
            <div className="flex items-baseline justify-between gap-3">
              <h1 className="text-[20px] font-bold tracking-[-0.02em]">Toy stores nearby</h1>
              <span className="tnum text-[13px] text-muted">
                {loading ? 'Searching…' : error ? '—' : `${stores.length} of ${total}`}
              </span>
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <OpenNowChip active={openOnly} onToggle={onToggleOpenOnly} disabled={loading} />
              <span className="truncate text-[13px] text-muted">{areaLabel}</span>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <p aria-live="polite" className="sr-only">
              {loading
                ? 'Searching for toy stores'
                : error
                  ? `Search failed: ${error}`
                  : `${stores.length} toy stores found`}
            </p>

            {loading && (
              <ul>
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </ul>
            )}

            {!loading && error && (
              <div className="px-6 py-10 text-center">
                <p className="text-[17px] font-semibold">We could not reach the store data</p>
                <p className="mx-auto mt-1 max-w-xs text-[14px] leading-snug text-muted">{error}</p>
                <button
                  type="button"
                  onClick={onRetry}
                  className="mt-4 h-11 rounded-full bg-ink px-5 text-[15px] font-semibold text-surface transition active:scale-[0.98]"
                >
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && stores.length === 0 && (
              <div className="px-6 py-10 text-center">
                <p className="text-[17px] font-semibold">No toy stores here yet</p>
                <p className="mx-auto mt-1 max-w-xs text-[14px] leading-snug text-muted">
                  {openOnly
                    ? 'None of the stores nearby are open right now.'
                    : 'Try another city, or clear the search to come back to your area.'}
                </p>
              </div>
            )}

            {!loading && !error && stores.length > 0 && (
              <ul>
                {stores.map((store) => (
                  <StoreRow
                    key={store.id}
                    store={store}
                    selected={false}
                    onSelect={onSelect}
                  />
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </section>
  )
}
