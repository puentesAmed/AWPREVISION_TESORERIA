import mongoose from "mongoose";

const S = new mongoose.Schema({
    alias: { type: String, required: false },
    bank: String,
    nummber: String,
    currency:{ type: String, enum: ['EUR','USD','GBP','JPY','CHF'], default: 'EUR' },
    initialBalance: { type: Number, default: 0 },
    currentBalance: { type: Number, default: 0 },

}, { timestamps: true })
export default mongoose.model('Account', S)