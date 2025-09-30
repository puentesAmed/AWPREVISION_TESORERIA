
import "./ScenariosPage.css"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { useScenarios } from "../../../hooks/useScenarios"
import { createScenario, deleteScenario } from "../../../api/scenariosService.js"

export function ScenariosPage() {
  const { scenarios, setScenarios, isLoading, isError } = useScenarios()
  const [showModal, setShowModal] = useState(false)
  const { register, handleSubmit, reset } = useForm()

  const onSubmit = async (data) => {
    try {
      const newScenario = await createScenario(data)
      setScenarios(prev => [...prev, newScenario])
      reset()
      setShowModal(false)
    } catch (err) {
      console.error("Error creando escenario:", err)
    }
  }

  const removeScenario = async (id) => {
    try {
      await deleteScenario(id)
      setScenarios(prev => prev.filter(s => s._id !== id))
    } catch (err) {
      console.error("Error eliminando escenario:", err)
    }
  }

  if (isLoading) return <p>Cargando escenarios...</p>
  if (isError) return <p>Error al cargar escenarios</p>

  return (
    <div className="page">
      <h1 className="page-title">Escenarios</h1>
      <p className="page-subtitle">Define distintos escenarios de previsión de tesorería.</p>

      <div className="card">
        {scenarios.map((s) => (
          <div key={s._id} className="scenario-row">
            <span>{s.name}</span>
            <span className="muted">{s.growth} crecimiento</span>
            <button className="btn-danger" onClick={() => removeScenario(s._id)}>Eliminar</button>
          </div>
        ))}
      </div>

      <button className="btn mt-6" onClick={() => setShowModal(true)}>+ Nuevo Escenario</button>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2 className="modal-title">Nuevo Escenario</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="modal-form">
              <input {...register("name", { required: true })} placeholder="Nombre del escenario" />
              <input {...register("growth", { required: true })} placeholder="Crecimiento (ej: 5%)" />
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
