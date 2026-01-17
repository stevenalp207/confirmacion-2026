// CSV export helpers
function escapeCSV(value) {
  if (value === null || value === undefined) return ''
  const s = String(value)
  if (/[",\n]/.test(s)) {
    return '"' + s.replace(/"/g, '""') + '"'
  }
  return s
}

export function toCSV(rows, columns) {
  const header = columns.map((c) => escapeCSV(c.header || c.key)).join(',')
  const lines = rows.map((row) => {
    return columns
      .map((c) => escapeCSV(row[c.key]))
      .join(',')
  })
  return [header, ...lines].join('\n')
}

export function downloadCSV(filename, csvString) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
