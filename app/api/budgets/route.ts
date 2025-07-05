// app/api/budgets/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Budget from '@/models/Budget';

// GET budgets for a specific month
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month'); // e.g., "2025-07"

  if (!month) {
    return NextResponse.json({ success: false, error: 'Month query parameter is required' }, { status: 400 });
  }

  try {
    await dbConnect();
    const budgets = await Budget.find({ month });
    return NextResponse.json({ success: true, data: budgets });
  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 400 });
  }
}

// POST to create or update a budget (upsert)
export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { category, amount, month } = body;

    if (!category || !amount || !month) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Find and update if exists, or create if it doesn't (upsert)
    const budget = await Budget.findOneAndUpdate(
      { category, month },
      { amount },
      { new: true, upsert: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: budget }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error }, { status: 400 });
  }
}