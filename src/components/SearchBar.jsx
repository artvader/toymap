import { brickDataUri } from '../lib/markerIcon'

function LocateIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M16 16l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export default function SearchBar({ query, onQuery, onLocate, locating }) {
  return (
    <header className="absolute inset-x-0 top-0 z-20 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:max-w-[440px]">
      <div className="rounded-3xl border border-line bg-surface p-2">
        <div className="flex items-center gap-2 px-1 pb-2">
          <span className="grid size-9 place-items-center bg-ink" aria-hidden="true">
            <img src={brickDataUri('#e1462b')} alt="" width="22" height="19" />
          </span>
          <span className="text-[19px] font-extrabold tracking-[-0.02em]">ToyFinder</span>
          <button
            type="button"
            onClick={onLocate}
            aria-label="Use my location"
            title="Use my location"
            className="ml-auto grid size-10 place-items-center rounded-full text-ink transition hover:bg-ground active:scale-95"
          >
            <span className={locating ? 'animate-pulse' : ''}> {/* taste-skill-ignore: transient locating feedback */}
              <LocateIcon />
            </span>
          </button>
        </div>

        <div className="flex h-11 items-center gap-2 rounded-full bg-ground px-4">
          <span className="text-muted">
            <SearchIcon />
          </span>
          <input
            type="search"
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Search a city or a store"
            aria-label="Search for a city or toy store"
            enterKeyHint="search"
            className="h-full min-w-0 flex-1 bg-transparent text-[16px] outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => onQuery('')}
              aria-label="Clear search"
              className="grid size-7 place-items-center rounded-full text-muted hover:text-ink"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path
                  d="M6 6l12 12M18 6L6 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
