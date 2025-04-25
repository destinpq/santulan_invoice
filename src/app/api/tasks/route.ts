import { NextRequest, NextResponse } from 'next/server';
import { getAllTasks, getTasksByMonth, getTasksByBucket, calculatePendingMoney, calculateTotalHours } from '@/lib/sheets';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    // Log message indicating we're always using real data
    console.log('Always using real API data - all environment variable checks bypassed');
    
    // No more checking if API calls should be skipped - always proceed with real API calls
    
    const { searchParams } = new URL(request.url);
    const groupBy = searchParams.get('groupBy');
    
    // Add random query param for cache busting
    console.log('Cache-busting request with random value:', Math.random());
    
    let response;
    
    if (groupBy === 'month') {
      const tasksByMonth = await getTasksByMonth();
      response = NextResponse.json(tasksByMonth || {});
    } else if (groupBy === 'bucket') {
      const tasksByBucket = await getTasksByBucket();
      response = NextResponse.json(tasksByBucket || {});
    } else {
      const stats = searchParams.get('stats');
      if (stats === 'pending') {
        const pendingMoney = await calculatePendingMoney();
        response = NextResponse.json({ pendingMoney: pendingMoney || 0 });
      } else if (stats === 'hours') {
        const totalHours = await calculateTotalHours();
        response = NextResponse.json({ totalHours: totalHours || 0 });
      } else {
        const tasks = await getAllTasks();
        response = NextResponse.json(tasks || []);
      }
    }
    
    // Add cache-busting headers
    response.headers.set('Cache-Control', 'no-store, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching tasks';
    console.error('Error in tasks API:', errorMessage, error);
    
    return NextResponse.json(
      { message: `Failed to fetch tasks: ${errorMessage}` }, 
      { status: 500 }
    );
  }
} 