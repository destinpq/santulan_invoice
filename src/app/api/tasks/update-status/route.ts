import { NextRequest, NextResponse } from 'next/server';
import { updateTaskStatus } from '@/lib/sheets';

// Opt out of static generation for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.taskId || !body.kanbanStatus) {
      return NextResponse.json(
        { error: 'Missing taskId or kanbanStatus' },
        { status: 400 }
      );
    }

    // Validate kanban status value
    const validStatuses = ['todo', 'in-progress', 'review', 'done'];
    if (!validStatuses.includes(body.kanbanStatus)) {
      return NextResponse.json(
        { error: 'Invalid kanbanStatus. Must be one of: todo, in-progress, review, done' },
        { status: 400 }
      );
    }
    
    const success = await updateTaskStatus(body.taskId, body.kanbanStatus);
    
    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Task status updated successfully',
        priceUpdated: body.kanbanStatus === 'done'
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to update task status or task not found' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in update task status API:', error);
    return NextResponse.json(
      { error: 'Failed to update task status' },
      { status: 500 }
    );
  }
} 