/*import React, { useState } from 'react';
import { api } from '@/lib/api.js';

export function ImportPage() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { created, errorsCount, errors: [...] }
  const [errMsg, setErrMsg] = useState('');

  const onUpload = async () => {
  if (!file) return;
  setLoading(true);
  setErrMsg('');
  setResult(null);
  try {
    const fd = new FormData();
    fd.append('file', file);

    // NO pongas Content-Type; deja que el navegador lo ponga con boundary
    const { data } = await api.post('/cashflows/import', fd);

    setResult(data);
  } catch (e) {
    // muestra el mensaje real del backend
    setErrMsg(e.response?.data?.error || e.message);
    console.error(e.response?.data || e);
  } finally {
    setLoading(false);
  }
};


  const onChangeFile = e => {
    setFile(e.target.files?.[0] || null);
    setResult(null);
    setErrMsg('');
  };

  return (
    <div className="page">
      <div className="card" style={{ display: 'grid', gap: 12, maxWidth: 520 }}>
        <h3>Importar vencimientos</h3>
        <input
          className="input"
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={onChangeFile}
        />
        <button className="btn" onClick={onUpload} disabled={!file || loading}>
          {loading ? 'Subiendo…' : 'Subir'}
        </button>

        <p className="muted">
          Formato: columnas <code>fecha|date</code>, <code>importe|amount</code>,{' '}
          <code>tipo|type</code> (<code>Pago/out</code> o <code>Cobro/in</code>),{' '}
          <code>cuenta|account</code> (alias existente), <code>proveedor|counterparty</code>,{' '}
          <code>categoria|category</code>, <code>concepto|concept</code>, <code>estado|status</code>.
        </p>

        {errMsg && (
          <div className="alert error">
            Error: {errMsg}
          </div>
        )}

        {result && (
          <div className="card" style={{ padding: 12 }}>
            <div style={{ marginBottom: 8 }}>
              <strong>Importación completada</strong>
              <div>Creados: {result.created}</div>
              <div>Errores: {result.errorsCount}</div>
            </div>

            {Array.isArray(result.errors) && result.errors.length > 0 && (
              <div style={{ maxHeight: 260, overflow: 'auto' }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Fila</th>
                      <th>Error</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.map((e, idx) => (
                      <tr key={idx}>
                        <td>{e.row ?? '-'}</td>
                        <td>{e.error}</td>
                        <td>{e.value ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
*/
/*
// frontend/src/ui/pages/ImportPage.jsx
import React, { useState } from 'react'
import { api } from '@/lib/api.js'


const norm = (s) => (s ?? '').toString().trim()
const lc = (s) => norm(s).toLowerCase()
const normConcept = (s) => lc(s).replace(/\s+/g, ' ').replace(/[^\p{L}\p{N}\s]/gu, '').trim()

const toYMD = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`

const parseDateLoose = (v) => {
  if (!v) return null
  if (v instanceof Date && !isNaN(v)) return v
  const s = String(v).trim().split(/[ T]/)[0]
  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/)
  if (m) return new Date(+m[1], +m[2] - 1, +m[3])
  m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})$/)
  if (m) {
    const yy = m[3].length === 2 ? (+m[3] >= 70 ? 1900 + +m[3] : 2000 + +m[3]) : +m[3]
    return new Date(yy, +m[2] - 1, +m[1])
  }
  return null
}

const parseAmount = (v) => {
  if (v == null || v === '') return NaN
  if (typeof v === 'number') return v
  let s = String(v).trim().replace(/[€$]/g, '').replace(/\s+/g, '')
  let neg = false
  if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1) }
  if (/-$/.test(s)) { neg = true; s = s.slice(0, -1) }
  const c = s.lastIndexOf(','), d = s.lastIndexOf('.')
  s = c > d ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '')
  let n = parseFloat(s); if (neg) n = -n
  return isNaN(n) ? NaN : n
}

const headerMap = (h) => {
  const k = (h ?? '')
    .toString()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[\s._-]+/g, '')
  if (['date', 'fecha', 'fechavencimiento', 'fechavto', 'vencimiento'].includes(k)) return 'date'
  if (['amount', 'importe', 'valor', 'importevto', 'importeoperacion'].includes(k)) return 'amount'
  if (['type', 'tipo'].includes(k)) return 'type'
  if (['account', 'cuenta', 'accountalias', 'cuentaalias', 'banco'].includes(k)) return 'account'
  if (['counterparty', 'proveedor', 'cliente', 'tercero', 'beneficiario', 'pagador'].includes(k)) return 'counterparty'
  if (['category', 'categoria'].includes(k)) return 'category'
  if (['concept', 'concepto', 'descripcion', 'detalle', 'title'].includes(k)) return 'concept'
  if (['status', 'estado'].includes(k)) return 'status'
  return null
}


const amtKey = (amt) => Number(Math.abs(amt)).toFixed(2)
const dirBySign = (amt) => (amt < 0 ? 'out' : 'in') // no dependas de "type" textual
const ymdVariants = (ymd) => {
  const [y, m, d] = ymd.split('-').map(Number)
  const base = new Date(y, m - 1, d)
  const to = (dt) =>
    `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
  return [to(base), to(new Date(base.getFullYear(), base.getMonth(), base.getDate() - 1)), to(new Date(base.getFullYear(), base.getMonth(), base.getDate() + 1))]
}


const rowKeyStrict = (r) => [
  r.dateYMD,
  dirBySign(r.amount),
  amtKey(r.amount),
  lc(r.account || ''),
  lc(r.category || ''),
  lc(r.counterparty || ''),
  lc(r.concept || ''),
].join('|')

const rowKeyRelax = (r) => [
  r.dateYMD,
  dirBySign(r.amount),
  amtKey(r.amount),
  normConcept(r.concept || ''),
].join('|') // ignora cuenta/categoría/contraparte


const splitCSV = (line) => {
  const out = []; let cur = ''; let q = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++ } else { q = !q } }
    else if (c === ',' && !q) { out.push(cur); cur = '' }
    else { cur += c }
  }
  out.push(cur)
  return out
}
const parseCsv = (text) => {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(Boolean)
  if (!lines.length) return []
  const headers = splitCSV(lines[0]).map(h => h.trim())
  const mapped = headers.map(headerMap)
  const out = []
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSV(lines[i]); if (!cols.length || cols.every(c => !c.trim())) continue
    const tmp = {}; mapped.forEach((k, idx) => { if (k) tmp[k] = cols[idx] })
    const d = parseDateLoose(tmp.date); const amt = parseAmount(tmp.amount); const acc = norm(tmp.account)
    if (!d || isNaN(amt) || !acc) continue
    out.push({
      dateYMD: toYMD(d),
      amount: amt,
      account: acc,
      counterparty: norm(tmp.counterparty),
      category: norm(tmp.category),
      concept: norm(tmp.concept),
      status: ['pending', 'paid', 'cancelled'].includes(lc(tmp.status)) ? lc(tmp.status) : 'pending'
    })
  }
  return out
}


async function parseXlsx(file) {
  const { read, utils } = await import('xlsx')
  const buf = await file.arrayBuffer()
  const wb = read(buf, { type: 'array', cellDates: true })
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name]
    const rows = utils.sheet_to_json(ws, { defval: '', raw: true })
    if (!rows.length) continue
    const mappedRows = rows.map(row => {
      const rec = {}
      for (const [h, v] of Object.entries(row)) { const k = headerMap(h) || null; if (k) rec[k] = v }
      return rec
    })
    const out = []
    for (const r of mappedRows) {
      const d = parseDateLoose(r.date); const amt = parseAmount(r.amount); const acc = norm(r.account)
      if (!d || isNaN(amt) || !acc) continue
      out.push({
        dateYMD: toYMD(d),
        amount: amt,
        account: acc,
        counterparty: norm(r.counterparty),
        category: norm(r.category),
        concept: norm(r.concept),
        status: ['pending', 'paid', 'cancelled'].includes(lc(r.status)) ? lc(r.status) : 'pending'
      })
    }
    if (out.length) return out
  }
  return []
}


export function ImportPage() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [errMsg, setErrMsg] = useState('')

  const dedupeAndUpload = async (records) => {
    if (!records.length) return { created: 0, skipped: 0, errorsCount: 0, errors: [] }

    const minYMD = records.reduce((m, r) => (r.dateYMD < m ? r.dateYMD : m), records[0].dateYMD)
    const maxYMD = records.reduce((m, r) => (r.dateYMD > m ? r.dateYMD : m), records[0].dateYMD)

    // lee existentes con concept real
    const { data: existing } = await api.get('/cashflows', { params: { from: minYMD, to: maxYMD } })
    const ymdLocal = (d) => (typeof d === 'string' ? d.slice(0, 10) : toYMD(new Date(d)))

    // sets con tolerancia ±1 día y valor absoluto
    const existingStrict = new Set()
    const existingRelax = new Set()
    for (const doc of existing) {
      const ymd = ymdLocal(doc.date)
      const amk = amtKey(doc.amount)
      const dir = dirBySign(doc.amount)
      const acc = lc(doc.account?.alias || '')
      const cat = lc(doc.category?.name || '')
      const cpty = lc(doc.counterparty?.name || '')
      const cpt = lc(doc.concept || '')
      const cptNorm = normConcept(doc.concept || '')
      for (const v of ymdVariants(ymd)) {
        existingStrict.add([v, dir, amk, acc, cat, cpty, cpt].join('|'))
        existingRelax.add([v, dir, amk, cptNorm].join('|'))
      }
    }

    const unique = []
    let skipped = 0
    for (const r of records) {
      let dup = false
      for (const v of ymdVariants(r.dateYMD)) {
        const kS = rowKeyStrict({ ...r, dateYMD: v })
        const kR = rowKeyRelax({ ...r, dateYMD: v })
        if (existingStrict.has(kS) || existingRelax.has(kR)) { dup = true; break }
      }
      if (dup) skipped++
      else unique.push(r)
    }

    if (!unique.length) return { created: 0, skipped, errorsCount: 0, errors: [] }

    // sube solo los no duplicados en CSV
    const headers = ['date', 'amount', 'type', 'account', 'counterparty', 'category', 'concept', 'status']
    const esc = (v) => {
      const s = v == null ? '' : String(v)
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const lines = [headers.join(',')]
    for (const r of unique) {
      const typeCanonical = dirBySign(r.amount) // opcional, puedes mantener r.type si venía
      lines.push([r.dateYMD, r.amount, typeCanonical, r.account, r.counterparty, r.category, r.concept, r.status].map(esc).join(','))
    }
    const csv = lines.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const fd = new FormData()
    fd.append('file', blob, 'filtered.csv')
    const { data } = await api.post('/cashflows/import', fd)
    return { ...data, skipped: (data.skipped || 0) + skipped }
  }

  const onUpload = async () => {
    if (!file) return
    setLoading(true); setErrMsg(''); setResult(null)
    try {
      let records = []
      if (/\.csv$/i.test(file.name)) {
        const text = await file.text()
        records = parseCsv(text)
      } else if (/\.(xlsx|xls)$/i.test(file.name)) {
        records = await parseXlsx(file)
      } else {
        const fd = new FormData(); fd.append('file', file)
        const { data } = await api.post('/cashflows/import', fd)
        setResult(data); return
      }

      const data = await dedupeAndUpload(records)
      setResult(data)
    } catch (e) {
      try {
        const fd = new FormData(); fd.append('file', file)
        const { data } = await api.post('/cashflows/import', fd)
        setResult(data)
      } catch (err) {
        setErrMsg(err.response?.data?.error || err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const onChangeFile = (e) => {
    setFile(e.target.files?.[0] || null)
    setResult(null)
    setErrMsg('')
  }

  return (
    <div className="page">
      <div className="card" style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
        <h3>Importar vencimientos</h3>
        <input className="input" type="file" accept=".csv,.xlsx,.xls" onChange={onChangeFile} />
        <button className="btn" onClick={onUpload} disabled={!file || loading}>
          {loading ? 'Importando…' : 'Importar'}
        </button>

        <p className="muted">
          Columnas: <code>date, amount, type, account, counterparty, category, concept, status</code>. Se evita duplicar contra lo ya existente.
        </p>

        {errMsg && <div className="alert error">Error: {errMsg}</div>}

        {result && (
          <div className="card" style={{ padding: 12 }}>
            <strong>Importación completada</strong>
            <div>Nuevos: {result.created}</div>
            {'skipped' in result ? <div>Omitidos por duplicado: {result.skipped}</div> : null}
            <div>Errores: {result.errorsCount}</div>
          </div>
        )}
      </div>
    </div>
  )
}
*/

