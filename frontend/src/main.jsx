// ═══════════════════════════════════════════════════════════════════════════════
// 🔒 SPOFE FRONTEND CONTRACT ENFORCER - INITIALIZATION SEQUENCE
// ═══════════════════════════════════════════════════════════════════════════════
//
// ⚠️ CRITICAL: The following MUST happen in THIS exact order:
//
//   1. import fetch-guard.js       ← Intercept window.fetch BEFORE app starts
//   2. await bootstrapSPOFE()      ← Load contract BEFORE any UI renders
//   3. render React App            ← ONLY if contract is valid
//
// If ANY step fails, the app stops and displays a fatal error.
// The contract is a BLOCKING DEPENDENCY, not an optional feature.
//
// ═══════════════════════════════════════════════════════════════════════════════

import '../core/fetch-guard.js'

import React from 'react'
import ReactDOM from 'react-dom/client'
import { bootstrapSPOFE, renderFatalError } from '../core/bootstrap.js'
import App from './App'
import './index.css'

/**
 * Bootstrap sequence
 * 
 * This runs BEFORE rendering any React component.
 * If it fails, the app displays a fatal error and stops.
 */
async function initializeApp() {
  try {
    console.log('[App] Starting SPOFE bootstrap...')
    
    // ⛔ PRE-CONDITION: Load and validate contract
    await bootstrapSPOFE()
    
    console.log('[App] ✓ Bootstrap successful, rendering React app')
    
    // ✅ Contract is valid, now we can render the app
    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
    
  } catch (error) {
    console.error('[App] Fatal error during bootstrap:', error)
    
    // ⛔ Display fatal error page
    renderFatalError(error)
    
    // Prevent any further execution
    throw error
  }
}

// Start the application
initializeApp()
