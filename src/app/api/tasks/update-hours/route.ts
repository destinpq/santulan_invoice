import { NextRequest, NextResponse } from 'next/server';
import { updateTaskHours } from '@/lib/sheets';

// Opt out of static generation for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.taskId || typeof body.hours !== 'number') {
      return NextResponse.json(
        { error: 'Missing taskId or hours' },
        { status: 400 }
      );
    }
    
    const success = await updateTaskHours(body.taskId, body.hours);
    
    if (success) {
      return NextResponse.json({ success: true, message: 'Task hours updated successfully' });
    } else {
      return NextResponse.json(
        { error: 'Failed to update task hours or task not found' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in update task hours API:', error);
    return NextResponse.json(
      { error: 'Failed to update task hours' },
      { status: 500 }
    );
  }
} 