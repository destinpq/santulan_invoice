'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatsCard } from '@/components/StatsCard';
import { TaskList } from '@/components/TaskList';
import { KanbanBoard } from '@/components/KanbanBoard';
import { AddTaskForm } from '@/components/AddTaskForm';
import { Task } from '@/lib/sheets';
import Link from 'next/link';

// Define the type for task data input
interface TaskInput {
  emailAddress: string;
  dateReported: string;
  reportedBy: string;
  type: 'bug' | 'feature';
  severity: string;
  screenshot?: string;
  bucket: string;
  description: string;
  month: string;
  developer: string;
  hoursInvested: number;
  status: 'pending' | 'completed';
}

type ViewMode = 'month' | 'bucket' | 'kanban';

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksByMonth, setTasksByMonth] = useState<Record<string, Task[]>>({});
  const [tasksByBucket, setTasksByBucket] = useState<Record<string, Task[]>>({});
  const [pendingMoney, setPendingMoney] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingTask, setAddingTask] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all tasks
        const tasksResponse = await fetch('/api/tasks');
        const tasksData = await tasksResponse.json();
        
        // Fetch tasks by month
        const tasksByMonthResponse = await fetch('/api/tasks?groupBy=month');
        const tasksByMonthData = await tasksByMonthResponse.json();
        
        // Fetch tasks by bucket
        const tasksByBucketResponse = await fetch('/api/tasks?groupBy=bucket');
        const tasksByBucketData = await tasksByBucketResponse.json();
        
        // Fetch pending money
        const pendingMoneyResponse = await fetch('/api/tasks?stats=pending');
        const pendingMoneyData = await pendingMoneyResponse.json();
        
        // Fetch total hours
        const totalHoursResponse = await fetch('/api/tasks?stats=hours');
        const totalHoursData = await totalHoursResponse.json();
        
        setTasks(tasksData);
        setTasksByMonth(tasksByMonthData);
        setTasksByBucket(tasksByBucketData);
        setPendingMoney(pendingMoneyData.pendingMoney);
        setTotalHours(totalHoursData.totalHours);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleAddTask = async (taskData: TaskInput) => {
    try {
      setAddingTask(true);
      
      const response = await fetch('/api/tasks/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add task');
      }
      
      // Refresh all data
      const tasksResponse = await fetch('/api/tasks');
      const tasksData = await tasksResponse.json();
      setTasks(tasksData);
      
      // Update tasks by month
      const tasksByMonthResponse = await fetch('/api/tasks?groupBy=month');
      const tasksByMonthData = await tasksByMonthResponse.json();
      setTasksByMonth(tasksByMonthData);
      
      // Update tasks by bucket
      const tasksByBucketResponse = await fetch('/api/tasks?groupBy=bucket');
      const tasksByBucketData = await tasksByBucketResponse.json();
      setTasksByBucket(tasksByBucketData);
      
      // Update pending money
      const pendingMoneyResponse = await fetch('/api/tasks?stats=pending');
      const pendingMoneyData = await pendingMoneyResponse.json();
      setPendingMoney(pendingMoneyData.pendingMoney);
      
      // Update total hours
      const totalHoursResponse = await fetch('/api/tasks?stats=hours');
      const totalHoursData = await totalHoursResponse.json();
      setTotalHours(totalHoursData.totalHours);
      
      setAddingTask(false);
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding task:', err);
      setError('Failed to add task. Please try again.');
      setAddingTask(false);
    }
  };

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Tasks"
          value={loading ? 'Loading...' : tasks.length}
          description="All-time tasks"
        />
        <StatsCard
          title="Pending Money"
          value={loading ? 'Loading...' : `$${pendingMoney}`}
          description="For incomplete tasks"
        />
        <StatsCard
          title="Total Hours Invested"
          value={loading ? 'Loading...' : totalHours.toFixed(1)}
          description="Across all tasks"
        />
        <StatsCard
          title="Task Types"
          value={loading ? 'Loading...' : `${tasks.filter(t => t.type === 'bug').length} Bugs / ${tasks.filter(t => t.type === 'feature').length} Features`}
          description="Distribution of work"
        />
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-lg shadow">
        <div className="flex space-x-2 mb-4 sm:mb-0">
          <Button 
            variant={viewMode === 'month' ? 'primary' : 'outline'} 
            onClick={() => setViewMode('month')}
          >
            View by Month
          </Button>
          <Button 
            variant={viewMode === 'bucket' ? 'primary' : 'outline'} 
            onClick={() => setViewMode('bucket')}
          >
            View by Category
          </Button>
          <Button 
            variant={viewMode === 'kanban' ? 'primary' : 'outline'} 
            onClick={() => setViewMode('kanban')}
          >
            Kanban Board
          </Button>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? 'Cancel' : 'Add New Task'}
          </Button>
          <Link href="/efficiency" className="inline-block">
            <Button variant="outline">Efficiency Analysis</Button>
          </Link>
          <Link href="/developer" className="inline-block">
            <Button variant="secondary">Developer Login</Button>
          </Link>
        </div>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <Card title="Add New Task">
          <AddTaskForm onSubmit={handleAddTask} isLoading={addingTask} />
        </Card>
      )}

      {/* Tasks Display */}
      <Card title={
        viewMode === 'month' ? 'Tasks by Month' : 
        viewMode === 'bucket' ? 'Tasks by Category' : 
        'Kanban Board'
      }>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : viewMode === 'kanban' ? (
          /* Display Kanban board */
          <div className="py-4">
            <div className="mb-4 bg-blue-50 border border-blue-200 p-3 rounded-lg text-blue-800 text-center">
              <p>
                <strong>Developer Actions Required?</strong> Login as a developer to move tasks between columns.
                <Link href="/developer" className="ml-2 underline font-medium">
                  Developer Login
                </Link>
              </p>
            </div>
            <KanbanBoard tasks={tasks} readOnly={true} />
          </div>
        ) : viewMode === 'month' ? (
          /* Display tasks by month */
          Object.keys(tasksByMonth).length === 0 ? (
            <p className="text-center py-8 text-gray-500">No tasks found. Add your first task to get started!</p>
          ) : (
            <div className="space-y-8">
              {Object.entries(tasksByMonth)
                .sort(([monthA], [monthB]) => {
                  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
                  return months.indexOf(monthA) - months.indexOf(monthB);
                })
                .map(([month, monthTasks]) => (
                  <div key={month} className="border-b pb-6 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">{month}</h3>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        {monthTasks.length} task{monthTasks.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <TaskList tasks={monthTasks} />
                  </div>
                ))}
            </div>
          )
        ) : (
          /* Display tasks by bucket/category */
          Object.keys(tasksByBucket).length === 0 ? (
            <p className="text-center py-8 text-gray-500">No tasks found. Add your first task to get started!</p>
          ) : (
            <div className="space-y-8">
              {Object.entries(tasksByBucket)
                .sort(([bucketA], [bucketB]) => bucketA.localeCompare(bucketB))
                .map(([bucket, bucketTasks]) => (
                  <div key={bucket} className="border-b pb-6 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-semibold text-gray-800">{bucket || 'Uncategorized'}</h3>
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        {bucketTasks.length} task{bucketTasks.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <TaskList tasks={bucketTasks} />
                  </div>
                ))}
            </div>
          )
        )}
      </Card>
    </div>
  );
}
