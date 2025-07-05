// THIS IS THE LIKELY FAILING CODE
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Transaction from '@/models/Transaction';

// Incorrect function signature - missing the second 'context' argument
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // ERROR HERE: Trying to get 'id' from the request search params, which is wrong
    const id = request.nextUrl.searchParams.get("id"); 
    const transaction = await Transaction.findByIdAndUpdate(id, body, {
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
  } //...
}

// Incorrect function signature - missing 'context'
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();

    // ERROR HERE: Same problem as above
    const id = request.nextUrl.searchParams.get("id");
    const deletedTransaction = await Transaction.deleteOne({ _id: id });
    if (deletedTransaction.deletedCount === 0) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 400 });
  } // ...
}


























    
