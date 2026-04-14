export const fmt = (amount: number, currency = 'PHP'): string =>
  new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)

export const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' })
}

export const todayISO = (): string => new Date().toISOString().split('T')[0]

export const currentYear = (): number => new Date().getFullYear()
export const currentMonth = (): number => new Date().getMonth() + 1
