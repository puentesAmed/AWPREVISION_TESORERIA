import React, { createContext, useState, useEffect } from "react"
import { getScenarios } from "../api/scenariosService"

const ScenariosContext = createContext()

const ScenariosProvider = ({ children }) => {
  const [scenarios, setScenarios] = useState([])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) return // 👈 no hacer la llamada si no hay token

    getScenarios()
      .then(setScenarios)
      .catch(err => console.error("Error cargando escenarios:", err))
  }, [])

  return <ScenariosContext.Provider value={{ scenarios }}>{children}</ScenariosContext.Provider>
}

export { ScenariosProvider, ScenariosContext }
