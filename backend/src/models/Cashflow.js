/*import { Schema, model, Types } from 'mongoose'
const Rec = new Schema({ freq:{type:String, enum:['none','weekly','monthly','quarterly','yearly'], default:'none'}, interval:{type:Number, default:1}, count:Number, until:Date }, {_id:false})
const Tax = new Schema({ vatPct:Number, withholdingPct:Number }, {_id:false})
const schema = new Schema({
  account: { type:Types.ObjectId, ref:'BankAccount', index:true },
  date: { type:Date, index:true },
  amount: Number,
  type: { type:String, enum:['in','out'] },
  category: { type:Types.ObjectId, ref:'Category' },
  counterparty: { type:Types.ObjectId, ref:'Counterparty' },
  concept: String,
  recurrence: Rec,
  tax: Tax,
  status: { type:String, enum:['planned','posted'], default:'planned' }
}, { timestamps:true })
export default model('Cashflow', schema)
*/

import mongoose from 'mongoose'

const S=new mongoose.Schema({ 
  date:{type:Date,required:true},
  account:{type:mongoose.Schema.Types.ObjectId,ref:'Account',required:false},
  counterparty:{type:mongoose.Schema.Types.ObjectId,ref:'Counterparty'}, 
  amount:{type:Number,required:true},
  type:{type:String,enum:['in','out'],default:'out'},
  category:{type:mongoose.Schema.Types.ObjectId,ref:'Category'}, 
  concept:String,
  status:{type:String,enum:['pending','paid','cancelled'],default:'pending'} 
},{timestamps:true})

export default mongoose.model('Cashflow', S)