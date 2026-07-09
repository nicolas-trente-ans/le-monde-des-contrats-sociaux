export function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    const next = text[i + 1]

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"'
        i += 1
      } else if (char === '"') {
        inQuotes = false
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n' || (char === '\r' && next === '\n')) {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
      if (char === '\r') i += 1
    } else if (char !== '\r') {
      field += char
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  return rows.filter((cells) => cells.some((cell) => cell.trim().length > 0))
}

export function rowsToObjects<T extends string>(rows: string[][]): Record<string, string>[] {
  if (rows.length === 0) return []

  const [header, ...dataRows] = rows
  return dataRows.map((cells) => {
    const record: Record<string, string> = {}
    header.forEach((key, index) => {
      record[key] = cells[index] ?? ''
    })
    return record as Record<T, string>
  })
}

export function dataBaseUrl(): string {
  if (import.meta.env.VITE_DATA_BASE_URL) {
    const base = import.meta.env.VITE_DATA_BASE_URL
    return base.endsWith('/') ? base : `${base}/`
  }

  const baseUrl = import.meta.env.BASE_URL || '/'
  return `${baseUrl}assets/`
}

export function assetUrl(relativePath: string): string {
  return `${dataBaseUrl()}${relativePath.replace(/^\//, '')}`
}

export function countryRoutePath(countryCode: string): string {
  return `/country/${countryCode.toUpperCase()}`
}
