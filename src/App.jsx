import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-950 text-slate-100">
      <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
        React + Tailwind CSS
      </h1>
      <p className="max-w-md text-center text-slate-400">
        Edit <code className="rounded bg-slate-800 px-2 py-1 text-sky-400">src/App.jsx</code> and
        save to test HMR.
      </p>
      <button
        type="button"
        onClick={() => setCount((c) => c + 1)}
        className="cursor-pointer rounded-lg bg-sky-500 px-5 py-2.5 font-medium text-white transition hover:bg-sky-400 active:scale-95"
      >
        Count is {count}
      </button>
    </main>
  )
}

export default App
