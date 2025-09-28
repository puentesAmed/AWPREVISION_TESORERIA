import React, { useState } from "react"

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
