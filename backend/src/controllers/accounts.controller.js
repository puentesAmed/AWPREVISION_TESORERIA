import Account from '../models/Account.js'

/*export const list = async (req,res)=> res.json(await BankAccount.find().lean())
export const create = async (req,res)=> res.status(201).json(await BankAccount.create(req.body))
export const update = async (req,res)=> res.json(await BankAccount.findByIdAndUpdate(req.params.id, req.body, { new:true }))
export const remove = async (req,res)=> { await BankAccount.findByIdAndDelete(req.params.id); res.status(204).end() }
*/

export const list=async(_req,res)=> res.json(await Account.find().lean())
export const create=async(req,res)=> res.status(201).json(await Account.create(req.body))
export const update=async(req,res)=>{ const doc=await Account.findByIdAndUpdate(req.params.id,req.body,{new:true}); 
    if(!doc) 
        return res.status(404).json({error:'not_found'});
        res.json(doc) 
}

export const remove=async(req,res)=>{ await Account.findByIdAndDelete(req.params.id); res.status(204).end() }