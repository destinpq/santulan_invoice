'use client';

import React, { useState, useEffect } from 'react';
import { EfficiencyAnalysis } from '@/components/EfficiencyAnalysis';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Task } from '@/lib/sheets';
import Link from 'next/link';

export default function EfficiencyPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Fetch all tasks when the component mounts
    async function fetchTasks() {
      try {
        const response = await fetch('/api/tasks');
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        const data = await response.json();
        setTasks(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Could not load tasks. Please try again later.');
        setLoading(false);
      }
    }
    
    fetchTasks();
  }, []);
  
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Efficiency Analysis</h1>
            <p className="text-gray-600">Track and analyze task completion efficiency across the team</p>
          </div>
          <Link href="/">
            <Button variant="outline">
              Back to Dashboard
            </Button>
          </Link>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : tasks.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500">No tasks found in the system.</p>
          </Card>
        ) : (
          <EfficiencyAnalysis tasks={tasks} />
        )}
      </div>
    </div>
  );
} 