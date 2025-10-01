/*import React, { useState } from "react"

export function ImportPage() {
  const [file, setFile] = useState(null)

  return (
    <div className="page">
      <h1 className="page-title">Importar Datos</h1>
      <p className="page-subtitle">Sube archivos CSV/Excel con movimientos financieros.</p>

      <div className="card upload-card">
        <input
          type="file"
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={e => setFile(e.target.files[0])}
        />
        {file && <p className="muted">Archivo seleccionado: {file.name}</p>}
        <button className="btn mt-4">Procesar Archivo</button>
      </div>
    </div>
  )
}
*/

import React,{ useState } from 'react'


export function ImportPage(){ 
  
  const [file,setFile]=useState(null);
  const onUpload=()=> alert('Subida no implementada. Añade endpoint /api/import si lo necesitas.'); 
  
  return (
    <div className='page'>
      <div className='card'>
        <h3>Importar CSV</h3>
        <input className='input' type='file' accept='.csv' onChange={e=> setFile(e.target.files?.[0]||null)}/>
        <button className='btn' onClick={onUpload} disabled={!file}>Subir</button>
      </div>
      <div className='card'>
        <p className='muted'>Consejo: CSV con columnas: date, account, counterparty, amount, type, category, concept.</p>
      </div>
    </div>
  ) 
}