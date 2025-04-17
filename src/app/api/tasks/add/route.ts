import { NextRequest, NextResponse } from 'next/server';
import { addTask } from '@/lib/sheets';

// Opt out of static generation for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.month || !body.description || !body.type || !body.developer) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create a properly typed task object with all required fields
    const task = {
      timestamp: new Date().toISOString(),
      emailAddress: body.emailAddress || '',
      dateReported: body.dateReported || new Date().toISOString().split('T')[0],
      reportedBy: body.reportedBy || 'Anonymous',
      type: body.type as 'bug' | 'feature',
      severity: body.severity || 'Medium',
      screenshot: body.screenshot || '',
      bucket: body.bucket || 'Other',
      description: body.description,
      month: body.month,
      developer: body.developer,
      hoursInvested: body.hoursInvested || 0,
      status: body.status || 'pending',
      kanbanStatus: body.kanbanStatus || 'todo',
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