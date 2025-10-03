/*import Account from '../models/Account.js'


export const list=async(_req,res)=> res.json(await Account.find().lean())
export const create=async(req,res)=> res.status(201).json(await Account.create(req.body))
export const update=async(req,res)=>{ const doc=await Account.findByIdAndUpdate(req.params.id,req.body,{new:true}); 
    if(!doc) 
        return res.status(404).json({error:'not_found'});
        res.json(doc) 
}

export const remove=async(req,res)=>{ await Account.findByIdAndDelete(req.params.id); res.status(204).end() }*/

import Account from '../models/Account.js'
import Cashflow from '../models/Cashflow.js' // ← importa tu modelo de movimientos

export const list = async (_req,res)=> res.json(await Account.find().lean())
export const create = async (req,res)=> res.status(201).json(await Account.create(req.body))
export const update = async (req,res)=>{
  const doc = await Account.findByIdAndUpdate(req.params.id, req.body, { new:true })
  if (!doc) return res.status(404).json({ error:'not_found' })
  res.json(doc)
}
export const remove = async (req,res)=>{ await Account.findByIdAndDelete(req.params.id); res.status(204).end() }

// NUEVO: agregado para dashboard
export const balance = async (_req, res, next) => {
  try {
    const accounts = await Account.find({}, { alias:1, initialBalance:1 }).lean()

    // KPIs globales desde Cashflow.amount (+ ingresos, - gastos)
    const [agg = {}] = await Cashflow.aggregate([
      {
        $group: {
          _id: null,
          ingresos: { $sum: { $cond: [{ $gt: ['$amount', 0] }, '$amount', 0] } },
          gastos:   { $sum: { $cond: [{ $lt: ['$amount', 0] }, { $abs: '$amount' }, 0] } },
        }
      },
      { $project: { _id:0, ingresos:1, gastos:1 } }
    ])
    const kpi = {
      ingresos: agg.ingresos ?? 0,
      gastos:   agg.gastos ?? 0,
      balance: (agg.ingresos ?? 0) - (agg.gastos ?? 0),
    }

    // Movimientos netos por cuenta (soporta campo 'account' o 'accountId')
    const perAcc = await Cashflow.aggregate([
      { $addFields: { acc: { $ifNull: ['$account', '$accountId'] } } },
      { $match: { acc: { $ne: null } } },
      { $group: { _id: '$acc', net: { $sum: '$amount' } } },
    ])
    const movMap = new Map(perAcc.map(r => [String(r._id), r.net]))

    const out = accounts.map(a => ({
      id: String(a._id),
      name: a.alias ?? String(a._id),
      balance: (a.initialBalance ?? 0) + (movMap.get(String(a._id)) ?? 0),
    }))

    res.json({ kpi, accounts: out })
  } catch (e) { next(e) }
}