// frontend/src/ui/pages/ImportPage.jsx
import React, { useState } from 'react'
import { api } from '@/lib/api.js'

/* ========= Utils ========= */
const norm = (s) => (s ?? '').toString().trim()
const canon = (s) =>
  (s ?? '')
    .toString()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[\s\-_()\.,"']/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .trim()

const toYMD = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`

const parseDateLoose = (v) => {
  if (!v) return null
  if (v instanceof Date && !isNaN(v)) return v
  const s = String(v).trim().split(/[ T]/)[0]
  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/)
  if (m) return new Date(+m[1], +m[2] - 1, +m[3])
  m = s.match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})$/)
  if (m) {
    const yy = m[3].length === 2 ? (+m[3] >= 70 ? 1900 + +m[3] : 2000 + +m[3]) : +m[3]
    return new Date(yy, +m[2] - 1, +m[1])
  }
  return null
}

const parseAmount = (v) => {
  if (v == null || v === '') return NaN
  if (typeof v === 'number') return v
  let s = String(v).trim().replace(/[€$]/g, '').replace(/\s+/g, '')
  let neg = false
  if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1) }
  if (/-$/.test(s)) { neg = true; s = s.slice(0, -1) }
  const c = s.lastIndexOf(','), d = s.lastIndexOf('.')
  s = c > d ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '')
  let n = parseFloat(s); if (neg) n = -n
  return isNaN(n) ? NaN : n
}

const headerMap = (h) => {
  const k = (h ?? '')
    .toString()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[\s._-]+/g, '')
  if (['date','fecha','fechavencimiento','fechavto','vencimiento'].includes(k)) return 'date'
  if (['amount','importe','valor','importevto','importeoperacion'].includes(k)) return 'amount'
  if (['type','tipo'].includes(k)) return 'type'
  if (['account','cuenta','accountalias','cuentaalias','banco'].includes(k)) return 'account'
  if (['counterparty','proveedor','cliente','tercero','beneficiario','pagador'].includes(k)) return 'counterparty'
  if (['category','categoria'].includes(k)) return 'category'
  if (['concept','concepto','descripcion','detalle','title'].includes(k)) return 'concept'
  if (['status','estado'].includes(k)) return 'status'
  return null
}

/* Dirección canónica y tolerancias */
const amtKey = (amt) => Number(Math.abs(amt)).toFixed(2)
const dirBySign = (amt) => (amt < 0 ? 'out' : 'in') // no dependas de "type" textual
const ymdVariants = (ymd) => {
  const [y, m, d] = ymd.split('-').map(Number)
  const base = new Date(y, m - 1, d)
  const to = (dt) =>
    `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`
  return [to(base), to(new Date(base.getFullYear(), base.getMonth(), base.getDate() - 1)), to(new Date(base.getFullYear(), base.getMonth(), base.getDate() + 1))]
}

/* Claves */
const rowKeyStrict = (r) => [
  r.dateYMD,
  dirBySign(r.amount),
  amtKey(r.amount),
  canon(r.account),
  canon(r.category),
  canon(r.counterparty),
  canon(r.concept),
].join('|')

const rowKeyRelax = (r) => [
  r.dateYMD,
  dirBySign(r.amount),
  amtKey(r.amount),
  canon(r.concept),
].join('|') // ignora cuenta/categoría/contraparte

/* CSV parsing ligero */
const splitCSV = (line) => {
  const out = []; let cur = ''; let q = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') { if (q && line[i + 1] === '"') { cur += '"'; i++ } else { q = !q } }
    else if (c === ',' && !q) { out.push(cur); cur = '' }
    else { cur += c }
  }
  out.push(cur)
  return out
}
const parseCsv = (text) => {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter(Boolean)
  if (!lines.length) return []
  const headers = splitCSV(lines[0]).map(h => h.trim())
  const mapped = headers.map(headerMap)
  const out = []
  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSV(lines[i]); if (!cols.length || cols.every(c => !c.trim())) continue
    const tmp = {}; mapped.forEach((k, idx) => { if (k) tmp[k] = cols[idx] })
    const d = parseDateLoose(tmp.date); const amt = parseAmount(tmp.amount); const acc = norm(tmp.account)
    if (!d || isNaN(amt) || !acc) continue
    out.push({
      dateYMD: toYMD(d),
      amount: amt,
      account: acc,
      counterparty: norm(tmp.counterparty),
      category: norm(tmp.category),
      concept: norm(tmp.concept),
      status: ['pending','paid','cancelled'].includes((tmp.status||'').toString().toLowerCase()) ? (tmp.status||'').toString().toLowerCase() : 'pending'
    })
  }
  return out
}

/* XLSX parsing en cliente */
async function parseXlsx(file) {
  const { read, utils } = await import('xlsx')
  const buf = await file.arrayBuffer()
  const wb = read(buf, { type: 'array', cellDates: true })
  for (const name of wb.SheetNames) {
    const ws = wb.Sheets[name]
    const rows = utils.sheet_to_json(ws, { defval: '', raw: true })
    if (!rows.length) continue
    const mappedRows = rows.map(row => {
      const rec = {}
      for (const [h, v] of Object.entries(row)) { const k = headerMap(h) || null; if (k) rec[k] = v }
      return rec
    })
    const out = []
    for (const r of mappedRows) {
      const d = parseDateLoose(r.date); const amt = parseAmount(r.amount); const acc = norm(r.account)
      if (!d || isNaN(amt) || !acc) continue
      out.push({
        dateYMD: toYMD(d),
        amount: amt,
        account: acc,
        counterparty: norm(r.counterparty),
        category: norm(r.category),
        concept: norm(r.concept),
        status: ['pending','paid','cancelled'].includes((r.status||'').toString().toLowerCase()) ? (r.status||'').toString().toLowerCase() : 'pending'
      })
    }
    if (out.length) return out
  }
  return []
}

/* ========= Componente ========= */
export function ImportPage() {
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [errMsg, setErrMsg] = useState('')

  const dedupeAndUpload = async (records) => {
    if (!records.length) return { created: 0, skipped: 0, errorsCount: 0, errors: [] }

    const minYMD = records.reduce((m, r) => (r.dateYMD < m ? r.dateYMD : m), records[0].dateYMD)
    const maxYMD = records.reduce((m, r) => (r.dateYMD > m ? r.dateYMD : m), records[0].dateYMD)

    const { data: existing } = await api.get('/cashflows', { params: { from: minYMD, to: maxYMD } })
    const ymdLocal = (d) => (typeof d === 'string' ? d.slice(0, 10) : toYMD(new Date(d)))

    const existingStrict = new Set()
    const existingRelax = new Set()
    for (const doc of existing) {
      const ymd = ymdLocal(doc.date)
      const amk = amtKey(doc.amount)
      const dir = dirBySign(doc.amount)
      const acc = canon(doc.account?.alias)
      const cat = canon(doc.category?.name)
      const cpty = canon(doc.counterparty?.name)
      const cpt = canon(doc.concept)
      const cptNorm = canon(doc.concept)
      for (const v of ymdVariants(ymd)) {
        existingStrict.add([v, dir, amk, acc, cat, cpty, cpt].join('|'))
        existingRelax.add([v, dir, amk, cptNorm].join('|'))
      }
    }

    const unique = []
    let skipped = 0
    for (const r of records) {
      let dup = false
      for (const v of ymdVariants(r.dateYMD)) {
        const kS = rowKeyStrict({ ...r, dateYMD: v })
        const kR = rowKeyRelax({ ...r, dateYMD: v })
        if (existingStrict.has(kS) || existingRelax.has(kR)) { dup = true; break }
      }
      if (dup) skipped++
      else unique.push(r)
    }

    if (!unique.length) return { created: 0, skipped, errorsCount: 0, errors: [] }

    // sube solo los no duplicados en CSV
    const headers = ['date','amount','type','account','counterparty','category','concept','status']
    const esc = (v) => {
      const s = v == null ? '' : String(v)
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
    }
    const lines = [headers.join(',')]
    for (const r of unique) {
      const typeCanonical = dirBySign(r.amount)
      lines.push([r.dateYMD, r.amount, typeCanonical, r.account, r.counterparty, r.category, r.concept, r.status].map(esc).join(','))
    }
    const csv = lines.join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const fd = new FormData()
    fd.append('file', blob, 'filtered.csv')
    const { data } = await api.post('/cashflows/import', fd)
    return { ...data, skipped: (data.skipped || 0) + skipped }
  }

  const onUpload = async () => {
    if (!file) return
    setLoading(true); setErrMsg(''); setResult(null)
    try {
      let records = []
      if (/\.csv$/i.test(file.name)) {
        const text = await file.text()
        records = parseCsv(text)
      } else if (/\.(xlsx|xls)$/i.test(file.name)) {
        records = await parseXlsx(file)
      } else {
        const fd = new FormData(); fd.append('file', file)
        const { data } = await api.post('/cashflows/import', fd)
        setResult(data); return
      }

      const data = await dedupeAndUpload(records)
      setResult(data)
    } catch (e) {
      try {
        const fd = new FormData(); fd.append('file', file)
        const { data } = await api.post('/cashflows/import', fd)
        setResult(data)
      } catch (err) {
        setErrMsg(err.response?.data?.error || err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const onChangeFile = (e) => {
    setFile(e.target.files?.[0] || null)
    setResult(null)
    setErrMsg('')
  }

  return (
    <div className="page">
      <div className="card" style={{ display: 'grid', gap: 12, maxWidth: 640 }}>
        <h3>Importar vencimientos</h3>
        <input className="input" type="file" accept=".csv,.xlsx,.xls" onChange={onChangeFile} />
        <button className="btn" onClick={onUpload} disabled={!file || loading}>
          {loading ? 'Importando…' : 'Importar'}
        </button>

        <p className="muted">
          Columnas: <code>date, amount, type, account, counterparty, category, concept, status</code>. Se evita duplicar contra lo ya existente.
        </p>

        {errMsg && <div className="alert error">Error: {errMsg}</div>}

        {result && (
          <div className="card" style={{ padding: 12 }}>
            <strong>Importación completada</strong>
            <div>Nuevos: {result.created}</div>
            {'skipped' in result ? <div>Omitidos por duplicado: {result.skipped}</div> : null}
            <div>Errores: {result.errorsCount}</div>
          </div>
        )}
      </div>
    </div>
  )
}
