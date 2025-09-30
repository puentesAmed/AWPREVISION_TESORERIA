import Cashflow from '../models/Cashflow.js'
import BankTx from '../models/BankTx.js'


export const list = async (req,res)=>{
  const q = {}
  if(req.query.from || req.query.to){
    q.date = {}
    if(req.query.from) q.date.$gte = new Date(req.query.from)
    if(req.query.to) q.date.$lte = new Date(req.query.to)
  }
  if(req.query.account) q.account = req.query.account
  if(req.query.status) q.status = req.query.status
  const rows = await Cashflow.find(q).populate('account category counterparty').lean()
  res.json(rows)
}
export const create = async (req,res)=> res.status(201).json(await Cashflow.create(req.body))

export const update = async (req,res)=> res.json(await Cashflow.findByIdAndUpdate(req.params.id, req.body, { new:true }))
export const remove = async (req,res)=> { await Cashflow.findByIdAndDelete(req.params.id); res.status(204).end() }
export const postNow = async (req,res)=>{
  const cf = await Cashflow.findById(req.params.id)
  if(!cf) return res.status(404).json({error:'not_found'})
  cf.status = 'posted'
  await cf.save()
  const tx = await BankTx.create({ account: cf.account, date: cf.date, amount: cf.amount, concept: cf.concept, matchedCashflow: cf._id })
  res.json({ cashflow: cf, tx })
}
