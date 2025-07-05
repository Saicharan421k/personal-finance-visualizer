// models/Transaction.ts
import mongoose, { Schema, Document, models } from 'mongoose';

export interface ITransaction extends Document {
  amount: number;
  date: Date;
  description: string;
  category: string; // <-- ADD THIS LINE
}

const TransactionSchema: Schema = new Schema({
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true }, // <-- ADD THIS LINE
}, { timestamps: true });

export default models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);