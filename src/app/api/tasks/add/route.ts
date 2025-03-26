import { NextRequest, NextResponse } from 'next/server';
import { addTask } from '@/lib/sheets';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.month || !body.taskName || !body.type || !body.developer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Set default values if not provided
    const task = {
      month: body.month,
      taskName: body.taskName,
      type: body.type,
      developer: body.developer,
      hoursInvested: body.hoursInvested || 0,
      status: body.status || 'pending',
    };
    
    const success = await addTask(task);
    
    if (success) {
      return NextResponse.json({ success: true, message: 'Task added successfully' });
    } else {
      return NextResponse.json(
        { error: 'Failed to add task' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in add task API:', error);
    return NextResponse.json(
      { error: 'Failed to add task' },
      { status: 500 }
    );
  }
} 