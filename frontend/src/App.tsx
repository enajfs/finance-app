import { useState } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import BottomNav from './components/layout/BottomNav'
import type { Page } from './components/layout/BottomNav'
import Dashboard from './pages/Dashboard'
import Wallets from './pages/Wallets'
import Transactions from './pages/Transactions'
import Goals from './pages/Goals'
import Categories from './pages/Categories'
import Settings from './pages/Settings'

export default function App() {
  const [page, setPage] = useState<Page>('dashboard')

  return (
    <ThemeProvider>
      <div style={{
        maxWidth: 480,
        margin: '0 auto',
        minHeight: '100vh',
        background: '#F8FAFC',
        fontFamily: "'DM Sans', system-ui, sans-serif",
        position: 'relative',
      }}>
        {page === 'dashboard'    && <Dashboard />}
        {page === 'wallets'      && <Wallets />}
        {page === 'transactions' && <Transactions />}
        {page === 'goals'        && <Goals />}
        {page === 'categories'   && <Categories />}
        {page === 'settings'     && <Settings />}

        <BottomNav page={page} setPage={setPage} />
      </div>
    </ThemeProvider>
  )
}
