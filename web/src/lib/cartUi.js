export function formatCurrency(value) {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(value || 0))
}

export function truncateText(value, maxLength = 140) {
  const text = String(value ?? '').trim()

  if (text.length <= maxLength) {
    return text
  }

  return `${text.slice(0, maxLength - 1).trimEnd()}...`
}

export function getCountLabel(count) {
  return `${count} ${count === 1 ? 'artículo' : 'artículos'}`
}
