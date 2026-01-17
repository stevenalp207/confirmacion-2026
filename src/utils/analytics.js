// Analytics for attendance and finance
export function attendanceRate(records) {
  if (!Array.isArray(records) || records.length === 0) return 0
  const present = records.filter((r) => r.estado === 'presente').length
  return Math.round((present / records.length) * 100)
}

export function monthlyTotals(transactions) {
  const totals = {}
  for (const t of transactions || []) {
    const date = t.fecha ? new Date(t.fecha) : null
    if (!date || isNaN(date.getTime())) continue
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    const amount = typeof t.monto === 'number' ? t.monto : Number(t.monto)
    if (isNaN(amount)) continue
    totals[key] = (totals[key] || 0) + amount
  }
  return totals
}

export function outstandingPayments(payments, expected = 50000) {
  const map = new Map()
  for (const p of payments || []) {
    const id = p.estudianteId || p.id || p.studentId
    const amount = typeof p.monto === 'number' ? p.monto : Number(p.monto)
    if (!id || isNaN(amount)) continue
    map.set(id, (map.get(id) || 0) + amount)
  }
  const result = []
  for (const [id, paid] of map.entries()) {
    const remaining = Math.max(0, expected - paid)
    result.push({ id, paid, remaining })
  }
  return result
}

export function groupStats(students) {
  const stats = {}
  for (const s of students || []) {
    const g = s.grupo || 'Sin grupo'
    stats[g] = (stats[g] || 0) + 1
  }
  return stats
}
