import { Schema, model } from 'mongoose'
const schema = new Schema({
  name: String,
  nif: { type:String, unique:true, sparse:true },
  kind: { type:String, enum:['client','supplier','bank'], default:'client' }
})
export default model('Counterparty', schema)
