'use client';

import React, { useState } from 'react';
import { DeveloperAccess } from '@/components/DeveloperAccess';
import { TaskList } from '@/components/TaskList';
import { KanbanBoard } from '@/components/KanbanBoard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatsCard } from '@/components/StatsCard';
import { Task } from '@/lib/sheets';
import Link from 'next/link';

export default function DeveloperPage() {
  const [developerKey, setDeveloperKey] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [updatingHours, setUpdatingHours] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('kanban');

  const handleDeveloperAccess = async (key: string) => {
    // If key is the passphrase, use destinpq instead
    const developerKey = key === 'Akanksha100991!' ? 'destinpq' : key;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/tasks/developer?key=${encodeURIComponent(developerKey)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      
      const data = await response.json();
      setTasks(data);
      setDeveloperKey(developerKey);
      setLoading(false);
    } catch (err) {
      console.error('Error accessing developer tasks:', err);
      setError('Could not find tasks for this developer key.');
      setLoading(false);
    }
  };

  const handleUpdateHours = async (taskId: string, hours: number) => {
    try {
      setUpdatingHours(true);
      
      const response = await fetch('/api/tasks/update-hours', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId, hours }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update hours');
      }
      
      // Refresh the developer's tasks
      if (developerKey) {
        const tasksResponse = await fetch(`/api/tasks/developer?key=${encodeURIComponent(developerKey)}`);
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);
      }
      
      setUpdatingHours(false);
    } catch (err) {
      console.error('Error updating hours:', err);
      setError('Failed to update hours. Please try again.');
      setUpdatingHours(false);
    }
  };

  const handleUpdateStatus = async (taskId: string, uiStatus: 'todo' | 'doing' | 'done') => {
    try {
      setUpdatingStatus(true);
      setError('');
      setSuccess('');
      
      // Map the UI status (3 columns) to the backend status (4 columns)
      let kanbanStatus: 'todo' | 'in-progress' | 'review' | 'done';
      if (uiStatus === 'todo') {
        kanbanStatus = 'todo';
      } else if (uiStatus === 'doing') {
        kanbanStatus = 'in-progress';
      } else {
        kanbanStatus = 'done';
      }
      
      const response = await fetch('/api/tasks/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId, kanbanStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      // Refresh the developer's tasks
      if (developerKey) {
        const tasksResponse = await fetch(`/api/tasks/developer?key=${encodeURIComponent(developerKey)}`);
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);
      }
      
      setUpdatingStatus(false);
      
      // Show success message if moved to done
      if (uiStatus === 'done') {
        // Find the task to include in the message
        const task = tasks.find(t => t.id === taskId);
        const taskType = task ? (task.type === 'bug' ? 'Bug' : 'Feature') : 'Task';
        const taskDesc = task ? task.description : '';
        setSuccess(`${taskType} "${taskDesc}" moved to Done and price updated to Rs${task?.type === 'bug' ? 200 : 300}.`);
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update status. Please try again.');
      setUpdatingStatus(false);
    }
  };

  const handleLogout = () => {
    setDeveloperKey(null);
    setTasks([]);
  };

  const getTaskCountsByType = () => {
    const bugs = tasks.filter(task => task.type === 'bug').length;
    const features = tasks.filter(task => task.type === 'feature').length;
    return { bugs, features };
  };

  const getTaskCountsByStatus = () => {
    const pending = tasks.filter(task => task.status === 'pending').length;
    const completed = tasks.filter(task => task.status === 'completed').length;
    return { pending, completed };
  };

  return (
    <div>
      {!developerKey ? (
        <div className="max-w-md mx-auto mt-8">
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-center mb-6">Developer Dashboard</h2>
            <p className="text-gray-600 mb-8 text-center">
              Enter your developer key to access and manage all tasks in the system.
            </p>
            <DeveloperAccess onAccess={handleDeveloperAccess} />
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Developer Dashboard</h2>
                <p className="text-gray-600">Welcome, {developerKey} - You can manage all tasks</p>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
                <Link href="/efficiency">
                  <Button variant="outline">
                    Efficiency Analysis
                  </Button>
                </Link>
                <Link href="/">
                  <Button variant="outline">
                    Back to Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-50 text-green-600 p-4 rounded-md">
              {success}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatsCard 
              title="Total Tasks" 
              value={tasks.length} 
              description="Assigned to you"
            />
            <StatsCard 
              title="Hours Invested" 
              value={tasks.reduce((sum, task) => sum + task.hoursInvested, 0).toFixed(1)} 
              description="Total hours worked"
            />
            <StatsCard 
              title="Task Types" 
              value={`${getTaskCountsByType().bugs} Bugs / ${getTaskCountsByType().features} Features`} 
              description="Distribution"
            />
            <StatsCard 
              title="Progress" 
              value={`${getTaskCountsByStatus().completed} / ${tasks.length}`} 
              description={`${Math.round((getTaskCountsByStatus().completed / (tasks.length || 1)) * 100)}% Complete`}
            />
          </div>
          
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold text-gray-900">Your Tasks</h3>
            <div className="flex gap-2">
              <Button 
                variant={viewMode === 'list' ? 'primary' : 'outline'} 
                onClick={() => setViewMode('list')}
              >
                List View
              </Button>
              <Button 
                variant={viewMode === 'kanban' ? 'primary' : 'outline'} 
                onClick={() => setViewMode('kanban')}
                className="bg-blue-50"
              >
                Kanban Board
              </Button>
            </div>
          </div>
          
          {viewMode === 'kanban' && (
            <div className="mb-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <p>
                <strong>Tip:</strong> You can drag and drop tasks between columns to update their status.
              </p>
            </div>
          )}
          
          <Card className={viewMode === 'kanban' ? 'p-0 overflow-hidden' : ''}>
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : tasks.length === 0 ? (
              <p className="text-center py-12 text-gray-500">No tasks found for this developer key.</p>
            ) : viewMode === 'list' ? (
              <div className="p-4">
                <TaskList 
                  tasks={tasks} 
                  developerMode={true} 
                  onUpdateHours={updatingHours ? undefined : handleUpdateHours} 
                />
              </div>
            ) : (
              <KanbanBoard
                tasks={tasks}
                onStatusUpdate={updatingStatus ? undefined : handleUpdateStatus}
                isLoading={updatingStatus}
              />
            )}
          </Card>
          
          {(updatingHours || updatingStatus) && (
            <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-md shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="text-gray-700">
                    {updatingHours ? 'Updating task hours...' : 'Updating task status...'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 