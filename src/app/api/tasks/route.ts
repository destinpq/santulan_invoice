import { NextRequest, NextResponse } from 'next/server';
import { getAllTasks, getTasksByMonth, getTasksByBucket, calculatePendingMoney, calculateTotalHours } from '@/lib/sheets';
import { shouldSkipApiCalls } from '@/lib/googleApi';

// Mock data for when API calls are skipped
const MOCK_TASKS = [
  {
    id: 'mock-1',
    timestamp: new Date().toISOString(),
    emailAddress: 'mock@example.com',
    dateReported: new Date().toLocaleDateString(),
    reportedBy: 'Mock User',
    type: 'feature',
    severity: 'Medium',
    description: 'Mock task for development',
    bucket: 'Development',
    month: new Date().toLocaleString('default', { month: 'long' }),
    developer: 'Developer',
    hoursInvested: 5,
    cost: 1500,
    status: 'pending',
    kanbanStatus: 'todo',
    timeSpent: { totalHours: 5, lastUpdated: new Date().toISOString() },
    estDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    daysUntilDeadline: 7
  }
];

// Opt out of static generation for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    // Log environment variables for debugging
    console.log('Environment check in API route:');
    console.log('- SKIP_API_CALLS_DURING_BUILD:', process.env.SKIP_API_CALLS_DURING_BUILD);
    console.log('- NODE_ENV:', process.env.NODE_ENV);
    
    // Check if API calls should be skipped
    if (shouldSkipApiCalls()) {
      console.log('API calls skipped in route.ts - returning mock data');
      
      // Different mock responses based on the query parameters
      const { searchParams } = new URL(request.url);
      const groupBy = searchParams.get('groupBy');
      const stats = searchParams.get('stats');
      
      if (groupBy === 'month') {
        const currentMonth = new Date().toLocaleString('default', { month: 'long' });
        return NextResponse.json({ [currentMonth]: MOCK_TASKS });
      }
      
      if (groupBy === 'bucket') {
        return NextResponse.json({ 'Development': MOCK_TASKS });
      }
      
      if (stats === 'pending') {
        return NextResponse.json({ pendingMoney: 1500 });
      }
      
      if (stats === 'hours') {
        return NextResponse.json({ totalHours: 5 });
      }
      
      return NextResponse.json(MOCK_TASKS);
    }
    
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
    
    // For Google Sheets API skipped errors, return a specific message
    if (errorMessage.includes('Google Sheets API calls skipped')) {
      return NextResponse.json(
        { message: 'API calls are currently disabled. Please check environment configuration.' }, 
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { message: `Failed to fetch tasks: ${errorMessage}` }, 
      { status: 500 }
    );
  }
} 