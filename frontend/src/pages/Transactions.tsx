import { useEffect, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useApiClient } from '../api/client'
import { transactionsApi } from '../api/transactions'
import { walletsApi } from '../api/wallets'
import { categoriesApi } from '../api/categories'
import { Modal, Input, Select, Btn, Spinner, EmptyState, TypeToggle } from '../components/ui'
import { fmt, todayISO } from '../utils'
import type { Transaction, Wallet, Category, TransactionType } from '../types'

interface TxForm {
  wallet_id: string
  category_id: string
  amount: string
  type: TransactionType
  note: string
  date: string
}

const emptyForm = (wallets: Wallet[], categories: Category[]): TxForm => ({
  wallet_id: wallets[0]?.id ?? '',
  category_id: categories.find(c => c.type === 'expense')?.id ?? '',
  amount: '',
  type: 'expense',
  note: '',
  date: todayISO(),
})

export default function Transactions() {
  const { theme } = useTheme()
  const client = useApiClient()
  const txApi = transactionsApi(client)

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [form, setForm] = useState<TxForm>({ wallet_id: '', category_id: '', amount: '', type: 'expense', note: '', date: todayISO() })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      txApi.list(),
      walletsApi(client).list(),
      categoriesApi(client).list(),
    ]).then(([t, w, c]) => {
      setTransactions(t)
      setWallets(w)
      setCategories(c)
    }).finally(() => setLoading(false))
  }, [])

  const openAdd = () => {
    setForm(emptyForm(wallets, categories))
    setEditing(null)
    setModal('add')
  }

  const openEdit = (t: Transaction) => {
    setForm({ wallet_id: t.wallet_id, category_id: t.category_id, amount: String(t.amount), type: t.type, note: t.note ?? '', date: t.date })
    setEditing(t)
    setModal('edit')
  }

  const closeModal = () => { setModal(null); setEditing(null) }

  // When type changes in form, reset category to a matching one
  const handleTypeChange = (type: TransactionType) => {
    const matchingCat = categories.find(c => c.type === type)
    setForm(p => ({ ...p, type, category_id: matchingCat?.id ?? '' }))
  }

  const handleSave = async () => {
    if (!form.amount || !form.wallet_id || !form.category_id) return
    setSaving(true)
    try {
      const payload = {
        wallet_id: form.wallet_id,
        category_id: form.category_id,
        amount: parseFloat(form.amount),
        type: form.type,
        note: form.note || undefined,
        date: form.date,
      }
      if (modal === 'edit' && editing) {
        const updated = await txApi.update(editing.id, payload)
        setTransactions(prev => prev.map(t => t.id === editing.id ? updated : t))
      } else {
        const created = await txApi.create(payload)
        setTransactions(prev => [created, ...prev])
      }
      closeModal()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this transaction?')) return
    await txApi.remove(id)
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const filtered = transactions.filter(t => filter === 'all' || t.type === filter)
  const filteredCats = categories.filter(c => c.type === form.type)

  if (loading) return <Spinner />

  return (
    <div style={{ padding: '60px 16px 100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', margin: 0 }}>Transactions</h1>
        <button onClick={openAdd} style={{ background: theme.primary, color: '#fff', border: 'none', borderRadius: 12, padding: '8px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          + Add
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['all', 'income', 'expense'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 16px', borderRadius: 99, border: 'none', cursor: 'pointer',
            background: filter === f ? theme.primary : '#F1F5F9',
            color: filter === f ? '#fff' : '#64748B', fontWeight: 600, fontSize: 13,
          }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0
        ? <EmptyState icon="💸" message="No transactions yet." />
        : filtered.map(t => {
          const cat = categories.find(c => c.id === t.category_id)
          const wallet = wallets.find(w => w.id === t.wallet_id)
          return (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, background: theme.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  {cat?.icon ?? '💸'}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 14 }}>{t.note ?? cat?.name}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>{t.date} · {wallet?.name} · {cat?.name}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: 15, color: t.type === 'income' ? '#16A34A' : '#E11D48' }}>
                  {t.type === 'income' ? '+' : '-'}{fmt(t.amount, wallet?.currency)}
                </div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 2 }}>
                  <button onClick={() => openEdit(t)} style={{ fontSize: 11, color: theme.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                  <button onClick={() => handleDelete(t.id)} style={{ fontSize: 11, color: '#CBD5E1', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
                </div>
              </div>
            </div>
          )
        })
      }

      {modal && (
        <Modal title={modal === 'edit' ? 'Edit Transaction' : 'New Transaction'} onClose={closeModal}>
          <TypeToggle value={form.type} onChange={handleTypeChange} />
          <Input label="Amount" type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} placeholder="0.00" />
          <Select label="Wallet" value={form.wallet_id} onChange={e => setForm(p => ({ ...p, wallet_id: e.target.value }))}>
            {wallets.map(w => <option key={w.id} value={w.id}>{w.name} ({w.currency})</option>)}
          </Select>
          <Select label="Category" value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))}>
            {filteredCats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </Select>
          <Input label="Note (optional)" value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} placeholder="What was this for?" />
          <Input label="Date" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
          <Btn onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : modal === 'edit' ? 'Save Changes' : 'Save Transaction'}</Btn>
        </Modal>
      )}
    </div>
  )
}
