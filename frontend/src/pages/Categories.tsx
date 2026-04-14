import { useEffect, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useApiClient } from '../api/client'
import { categoriesApi } from '../api/categories'
import { Card, Modal, Input, Select, Btn, Spinner, EmptyState, TypeToggle } from '../components/ui'
import type { Category, CategoryType } from '../types'

const ICON_OPTIONS = ['🍜','🚗','🛍️','💡','🎬','💼','💰','🏥','✈️','🏠','📚','🐾','💅','🎮','🏋️','☕','🎁','🍺','💊','🌱']

const emptyForm = { name: '', type: 'expense' as CategoryType, icon: '💸' }

export default function Categories() {
  const { theme } = useTheme()
  const client = useApiClient()
  const api = categoriesApi(client)

  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<'add' | 'edit' | null>(null)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = () => api.list().then(setCategories).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openAdd = () => { setForm(emptyForm); setEditing(null); setModal('add') }
  const openEdit = (c: Category) => { setForm({ name: c.name, type: c.type, icon: c.icon ?? '💸' }); setEditing(c); setModal('edit') }
  const closeModal = () => { setModal(null); setEditing(null) }

  const handleSave = async () => {
    if (!form.name) return
    setSaving(true)
    try {
      if (modal === 'edit' && editing) {
        const updated = await api.update(editing.id, form)
        setCategories(prev => prev.map(c => c.id === editing.id ? updated : c))
      } else {
        const created = await api.create(form)
        setCategories(prev => [...prev, created])
      }
      closeModal()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return
    await api.remove(id)
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  const income = categories.filter(c => c.type === 'income')
  const expense = categories.filter(c => c.type === 'expense')

  if (loading) return <Spinner />

  const CatList = ({ items }: { items: Category[] }) => (
    <div style={{ display: 'grid', gap: 8 }}>
      {items.map(c => (
        <div key={c.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 12, background: theme.light, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              {c.icon ?? '💸'}
            </div>
            <span style={{ fontWeight: 600, color: '#0F172A', fontSize: 14 }}>{c.name}</span>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => openEdit(c)} style={{ fontSize: 12, color: theme.primary, background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
            <button onClick={() => handleDelete(c.id)} style={{ fontSize: 12, color: '#E11D48', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div style={{ padding: '60px 16px 100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', margin: 0 }}>Categories</h1>
        <button onClick={openAdd} style={{ background: theme.primary, color: '#fff', border: 'none', borderRadius: 12, padding: '8px 18px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          + Add
        </button>
      </div>

      {categories.length === 0
        ? <EmptyState icon="🗂️" message="No categories yet." />
        : (
          <>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#16A34A', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Income</div>
              {income.length === 0 ? <div style={{ fontSize: 13, color: '#94A3B8' }}>No income categories</div> : <CatList items={income} />}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#E11D48', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Expense</div>
              {expense.length === 0 ? <div style={{ fontSize: 13, color: '#94A3B8' }}>No expense categories</div> : <CatList items={expense} />}
            </div>
          </>
        )
      }

      {modal && (
        <Modal title={modal === 'edit' ? 'Edit Category' : 'New Category'} onClose={closeModal}>
          <TypeToggle value={form.type} onChange={v => setForm(p => ({ ...p, type: v }))} />
          <Input label="Category name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Food & Dining" />
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: '#64748B', display: 'block', marginBottom: 8, letterSpacing: '0.03em' }}>Icon</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {ICON_OPTIONS.map(icon => (
                <button
                  key={icon}
                  onClick={() => setForm(p => ({ ...p, icon }))}
                  style={{
                    width: 40, height: 40, borderRadius: 10, border: '1.5px solid',
                    borderColor: form.icon === icon ? theme.primary : '#E2E8F0',
                    background: form.icon === icon ? theme.light : '#fff',
                    fontSize: 20, cursor: 'pointer',
                  }}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <Btn onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : modal === 'edit' ? 'Save Changes' : 'Create Category'}</Btn>
        </Modal>
      )}
    </div>
  )
}
