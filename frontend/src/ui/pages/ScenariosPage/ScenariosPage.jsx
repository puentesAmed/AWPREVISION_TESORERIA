import React, { useState } from "react"
import "./ScenariosPage.css"

/*export function ScenariosPage() {
  const [scenarios, setScenarios] = useState([
    { name: "Escenario Base", growth: "3%" },
    { name: "Pesimista", growth: "-2%" }
  ])

  const addScenario = () => {
    const name = prompt("Nombre del nuevo escenario:")
    if (name) {
      setScenarios(prev => [...prev, { name, growth: "0%" }])
    }
  }

  const removeScenario = (index) => {
    setScenarios(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="page">
      <h1 className="page-title">Escenarios</h1>
      <p className="page-subtitle">Define distintos escenarios de previsión de tesorería.</p>

      <div className="card">
        {scenarios.map((s, i) => (
          <div key={i} className="scenario-row">
            <span>{s.name}</span>
            <span className="muted">{s.growth} crecimiento</span>
            <button className="btn-danger" onClick={() => removeScenario(i)}>Eliminar</button>
          </div>
        ))}
      </div>

      <button className="btn mt-6" onClick={addScenario}>
        + Nuevo Escenario
      </button>
    </div>
  )
}
*/

import { useForm } from "react-hook-form"

export function ScenariosPage() {
  const [scenarios, setScenarios] = useState([
    { name: "Escenario Base", growth: "3%" },
    { name: "Pesimista", growth: "-2%" }
  ])

  const [showModal, setShowModal] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const onSubmit = (data) => {
    setScenarios(prev => [...prev, { name: data.name, growth: data.growth }])
    reset()
    setShowModal(false)
  }

  const removeScenario = (index) => {
    setScenarios(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="page">
      <h1 className="page-title">Escenarios</h1>
      <p className="page-subtitle">Define distintos escenarios de previsión de tesorería.</p>

      <div className="card">
        {scenarios.map((s, i) => (
          <div key={i} className="scenario-row">
            <span>{s.name}</span>
            <span className="muted">{s.growth} crecimiento</span>
            <button className="btn-danger" onClick={() => removeScenario(i)}>Eliminar</button>
          </div>
        ))}
      </div>

      <button className="btn mt-6" onClick={() => setShowModal(true)}>
        + Nuevo Escenario
      </button>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Nuevo Escenario</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
              <input
                type="text"
                placeholder="Nombre del escenario"
                {...register("name", { required: true })}
              />
              <input
                type="text"
                placeholder="Crecimiento (ej: 5%)"
                {...register("growth", { required: true })}
              />
              <div className="modal-actions">
                <button type="submit" className="btn">Guardar</button>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
