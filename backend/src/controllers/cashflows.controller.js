import Cashflow from '../models/Cashflow.js'
import mongoose from 'mongoose'

export const list=async(req,res)=>{
  try{
    const { from,to,account,type,category,counterparty,status }=req.query
    const q={}; 
    if(from||to){ q.date={}; 
    if(from) q.date.$gte=new Date(from); 
    if(to) q.date.$lte=new Date(to)
  }
  if(account) q.account=account; 
  if(type) q.type=type; 
  if(category) q.category=category; 
  if(counterparty) q.counterparty=counterparty; 
  if(status) q.status=status

  const docs=await Cashflow.find(q).populate('account counterparty category').sort({date:1}).lean();
  res.json(docs)
  }
  catch(e){ 
    res.status(500).json({error:e.message}) 
  }
}
export const createCashflow=async(req,res)=>{
  try{ 
    const { date,account,amount,type }=req.body; 
    if(!date||!account||amount==null||!type) 
      return res.status(400).json({error:'date, account, amount, type required'})
    const doc=await Cashflow.create(req.body); const populated=await doc.populate('account counterparty category'); res.status(201).json(populated)
  }
  catch(e){ 
    res.status(500).json({error:e.message}) 
  }
}
export const updateCashflow=async(req,res)=>{
  try{ 
    const updated=await Cashflow.findByIdAndUpdate(req.params.id,req.body,{new:true}).populate('account counterparty category'); 
    if(!updated) 
      return res.status(404).json({error:'not_found'}); 
    res.json(updated)
  }
  catch(e){ 
    res.status(500).json({error:e.message}) 
  }
}

export const removeCashflow=async(req,res)=>{ 
  try{ 
    await Cashflow.findByIdAndDelete(req.params.id);
    res.status(204).end() 
  }
  catch(e){
     res.status(500).json({error:e.message}) 
  } 
}

export const calendar=async(req,res)=>{
  try{ 
    const { start,end,account }=req.query; 
    const q={}; 
    if(start||end){ q.date={}; 
    if(start) q.date.$gte=new Date(start); 
    if(end) q.date.$lte=new Date(end) } 
    if(account) q.account=account
    const items=await Cashflow.find(q).populate('account counterparty category').lean()
    const events=items.map(i=>({ id:i._id, title:`${i.counterparty?.name||'—'} ${i.amount}€`, start:i.date,
    extendedProps:i, backgroundColor:i.type==='out'?'#ef4444':'#10b981', borderColor:'#374151' }))
    res.json(events)
  }
  catch(e){
     res.status(500).json({error:e.message}) 
  }
}