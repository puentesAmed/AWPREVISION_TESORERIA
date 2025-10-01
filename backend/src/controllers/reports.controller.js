import Cashflow from '../models/Cashflow.js'
import mongoose from 'mongoose'

export const totals=async(req,res)=>{
     try{ 
        const { from,to,groupBy='date',granularity='day',account }=req.query; 
        const match={}; 
        if(from||to){ match.date={}; 
        if(from) match.date.$gte=new Date(from); 
        if(to) match.date.$lte=new Date(to) } if(account) match.account=new mongoose.Types.ObjectId(account); 
        const dateExpr= granularity==='month'?{$dateToString:{format:'%Y-%m',date:'$date'}}:{$dateToString:{format:'%Y-%m-%d',date:'$date'}}; 
        const _id={}; 
        if(groupBy==='date') _id.date=dateExpr; 
        if(groupBy==='account'){_id.account='$account'; _id.date=dateExpr } 
        if(groupBy==='category'){ _id.category='$category'; _id.date=dateExpr } 
        
        const data=await Cashflow.aggregate([{ $match:match },{ $group:{ _id, total:{$sum:'$amount' }, count:{ $sum:1 } } },{ $sort:{ '_id.date':1 } }]); res.json(data) 
    } 
    catch(e){
            res.status(500).json({error:e.message}) 
    } 
}