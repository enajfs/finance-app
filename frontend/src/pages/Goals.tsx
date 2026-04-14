import { useEffect, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useApiClient } from '../api/client'
import { savingsGoalsApi } from '../api/savingsGoals'
import { Card, ProgressBar, Modal, Input, Select, Btn, Spinner, EmptyState } from '../components/ui'
import { fmt } from '../utils'
import type { SavingsGoal } from '../types'

const GOAL_COLORS = ['#2563EB', '#16A34A', '#7C3AED', '#EA580C', '#E11D48']
const CURRENCIES = ['PHP', 'USD', 'EUR', 'SGD', 'GBP']

const emptyForm = { name: '', target_amount: '', current_amount: '0', currency: 'PHP', deadline: '' }

export default function Goals() {
  const { theme } = useTheme()
  const client = useApiClient()
  const api = savingsGoalsApi(client)

  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add' | 'edit' | 'funds' | null>(null)
  const [editing, setEditing] = useState<SavingsGoal | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [addAmt, setAddAmt] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => api.list().then(setGoals).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(emptyForm); setEditing(null); setModal('add') }

  const openEdit = (g: SavingsGoal) => {
    setForm({ name: g.name, target_amount: String(g.target_amount), current_amount: String(g.current_amount), currency: g.currency, deadline: g.deadline ?? '' })
    setEditing(g)
    setModal('edit')
  }

  const openFunds = (g: SavingsGoal) => { setEditing(g); setAddAmt(''); setModal('funds') }
  const closeModal = () => { setModal(null); setEditing(null) }

  const handleSave = async () => {
    if (!form.name || !form.target_amount) return
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        target_amount: parseFloat(form.target_amount),
        current_amount: parseFloat(form.current_amount) || 0,
        currency: form.currency,
        deadline: form.deadline || null,
      }
      if (modal === 'edit' && editing) {
        const updated = await api.update(editing.id, payload)
        setGoals(prev => prev.map(g => g.id === editing.id ? updated : g))
      } else {
        const created = await api.create(payload)
        setGoals(prev => [...prev, created])
      }
      closeModal()
    } finally {
      setSaving(false)
    }
  }

  const handleAddFunds = async () => {
    if (!addAmt || !editing) return
    setSaving(true)
    try {
      const newAmount = Math.min(
        parseFloat(String(editing.current_amount)) + parseFloat(addAmt),
        parseFloat(String(editing.target_amount))
      )
      const updated = await api.update(editing.id, { current_amount: newAmount })
      setGoals(prev => prev.map(g => g.id === editing.id ? updated : g))
      closeModal()
    } finally {
      setSaving(false)
    }
  }
  
  const handleDelete = async (id: string) => {
    if (!confirm('Delete this savings goal?')) return
    await api.remove(id)
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  if (loading) return <Spinner />

  return (
    <div style={{ padding: '60px 16px 100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', margin: 0 }}>Savings Goals</h1>
        <button onClick={openAdd} style={{ background: theme.primary, color: '#fff', border: 'none', borderRadius: 12, padding: '8px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          + New
        </button>
      </div>

      {goals.length === 0
        ? <EmptyState icon="🎯" message="No savings goals yet. Create your first goal." />
        : (
          <div style={{ display: 'grid', gap: 14 }}>
            {goals.map((g, i) => {
              const pct = Math.round((g.current_amount / g.target_amount) * 100)
              const color = GOAL_COLORS[i % GOAL_COLORS.length]
              const remaining = g.target_amount - g.current_amount
              return (
                <Card key={g.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: '#0F172A' }}>{g.name}</div>
                      {g.deadline && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>Due {g.deadline}</div>}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ background: color, color: '#fff', fontSize: 13, fontWeight: 800, padding: '4px 10px', borderRadius: 99 }}>{pct}%</div>
                    </div>
                  </div>

                  <ProgressBar pct={pct} color={color} />

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>Saved</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{fmt(g.current_amount, g.currency)}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>Target</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{fmt(g.target_amount, g.currency)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>Remaining</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{fmt(remaining, g.currency)}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => openFunds(g)} style={{
                      flex: 1, padding: '10px', borderRadius: 10, border: `1.5px solid ${color}`,
                      background: 'transparent', color: color, fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    }}>
                      + Add Funds
                    </button>
                    <button onClick={() => openEdit(g)} style={{
                      padding: '10px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0',
                      background: 'transparent', color: theme.primary, fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(g.id)} style={{
                      padding: '10px 14px', borderRadius: 10, border: '1.5px solid #FEE2E2',
                      background: 'transparent', color: '#E11D48', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                    }}>
                      Delete
                    </button>
                  </div>
                </Card>
              )
            })}
          </div>
        )
      }

      {/* Add Funds Modal */}
      {modal === 'funds' && editing && (
        <Modal title={`Add Funds — ${editing.name}`} onClose={closeModal}>
          <div style={{ background: '#F8FAFC', borderRadius: 12, padding: '12px 16px', marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#64748B' }}>Current progress</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginTop: 4 }}>
              {fmt(editing.current_amount, editing.currency)} / {fmt(editing.target_amount, editing.currency)}
            </div>
          </div>
          <Input label="Amount to add" type="number" value={addAmt} onChange={e => setAddAmt(e.target.value)} placeholder="0.00" />
          <Btn onClick={handleAddFunds} disabled={saving}>{saving ? 'Saving…' : 'Add Funds'}</Btn>
        </Modal>
      )}

      {/* Add / Edit Goal Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <Modal title={modal === 'edit' ? 'Edit Goal' : 'New Goal'} onClose={closeModal}>
          <Input label="Goal name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Emergency Fund" />
          <Input label="Target amount" type="number" value={form.target_amount} onChange={e => setForm(p => ({ ...p, target_amount: e.target.value }))} placeholder="0.00" />
          <Input label="Current amount" type="number" value={form.current_amount} onChange={e => setForm(p => ({ ...p, current_amount: e.target.value }))} placeholder="0.00" />
          <Select label="Currency" value={form.currency} onChange={e => setForm(p => ({ ...p, currency: e.target.value }))}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Input label="Deadline (optional)" type="date" value={form.deadline} onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
          <Btn onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : modal === 'edit' ? 'Save Changes' : 'Create Goal'}</Btn>
        </Modal>
      )}
    </div>
  )
}
