import { NextRequest, NextResponse } from 'next/server';
import { getTasksByDeveloper } from '@/lib/sheets';

// Opt out of static generation for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const developerKey = searchParams.get('key');
    
    if (!developerKey) {
      return NextResponse.json(
        { error: 'Developer key is required' },
        { status: 400 }
      );
    }
    
    const tasks = await getTasksByDeveloper(developerKey);
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error in developer tasks API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks for developer' },
      { status: 500 }
    );
  }
} 