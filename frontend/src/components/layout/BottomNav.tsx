import { useTheme } from '../../context/ThemeContext'

type Page = 'dashboard' | 'wallets' | 'transactions' | 'goals' | 'categories' | 'settings'

const HomeIcon = ({ active, color }: { active: boolean; color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={active ? color : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)
const WalletIcon = ({ active, color }: { active: boolean; color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={active ? color : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
  </svg>
)
const TxIcon = ({ active, color }: { active: boolean; color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? color : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
  </svg>
)
const GoalIcon = ({ active, color }: { active: boolean; color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? color : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
  </svg>
)
const CategoryIcon = ({ active, color }: { active: boolean; color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? color : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
)
const SettingsIcon = ({ active, color }: { active: boolean; color: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? color : '#94A3B8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
  </svg>
)

const NAV_ITEMS: { id: Page; label: string; Icon: React.FC<{ active: boolean; color: string }> }[] = [
  { id: 'dashboard',    label: 'Home',      Icon: HomeIcon },
  { id: 'wallets',      label: 'Wallets',   Icon: WalletIcon },
  { id: 'transactions', label: 'Txns',      Icon: TxIcon },
  { id: 'goals',        label: 'Goals',     Icon: GoalIcon },
  { id: 'categories', label: 'Categories', Icon: CategoryIcon },
  { id: 'settings',     label: 'Settings',  Icon: SettingsIcon },
]

interface BottomNavProps { page: Page; setPage: (p: Page) => void }

export default function BottomNav({ page, setPage }: BottomNavProps) {
  const { theme } = useTheme()
  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#fff', borderTop: '1px solid #F1F5F9',
      display: 'flex', justifyContent: 'space-around', alignItems: 'center',
      height: 70, zIndex: 100, padding: '0 8px',
      boxShadow: '0 -4px 24px rgba(15,23,42,0.06)',
    }}>
      {NAV_ITEMS.map(({ id, label, Icon }) => {
        const active = page === id
        return (
          <button
            key={id}
            onClick={() => setPage(id)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 14px', borderRadius: 12 }}
          >
            <Icon active={active} color={theme.primary} />
            <span style={{ fontSize: 10, fontWeight: active ? 700 : 500, color: active ? theme.primary : '#94A3B8' }}>{label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export type { Page }
