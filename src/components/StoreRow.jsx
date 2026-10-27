import { formatDistance, formatReviews, PRICE_LEVELS } from '../lib/format'

// A stable pale tint per store: identity, not data.
const TINTS = ['#fcece7', '#e8efe9', '#f1ece2']

function tintFor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return TINTS[hash % TINTS.length]
}

function Thumb({ store }) {
  return (
    <span
      className="relative grid size-14 shrink-0 place-items-center overflow-hidden"
      style={{ backgroundColor: tintFor(store.name) }}
      aria-hidden="true"
    >
      <span className="text-[20px] font-extrabold text-ink/70">
        {store.name.replace(/^[^A-Za-z]+/, '').charAt(0).toUpperCase()}
      </span>
    </span>
  )
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true" className="shrink-0">
      <path
        d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.8z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function StoreRow({ store, selected, onSelect }) {
  const distance = formatDistance(store.distance)
  const reviews = formatReviews(store.reviewCount)
  const price = PRICE_LEVELS[store.priceLevel]
  const isOpen = store.status.kind === 'open'

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(store.id)}
        aria-pressed={selected}
        className={`flex w-full items-start gap-3 border-b border-line px-4 py-3 text-left transition ${
          selected ? 'bg-accent-soft' : 'hover:bg-ground'
        }`}
      >
        <Thumb store={store} />

        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            <span className="min-w-0 flex-1 truncate text-[16px] font-semibold leading-tight">
              {store.name}
            </span>
            {distance && (
              <span className="tnum shrink-0 text-[13px] text-muted">{distance}</span>
            )}
          </span>

          <span className="mt-1 flex items-center gap-1.5 text-[13px] text-muted">
            {store.rating != null && (
              <>
                <span className="flex items-center gap-1 text-ink">
                  <StarIcon />
                  <span className="tnum font-semibold">{store.rating.toFixed(1)}</span>
                </span>
                <span className="tnum">({reviews})</span>
                <span aria-hidden="true">·</span>
              </>
            )}
            <span className="truncate">{price || store.type || 'Toy store'}</span>
          </span>

          <span className="mt-1.5 flex items-center gap-2 text-[13px]">
            <span
              aria-hidden="true"
              className={`size-2 shrink-0 rounded-full ${isOpen ? 'bg-open' : 'bg-closed'}`}
            />
            <span className={isOpen ? 'font-semibold text-open' : 'text-closed'}>
              {store.status.label}
            </span>
          </span>
        </span>
      </button>
    </li>
  )
}
