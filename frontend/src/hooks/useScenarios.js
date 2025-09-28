import { useContext } from "react"
import { ScenariosContext } from "../context/ScenariosContext"

export const useScenarios = () => useContext(ScenariosContext)
