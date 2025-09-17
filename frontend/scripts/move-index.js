const fs = require('fs')
const path = require('path')

// Vite is configured to emit build files into backend/app/static/dist
const builtIndex = path.resolve(__dirname, '..', '..', 'backend', 'app', 'static', 'dist', 'index.html')
const targetTemplates = path.resolve(__dirname, '..', '..', 'backend', 'app', 'templates')

if (!fs.existsSync(builtIndex)) {
  console.error('Built index.html not found at', builtIndex)
  process.exit(1)
}

if (!fs.existsSync(targetTemplates)) fs.mkdirSync(targetTemplates, { recursive: true })

// Copy index.html into backend templates so Flask can render the SPA entry
fs.copyFileSync(builtIndex, path.resolve(targetTemplates, 'index.html'))

console.log('index.html copied to', targetTemplates)
