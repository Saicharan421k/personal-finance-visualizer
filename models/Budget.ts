// models/Budget.ts
import mongoose, { Schema, Document, models } from 'mongoose';

export interface IBudget extends Document {
  category: string;
  amount: number;
  month: string; // Format: "YYYY-MM", e.g., "2025-07"
}

const BudgetSchema: Schema = new Schema({
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  month: { type: String, required: true },
}, { timestamps: true });

// Create a compound index to ensure that each category can only have one budget per month.
BudgetSchema.index({ category: 1, month: 1 }, { unique: true });

export default models.Budget || mongoose.model<IBudget>('Budget', BudgetSchema);