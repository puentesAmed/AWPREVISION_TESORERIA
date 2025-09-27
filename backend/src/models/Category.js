import { Schema, model } from 'mongoose'
const schema = new Schema({
  name: { type:String, unique:true },
  kind: { type:String, enum:['operating','financing','investing'], default:'operating' }
})
export default model('Category', schema)
