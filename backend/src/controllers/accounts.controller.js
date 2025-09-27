import BankAccount from '../models/BankAccount.js'
export const list = async (req,res)=> res.json(await BankAccount.find().lean())
export const create = async (req,res)=> res.status(201).json(await BankAccount.create(req.body))
export const update = async (req,res)=> res.json(await BankAccount.findByIdAndUpdate(req.params.id, req.body, { new:true }))
export const remove = async (req,res)=> { await BankAccount.findByIdAndDelete(req.params.id); res.status(204).end() }
