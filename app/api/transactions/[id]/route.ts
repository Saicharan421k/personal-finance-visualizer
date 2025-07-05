// app/api/transactions/[id]/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';

// THE FIX IS HERE: The function signature is corrected.
export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // THE FIX IS HERE: We use context.params.id
    const transaction = await Transaction.findByIdAndUpdate(context.params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!transaction) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: transaction });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}

// THE FIX IS HERE: The function signature is corrected.
export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    await dbConnect();

    // THE FIX IS HERE: We use context.params.id
    const deletedTransaction = await Transaction.deleteOne({ _id: context.params.id });

    if (deletedTransaction.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  }
}
