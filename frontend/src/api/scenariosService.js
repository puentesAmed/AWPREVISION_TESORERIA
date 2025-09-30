// scenariosService.js
import axios from "axios"

const API_URL = "http://localhost:3000/api/scenarios"

// GET all scenarios
export const getScenarios = async () => {
  const token = localStorage.getItem("token")
  console.log("Token:", token)

  if (!token) {
    throw new Error("No hay token guardado. Por favor inicia sesión primero.")
  }

  try {
    const res = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return res.data
  } catch (err) {
    console.error("Error fetching scenarios:", err)
    throw err
  }
}



// POST new scenario
export const createScenario = async (scenario) => {
  try {
    const res = await axios.post(API_URL, scenario) // sin token
    return res.data
  } catch (err) {
    console.error('Error creating scenario:', err)
    throw err
  }
}

// DELETE scenario
export const deleteScenario = async (id) => {
  try {
    await axios.delete(`${API_URL}/${id}`) // sin token
  } catch (err) {
    console.error('Error deleting scenario:', err)
    throw err
  }
}

// PUT update scenario
export const updateScenario = async (id, scenario) => {
  try {
    const res = await axios.put(`${API_URL}/${id}`, scenario) // sin token
    return res.data
  } catch (err) {
    console.error('Error updating scenario:', err)
    throw err
  }
}
