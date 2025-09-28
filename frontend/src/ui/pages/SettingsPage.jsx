import React from "react"

export function SettingsPage() {
  return (
    <div className="page">
      <h1 className="page-title">Configuración</h1>
      <p className="page-subtitle">Personaliza la aplicación a tus necesidades.</p>

      <div className="card form-card">
        <label>Tema de la interfaz</label>
        <select className="input">
          <option>Claro</option>
          <option>Oscuro</option>
        </select>

        <label className="mt-4">Moneda base</label>
        <select className="input">
          <option>EUR (€)</option>
          <option>USD ($)</option>
          <option>GBP (£)</option>
        </select>

        <button className="btn mt-6">Guardar Cambios</button>
      </div>
    </div>
  )
}
