import { useEffect, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useApiClient } from '../api/client'
import { walletsApi } from '../api/wallets'
import { Card, MetricCard, Modal, Input, Select, Btn, Spinner, EmptyState, SectionTitle } from '../components/ui'
import { fmt } from '../utils'
import type { Wallet } from '../types'

const CURRENCIES = ['PHP', 'USD', 'EUR', 'SGD', 'GBP', 'JPY', 'AUD']

const emptyForm = { name: '', currency: 'PHP', balance: '' }

export default function Wallets() {
  const { theme } = useTheme()
  const client = useApiClient()
  const api = walletsApi(client)

  const [wallets, setWallets] = useState<Wallet[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Wallet | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = () => api.list().then(setWallets).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(emptyForm); setEditing(null); setModal('add') }
  const openEdit = (w: Wallet) => { setForm({ name: w.name, currency: w.currency, balance: String(w.balance) }); setEditing(w); setModal('edit') }
  const closeModal = () => { setModal(null); setEditing(null) }

  const handleSave = async () => {
    if (!form.name || !form.balance) return
    setSaving(true)
    try {
      const payload = { name: form.name, currency: form.currency, balance: parseFloat(form.balance) }
      if (modal === 'edit' && editing) {
        const updated = await api.update(editing.id, payload)
        setWallets(prev => prev.map(w => w.id === editing.id ? updated : w))
      } else {
        const created = await api.create(payload)
        setWallets(prev => [...prev, created])
      }
      closeModal()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this wallet? All its transactions will also be removed.')) return
    await api.remove(id)
    setWallets(prev => prev.filter(w => w.id !== id))
  }

  const totalPHP = wallets.filter(w => w.currency === 'PHP').reduce((s, w) => s + Number(w.balance), 0)
  const WALLET_COLORS = [theme.primary, '#16A34A', '#7C3AED', '#EA580C', '#E11D48']

  if (loading) return <Spinner />

  return (
    <div style={{ padding: '60px 16px 100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', margin: 0 }}>Wallets</h1>
        <button onClick={openAdd} style={{ background: theme.primary, color: '#fff', border: 'none', borderRadius: 12, padding: '8px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          + Add
        </button>
      </div>

      {wallets.length === 0
        ? <EmptyState icon="💳" message="No wallets yet. Add your first wallet." />
        : (
          <div style={{ display: 'grid', gap: 12, marginBottom: 20 }}>
            {wallets.map((w, i) => (
              <Card key={w.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: WALLET_COLORS[i % WALLET_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16 }}>
                    {w.currency[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0F172A', fontSize: 15 }}>{w.name}</div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>{w.currency}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, fontSize: 18, color: '#0F172A' }}>{fmt(w.balance, w.currency)}</div>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                    <button onClick={() => openEdit(w)} style={{ fontSize: 11, color: theme.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                    <button onClick={() => handleDelete(w.id)} style={{ fontSize: 11, color: '#E11D48', background: 'none', border: 'none', cursor: 'pointer' }}>Remove</button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      }

      <SectionTitle>Summary</SectionTitle>
<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
  <MetricCard label="Total PHP" value={fmt(isNaN(totalPHP) ? 0 : totalPHP)} />
  <MetricCard label="Wallets" value={wallets.length} />
</div>
{wallets.filter(w => w.currency !== 'PHP').length > 0 && (
  <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
    {Object.entries(
      wallets.filter(w => w.currency !== 'PHP').reduce((acc: Record<string, number>, w) => {
        acc[w.currency] = (acc[w.currency] || 0) + Number(w.balance)
        return acc
      }, {})
    ).map(([currency, total]) => (
      <MetricCard key={currency} label={`Total ${currency}`} value={fmt(isNaN(total) ? 0 : total, currency)} />
    ))}
  </div>
)}
      {modal && (
        <Modal title={modal === 'edit' ? 'Edit Wallet' : 'New Wallet'} onClose={closeModal}>
          <Input label="Wallet name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Main Account" />
          <Select label="Currency" value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Input label="Balance" type="number" value={form.balance} onChange={e => setForm(p => ({ ...p, balance: e.target.value }))} placeholder="0.00" />
          <Btn onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : modal === 'edit' ? 'Save Changes' : 'Create Wallet'}</Btn>
        </Modal>
      )}
    </div>
  )
}
