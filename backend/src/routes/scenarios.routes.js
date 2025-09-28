import { Router } from 'express'
import Scenario from '../models/Scenarios.js'


const router = Router()

// GET all scenarios
router.get('/', async (req, res) => {
  try {
    const scenarios = await Scenario.find().sort({ createdAt: -1 })
    res.json(scenarios)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener escenarios' })
  }
})

// POST new scenario
router.post('/', async (req, res) => {
  try {
    const { name, growth } = req.body
    if (!name || !growth) {
      return res.status(400).json({ error: 'Nombre y crecimiento son requeridos' })
    }
    const newScenario = new Scenario({ name, growth })
    await newScenario.save()
    res.status(201).json(newScenario)
  } catch (err) {
    res.status(500).json({ error: 'Error al crear escenario' })
  }
})

// PUT update scenario
router.put('/:id', async (req, res) => {
  try {
    const { name, growth } = req.body
    const updated = await Scenario.findByIdAndUpdate(
      req.params.id,
      { name, growth },
      { new: true }
    )
    if (!updated) return res.status(404).json({ error: 'Escenario no encontrado' })
    res.json(updated)
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar escenario' })
  }
})

// DELETE scenario
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Scenario.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ error: 'Escenario no encontrado' })
    res.json({ message: 'Escenario eliminado' })
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar escenario' })
  }
})

export default router
