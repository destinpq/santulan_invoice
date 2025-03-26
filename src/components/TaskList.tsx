import React, { useEffect, useState } from 'react';
import { Task } from '@/lib/sheets';
import { Card } from './ui/Card';
import { formatDistanceToNow } from 'date-fns';

interface TaskListProps {
  tasks: Task[];
  onUpdateHours?: (taskId: string, hours: number) => void;
  developerMode?: boolean;
}

export function TaskList({ tasks, onUpdateHours, developerMode = false }: TaskListProps) {
  const [formattedDates, setFormattedDates] = useState<Record<string, string>>({});

  // Move date formatting to client-side only
  useEffect(() => {
    const dates: Record<string, string> = {};
    tasks.forEach(task => {
      if (task.timestamp) {
        try {
          dates[task.id] = formatDistanceToNow(new Date(task.timestamp), { addSuffix: true });
        } catch {
          // Silently handle date formatting errors
          dates[task.id] = 'Unknown';
        }
      } else {
        dates[task.id] = 'Unknown';
      }
    });
    setFormattedDates(dates);
  }, [tasks]);

  return (
    <div className="space-y-6">
      {tasks.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No tasks found</p>
      ) : (
        tasks.map((task) => (
          <Card key={task.id} className="hover:shadow-lg transition-shadow overflow-visible">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Task Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    task.type === 'bug' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {task.type === 'bug' ? 'Bug' : 'Feature'}
                  </span>
                  {task.severity && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      task.severity.toLowerCase().includes('high') || task.severity.toLowerCase().includes('urgent') 
                        ? 'bg-orange-100 text-orange-800' 
                        : task.severity.toLowerCase().includes('medium') 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-100 text-blue-800'
                    }`}>
                      {task.severity}
                    </span>
                  )}
                  {task.bucket && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {task.bucket}
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    task.status === 'pending' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {task.status === 'pending' ? 'Pending' : 'Completed'}
                  </span>
                </div>
                
                <h3 className="font-semibold text-lg text-gray-900 mb-2">{task.description}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-3 text-sm text-gray-600">
                  <div>
                    <span className="font-medium text-gray-700">Reported By:</span> {task.reportedBy}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span> {task.emailAddress}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Date Reported:</span> {task.dateReported}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Month:</span> {task.month}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Developer:</span> {task.developer}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Hours:</span> {task.hoursInvested}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Cost:</span> ${task.cost}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Submitted:</span> {formattedDates[task.id] || 'Unknown'}
                  </div>
                </div>
                
                {task.screenshot && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Screenshot:</h4>
                    <a href={task.screenshot} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      View Screenshot
                    </a>
                  </div>
                )}
              </div>
              
              {/* Update Hours Section */}
              {developerMode && onUpdateHours && (
                <div className="flex flex-col justify-center border-t md:border-t-0 md:border-l border-gray-200 pt-4 md:pt-0 md:pl-6">
                  <div className="text-center">
                    <label htmlFor={`hours-${task.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                      Update Hours
                    </label>
                    <div className="flex items-center justify-center">
                      <input
                        id={`hours-${task.id}`}
                        type="number"
                        min="0"
                        step="0.5"
                        defaultValue={task.hoursInvested}
                        className="block w-24 rounded-l-md sm:text-sm border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById(`hours-${task.id}`) as HTMLInputElement;
                          const hours = parseFloat(input.value);
                          if (!isNaN(hours)) {
                            onUpdateHours(task.id, hours);
                          }
                        }}
                        className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-blue-600 text-white text-sm hover:bg-blue-700"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))
      )}
    </div>
  );
} 