import { NextRequest, NextResponse } from 'next/server';
import { getAllTasks, getTasksByMonth, getTasksByBucket, calculatePendingMoney, calculateTotalHours } from '@/lib/sheets';

// Opt out of static generation for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupBy = searchParams.get('groupBy');
    
    if (groupBy === 'month') {
      const tasksByMonth = await getTasksByMonth();
      return NextResponse.json(tasksByMonth || {});
    }
    
    if (groupBy === 'bucket') {
      const tasksByBucket = await getTasksByBucket();
      return NextResponse.json(tasksByBucket || {});
    }
    
    const stats = searchParams.get('stats');
    if (stats === 'pending') {
      const pendingMoney = await calculatePendingMoney();
      return NextResponse.json({ pendingMoney: pendingMoney || 0 });
    }
    
    if (stats === 'hours') {
      const totalHours = await calculateTotalHours();
      return NextResponse.json({ totalHours: totalHours || 0 });
    }
    
    const tasks = await getAllTasks();
    return NextResponse.json(tasks || []);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching tasks';
    console.error('Error in tasks API:', errorMessage, error);
    
    return NextResponse.json(
      { message: `Failed to fetch tasks: ${errorMessage}` }, 
      { status: 500 }
    );
  }
} 