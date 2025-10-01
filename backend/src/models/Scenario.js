/*import mongoose from 'mongoose'

const scenarioSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  growth: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

export default mongoose.model('Scenario', scenarioSchema)
*/

import mongoose from 'mongoose'

const S=new mongoose.Schema({ 
  name:{type:String,required:true}, 
  growth:{type:String,default:'0%'}
},{timestamps:true})

export default mongoose.model('Scenario', S)