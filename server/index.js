import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApiHandler } from './api.js'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, 'dist')
const PORT = Number(process.env.PORT) || 4173

const app = express()

app.use('/api', createApiHandler())
app.use(express.static(DIST, { index: 'index.html', maxAge: '1h' }))

// Single-page app fallback for anything that is not an API route.
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  res.sendFile(path.join(DIST, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`ToyFinder running at http://localhost:${PORT}`)
})
