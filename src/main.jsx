import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

// Conditional Service Worker registration for Capacitor compatibility
if ('serviceWorker' in navigator) {
  if (window.Capacitor || navigator.userAgent.includes('Capacitor')) {
    // If inside Capacitor, actively unregister service workers to avoid local file caching bugs
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister().then(() => {
          console.log('Unregistered active Service Worker to allow fresh Capacitor assets');
        });
      }
    });
  } else {
    // If running as a standard web PWA, register the Service Worker
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then((reg) => {
          console.log('Service Worker registered successfully on Web:', reg.scope);
        })
        .catch((err) => {
          console.error('Service Worker registration failed:', err);
        });
    });
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
