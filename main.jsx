import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import AdminPanel from './components/AdminPanel.jsx'

// No router in this app — the admin panel is a separate entry point reached via ?admin
const isAdminRoute = new URLSearchParams(window.location.search).has('admin')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isAdminRoute ? <AdminPanel /> : <App />}
  </StrictMode>,
)
