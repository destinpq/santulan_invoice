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
    console.error('Error in tasks API:', error);
    // Return empty array/object based on the request type
    const groupBy = new URL(request.url).searchParams.get('groupBy');
    const stats = new URL(request.url).searchParams.get('stats');
    
    if (groupBy === 'month' || groupBy === 'bucket') {
      return NextResponse.json({});
    }
    if (stats === 'pending') {
      return NextResponse.json({ pendingMoney: 0 });
    }
    if (stats === 'hours') {
      return NextResponse.json({ totalHours: 0 });
    }
    return NextResponse.json([]);
  }
} 