// app/api/transactions/[id]/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';

// THE FIX: The type of the second argument has been changed from destructuring
// to a single `context` object.
export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // THE FIX: We now access `id` via `context.params.id`
    const transaction = await Transaction.findByIdAndUpdate(context.params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!transaction) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: transaction });
  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 400 });
  }
}

// THE FIX: The same change is applied to the DELETE function's signature.
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    await dbConnect();

    // THE FIX: We now access `id` via `context.params.id`
    const deletedTransaction = await Transaction.deleteOne({ _id: context.params.id });

    if (deletedTransaction.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 400 });
  }
}
