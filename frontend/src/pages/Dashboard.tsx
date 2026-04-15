import { useEffect, useState } from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useTheme } from '../context/ThemeContext'
import { useApiClient } from '../api/client'
import { walletsApi } from '../api/wallets'
import { transactionsApi } from '../api/transactions'
import { categoriesApi } from '../api/categories'
import { dashboardApi } from '../api/dashboard'
import { Card, SectionTitle, Spinner } from '../components/ui'
import { fmt, currentYear, currentMonth } from '../utils'
import type { Wallet, Transaction, Category, MonthlySummary, CategorySpend, BalancePoint } from '../types'

export default function Dashboard() {
  const { theme } = useTheme()
  const client = useApiClient()

  const [wallets, setWallets] = useState<Wallet[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [summary, setSummary] = useState<MonthlySummary | null>(null)
  const [byCategory, setByCategory] = useState<CategorySpend[]>([])
  const [balanceHistory, setBalanceHistory] = useState<BalancePoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const api = {
      wallets: walletsApi(client),
      transactions: transactionsApi(client),
      categories: categoriesApi(client),
      dashboard: dashboardApi(client),
    }
    const y = currentYear()
    const m = currentMonth()
    Promise.all([
      api.wallets.list(),
      api.transactions.list(),
      api.categories.list(),
      api.dashboard.summary(y, m),
      api.dashboard.byCategory(y, m),
      api.dashboard.balanceHistory(),
    ]).then(([w, t, c, s, bc, bh]) => {
      setWallets(w)
      setTransactions(t)
      setCategories(c)
      setSummary(s)
      setByCategory(bc)
      setBalanceHistory(bh)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />

  const totalPHP = wallets.filter(w => w.currency === 'PHP').reduce((s, w) => s + Number(w.balance), 0)
  const phpWallets = wallets.filter(w => w.currency === 'PHP')
  const otherWallets = wallets.filter(w => w.currency !== 'PHP')
  const PIE_COLORS = [theme.primary, theme.accent, '#94A3B8', '#CBD5E1', '#E2E8F0']

  const chartData = Object.values(
    balanceHistory.reduce((acc: Record<string, { date: string; balance: number }>, p) => {
      if (!acc[p.date]) acc[p.date] = { date: p.date, balance: 0 }
      acc[p.date].balance += p.balance
      return acc
    }, {})
  )

  return (
    <div style={{ padding: '0 0 100px' }}>
      {/* Hero header */}
      <div style={{ background: theme.primary, padding: '52px 24px 28px', borderRadius: '0 0 28px 28px', marginBottom: 24 }}>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 500, marginBottom: 4 }}>Total Balance (PHP)</div>
        <div style={{ fontSize: 36, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{fmt(isNaN(totalPHP) ? 0 : totalPHP)}</div>
        {summary && (
          <div style={{ display: 'flex', gap: 24, marginTop: 18 }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>Income this month</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>+{fmt(isNaN(summary.total_income) ? 0 : summary.total_income)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>Expenses this month</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>-{fmt(isNaN(summary.total_expense) ? 0 : summary.total_expense)}</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* PHP Wallet cards */}
        {phpWallets.length > 0 && (
          <>
            <SectionTitle>PHP Wallets</SectionTitle>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, marginBottom: 20 }}>
              {phpWallets.map((w, i) => (
                <div key={w.id} style={{
                  background: [theme.primary, '#16A34A', '#7C3AED', '#EA580C'][i % 4],
                  borderRadius: 16, padding: '14px 18px', minWidth: 150, flex: '0 0 auto',
                }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>{w.name}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{fmt(w.balance, w.currency)}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{w.currency}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Other Currency Wallet cards */}
        {otherWallets.length > 0 && (
          <>
            <SectionTitle>Other Currencies</SectionTitle>
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, marginBottom: 20 }}>
              {otherWallets.map((w, i) => (
                <div key={w.id} style={{
                  background: ['#0F766E', '#B45309', '#6D28D9', '#BE123C'][i % 4],
                  borderRadius: 16, padding: '14px 18px', minWidth: 150, flex: '0 0 auto',
                }}>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>{w.name}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{fmt(w.balance, w.currency)}</div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{w.currency}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Balance over time */}
        {chartData.length > 0 && (
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>Balance over time</div>
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme.primary} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={theme.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={(v: number) => [fmt(v), 'Balance']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Area type="monotone" dataKey="balance" stroke={theme.primary} strokeWidth={2} fill="url(#balGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Spending by category */}
        {byCategory.length > 0 && (
          <Card style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 14 }}>Spending by category</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <ResponsiveContainer width={100} height={100}>
                <PieChart>
                  <Pie data={byCategory} dataKey="total" nameKey="category_name" cx="50%" cy="50%" innerRadius={28} outerRadius={48} paddingAngle={3}>
                    {byCategory.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1 }}>
                {byCategory.slice(0, 5).map((c, i) => (
                  <div key={c.category_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 99, background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span style={{ fontSize: 12, color: '#64748B' }}>{c.category_name.split(' ')[0]}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>{fmt(c.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Recent transactions */}
        <SectionTitle>Recent transactions</SectionTitle>
        {transactions.slice(0, 6).map(t => {
          const cat = categories.find(c => c.id === t.category_id)
          const wallet = wallets.find(w => w.id === t.wallet_id)
          return (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: theme.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                  {cat?.icon ?? '💸'}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{t.note ?? cat?.name}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>{t.date}</div>
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: t.type === 'income' ? '#16A34A' : '#E11D48' }}>
                {t.type === 'income' ? '+' : '-'}{fmt(t.amount, wallet?.currency)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}