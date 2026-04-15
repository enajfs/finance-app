import { useUser } from '@clerk/clerk-react'
import { useTheme, THEMES } from '../context/ThemeContext'
import { Card } from '../components/ui'

export default function Settings() {
  const { theme, themeKey, setThemeKey } = useTheme()
  const { user } = useUser()

  return (
    <div style={{ padding: '60px 16px 100px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', margin: '0 0 28px' }}>Settings</h1>

      {/* Theme picker */}
<Card style={{ marginBottom: 16 }}>
  <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Color Theme</div>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
    {Object.entries(THEMES).map(([key, t]) => (
      <button
        key={key}
        onClick={() => setThemeKey(key)}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          padding: '12px 8px', borderRadius: 12, width: '100%', textAlign: 'center',
          border: `2px solid ${themeKey === key ? t.primary : '#F1F5F9'}`,
          background: themeKey === key ? t.light : '#fff',
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <div style={{ width: 36, height: 36, borderRadius: 99, background: `linear-gradient(135deg, ${t.primary}, ${t.accent})`, position: 'relative' }}>
          {themeKey === key && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 14 }}>✓</div>
          )}
        </div>
        <div style={{ fontWeight: 600, color: '#0F172A', fontSize: 11 }}>{t.name}</div>
      </button>
    ))}
  </div>
</Card>

      {/* Account */}
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>Account</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 48, height: 48, borderRadius: 99, background: theme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 18, overflow: 'hidden' }}>
            {user?.imageUrl
              ? <img src={user.imageUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (user?.firstName?.[0] ?? '?')}
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 15 }}>{user?.fullName ?? 'User'}</div>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>{user?.primaryEmailAddress?.emailAddress}</div>
          </div>
        </div>
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #F1F5F9', fontSize: 13, color: '#94A3B8', display: 'flex', justifyContent: 'space-between' }}>
          <span>Auth via Clerk</span>
          <span style={{ color: '#16A34A', fontWeight: 600 }}>● Signed in</span>
        </div>
      </Card>

     {/* App info */}
      <Card>
        <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 14 }}>App Info</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 13 }}>
          <span style={{ color: '#64748B' }}>Version</span>
          <span style={{ color: '#0F172A', fontWeight: 600 }}>v1.0.0</span>
        </div>
      </Card>
    </div>
  )
}
