import React, { createContext, useState, useEffect } from "react"
import { getScenarios } from "../api/scenariosService"

const ScenariosContext = createContext()

const ScenariosProvider = ({ children }) => {
  const [scenarios, setScenarios] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    getScenarios()
      .then(data => {
        setScenarios(data)
        setIsLoading(false)
      })
      .catch(err => {
        console.error("Error cargando escenarios:", err)
        setIsError(true)
        setIsLoading(false)
      })
  }, [])

  return (
    <ScenariosContext.Provider value={{ scenarios, setScenarios, isLoading, isError }}>
      {children}
    </ScenariosContext.Provider>
  )
}

export { ScenariosProvider, ScenariosContext }
