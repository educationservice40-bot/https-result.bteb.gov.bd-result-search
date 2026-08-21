import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Loaded here, in cascade order, and nowhere else. Importing a stylesheet from
// the component that uses it reads well but does not survive bundling: those
// imports are hoisted above this file's own, so the base sheet would land last
// and its generic rules would override the specific ones meant to refine them.
import './styles/base.css'
import './styles/search.css'
import './styles/result.css'

import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
