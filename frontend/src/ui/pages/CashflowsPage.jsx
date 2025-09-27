import React, { useState } from 'react'
import { DataTable } from '../components/DataTable.jsx'
import { useUrlState } from '../../hooks/useUrlState.js'
import { useDebounce } from '../../hooks/useDebounce.js'

const mock = Array.from({length:20}).map((_,i)=> ({ date:`2025-10-${(i%9)+1}`, type:i%3===0?'in':'out', amount:1000+i*73, category:i%2?'Nóminas':'Ventas', counterparty:i%2?'Proveedor X':'Cliente Y', concept:'Concepto '+(i+1) }))
export function CashflowsPage(){
  const [filters, setFilters] = useUrlState({ q:'' }); const [q, setQ] = useState(filters.q||''); const qd = useDebounce(q, 300)
  const rows = mock.filter(r => JSON.stringify(r).toLowerCase().includes(qd.toLowerCase()))
  const columns = [
    { key:'date', header:'Fecha' },
    { key:'type', header:'Tipo' },
    { key:'amount', header:'Importe', render:(r)=> r.amount.toLocaleString('es-ES',{ style:'currency', currency:'EUR'}) },
    { key:'category', header:'Categoría' },
    { key:'counterparty', header:'Contraparte' },
    { key:'concept', header:'Concepto' }
  ]
  return (<div className="grid">
    <div className="card" style={{display:'flex',gap:12}}>
      <input className="input" placeholder="Buscar" value={q} onChange={(e)=>{ setQ(e.target.value); setFilters({q:e.target.value}) }} />
      <button className="btn">Nuevo flujo</button>
    </div>
    <DataTable columns={columns} rows={rows}/>
  </div>)
}
