import { ReactNode, InputHTMLAttributes, SelectHTMLAttributes } from 'react'
import { useTheme } from '../../context/ThemeContext'

// ── Card ─────────────────────────────────────────────────────────────────────
interface CardProps {
  children: ReactNode
  style?: React.CSSProperties
  onClick?: () => void
}
export const Card = ({ children, style = {}, onClick }: CardProps) => (
  <div
    onClick={onClick}
    style={{
      background: '#fff',
      border: '1px solid #F1F5F9',
      borderRadius: 16,
      padding: '16px 20px',
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}
  >
    {children}
  </div>
)

// ── MetricCard ────────────────────────────────────────────────────────────────
interface MetricCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: string
}
export const MetricCard = ({ label, value, sub, accent }: MetricCardProps) => (
  <div style={{ background: '#F8FAFC', borderRadius: 14, padding: '14px 16px' }}>
    <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
      {label}
    </div>
    <div style={{ fontSize: 22, fontWeight: 700, color: accent ?? '#0F172A', lineHeight: 1.2 }}>
      {value}
    </div>
    {sub && <div style={{ fontSize: 12, color: '#64748B', marginTop: 3 }}>{sub}</div>}
  </div>
)

// ── Badge ─────────────────────────────────────────────────────────────────────
interface BadgeProps { children: ReactNode; type?: 'income' | 'expense' | 'neutral' }
export const Badge = ({ children, type = 'expense' }: BadgeProps) => {
  const colors = {
    income:  { bg: '#F0FDF4', color: '#16A34A' },
    expense: { bg: '#FFF1F2', color: '#E11D48' },
    neutral: { bg: '#F1F5F9', color: '#64748B' },
  }
  const c = colors[type]
  return (
    <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: c.bg, color: c.color }}>
      {children}
    </span>
  )
}

// ── ProgressBar ───────────────────────────────────────────────────────────────
export const ProgressBar = ({ pct, color }: { pct: number; color: string }) => (
  <div style={{ height: 6, background: '#F1F5F9', borderRadius: 99, overflow: 'hidden' }}>
    <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: color, borderRadius: 99, transition: 'width 0.6s ease' }} />
  </div>
)

// ── Modal ─────────────────────────────────────────────────────────────────────
interface ModalProps { title: string; onClose: () => void; children: ReactNode }
export const Modal = ({ title, onClose, children }: ModalProps) => (
  <div
    style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 }}
    onClick={onClose}
  >
    <div
      onClick={e => e.stopPropagation()}
      style={{ background: '#fff', borderRadius: '20px 20px 0 0', width: '100%', maxWidth: 480, padding: '24px 24px 48px', maxHeight: '90vh', overflowY: 'auto' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <span style={{ fontWeight: 700, fontSize: 17, color: '#0F172A' }}>{title}</span>
        <button onClick={onClose} style={{ background: '#F1F5F9', border: 'none', borderRadius: 99, width: 30, height: 30, cursor: 'pointer', fontSize: 16, color: '#64748B' }}>✕</button>
      </div>
      {children}
    </div>
  </div>
)

// ── Input ─────────────────────────────────────────────────────────────────────
interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label?: string }
export const Input = ({ label, ...props }: InputProps) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 6, letterSpacing: '0.03em' }}>{label}</label>}
    <input
      {...props}
      style={{
        width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '10px 12px',
        fontSize: 14, color: '#0F172A', outline: 'none', boxSizing: 'border-box',
        fontFamily: 'inherit', background: '#fff', transition: 'border-color 0.15s',
      }}
    />
  </div>
)

// ── Select ────────────────────────────────────────────────────────────────────
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> { label?: string; children: ReactNode }
export const Select = ({ label, children, ...props }: SelectProps) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 6, letterSpacing: '0.03em' }}>{label}</label>}
    <select
      {...props}
      style={{
        width: '100%', border: '1.5px solid #E2E8F0', borderRadius: 10, padding: '10px 12px',
        fontSize: 14, color: '#0F172A', outline: 'none', boxSizing: 'border-box',
        fontFamily: 'inherit', background: '#fff',
      }}
    >
      {children}
    </select>
  </div>
)

// ── Btn ───────────────────────────────────────────────────────────────────────
interface BtnProps { children: ReactNode; onClick?: () => void; variant?: 'primary' | 'ghost'; style?: React.CSSProperties; disabled?: boolean }
export const Btn = ({ children, onClick, variant = 'primary', style = {}, disabled }: BtnProps) => {
  const { theme } = useTheme()
  const isPrimary = variant === 'primary'
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', padding: '13px', borderRadius: 12,
        background: isPrimary ? theme.primary : '#F1F5F9',
        color: isPrimary ? '#fff' : '#0F172A',
        border: 'none', fontSize: 15, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit', opacity: disabled ? 0.6 : 1, transition: 'opacity 0.15s',
        ...style,
      }}
    >
      {children}
    </button>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export const Spinner = () => {
  const { theme } = useTheme()
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
      <div style={{
        width: 32, height: 32, border: `3px solid #F1F5F9`,
        borderTop: `3px solid ${theme.primary}`, borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export const EmptyState = ({ icon, message }: { icon: string; message: string }) => (
  <div style={{ textAlign: 'center', padding: '48px 24px', color: '#94A3B8' }}>
    <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
    <div style={{ fontSize: 14 }}>{message}</div>
  </div>
)

// ── SectionTitle ──────────────────────────────────────────────────────────────
export const SectionTitle = ({ children }: { children: ReactNode }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>
    {children}
  </div>
)

// ── TypeToggle ────────────────────────────────────────────────────────────────
interface TypeToggleProps { value: 'income' | 'expense'; onChange: (v: 'income' | 'expense') => void }
export const TypeToggle = ({ value, onChange }: TypeToggleProps) => {
  const { theme } = useTheme()
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
      {(['expense', 'income'] as const).map(type => (
        <button
          key={type}
          onClick={() => onChange(type)}
          style={{
            flex: 1, padding: '10px', borderRadius: 10, border: '1.5px solid',
            borderColor: value === type ? theme.primary : '#E2E8F0',
            background: value === type ? theme.light : '#fff',
            color: value === type ? theme.primary : '#64748B',
            fontWeight: 700, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </button>
      ))}
    </div>
  )
}
