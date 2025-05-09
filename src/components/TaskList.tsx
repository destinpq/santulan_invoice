import React, { useEffect, useState } from 'react';
import { Task } from '@/lib/sheets';
import { Card } from './ui/Card';
import { formatDistanceToNow } from 'date-fns';

interface TaskListProps {
  tasks: Task[];
  onUpdateHours?: (taskId: string, hours: number) => void;
  onTimeUpdate?: (taskId: string, startTime?: string, endTime?: string) => void;
  developerMode?: boolean;
}

export function TaskList({ tasks, onUpdateHours, onTimeUpdate, developerMode = false }: TaskListProps) {
  const [formattedDates, setFormattedDates] = useState<Record<string, string>>({});
  const [activeTimer, setActiveTimer] = useState<string | null>(null);
  const [timerStart, setTimerStart] = useState<string | null>(null);

  // Format relative dates
  useEffect(() => {
    const newDates: Record<string, string> = {};
    tasks.forEach(task => {
      if (task.timestamp) {
        newDates[task.id] = formatDistanceToNow(new Date(task.timestamp), { addSuffix: true });
      }
    });
    setFormattedDates(newDates);
  }, [tasks]);

  const handleStartTimer = (taskId: string) => {
    if (activeTimer) return;
    setActiveTimer(taskId);
    setTimerStart(new Date().toISOString());
    onTimeUpdate?.(taskId, new Date().toISOString());
  };

  const handleStopTimer = (taskId: string) => {
    if (activeTimer !== taskId || !timerStart) return;
    setActiveTimer(null);
    const endTime = new Date().toISOString();
    onTimeUpdate?.(taskId, timerStart, endTime);
    setTimerStart(null);
  };

  return (
    <div className="space-y-6">
      {tasks.map((task) => (
        <Card key={task.id} className="hover:shadow-lg transition-shadow duration-200 overflow-visible p-6">
          <div className="flex flex-col gap-6">
            {/* Task Header */}
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{task.description}</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    task.type === 'bug' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {task.type === 'bug' ? 'Bug' : 'Feature'}
                  </span>
                  {task.severity && (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      task.severity.toLowerCase().includes('high') || task.severity.toLowerCase().includes('urgent') 
                        ? 'bg-orange-100 text-orange-800' 
                        : task.severity.toLowerCase().includes('medium') 
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-sky-100 text-sky-800'
                    }`}>
                      {task.severity}
                    </span>
                  )}
                  {task.bucket && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {task.bucket}
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    task.status === 'pending' 
                      ? 'bg-amber-100 text-amber-800' 
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {task.status === 'pending' ? 'Pending' : 'Completed'}
                  </span>
                  
                  {/* Display days until deadline if available */}
                  {task.daysUntilDeadline !== undefined && (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      task.daysUntilDeadline < 0
                        ? 'bg-red-100 text-red-800'
                        : task.daysUntilDeadline < 3
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-blue-100 text-blue-800'
                    }`}>
                      {task.daysUntilDeadline < 0
                        ? `Overdue by ${Math.abs(task.daysUntilDeadline)} days`
                        : task.daysUntilDeadline === 0
                          ? 'Due today!'
                          : task.daysUntilDeadline === 1
                            ? 'Due tomorrow'
                        : `${task.daysUntilDeadline} days left`}
                    </span>
                  )}
                </div>
              </div>

              {/* Time Tracking Controls - Moved to top right */}
              {developerMode && (
                <div className="flex items-center gap-3">
                  {activeTimer === task.id ? (
                    <button
                      onClick={() => handleStopTimer(task.id)}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition-colors duration-200"
                    >
                      Stop Timer
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartTimer(task.id)}
                      disabled={!!activeTimer}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Start Timer
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Task Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-500">Reported By</span>
                <p className="text-sm text-gray-900">{task.reportedBy}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-500">Email</span>
                <p className="text-sm text-gray-900">{task.emailAddress}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-500">Date Reported</span>
                <p className="text-sm text-gray-900">{task.dateReported}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-500">Month</span>
                <p className="text-sm text-gray-900">{task.month}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-500">Developer</span>
                <p className="text-sm text-gray-900">{task.developer}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-500">Hours Invested</span>
                <p className="text-sm text-gray-900">{task.hoursInvested}h</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-500">Cost</span>
                <p className="text-sm text-gray-900">Rs{task.cost}</p>
              </div>
              <div className="space-y-1">
                <span className="text-sm font-medium text-gray-500">Submitted</span>
                <p className="text-sm text-gray-900">{formattedDates[task.id] || 'Unknown'}</p>
              </div>
              {task.estDeadline && (
                <div className="space-y-1">
                  <span className="text-sm font-medium text-gray-500">Deadline</span>
                  <p className="text-sm text-gray-900">{task.estDeadline}</p>
                </div>
              )}
              {task.daysUntilDeadline !== undefined && (
                <div className="space-y-1">
                  <span className="text-sm font-medium text-gray-500">Time Left</span>
                  <p className={`text-sm font-medium ${
                    task.daysUntilDeadline < 0
                      ? 'text-red-600'
                      : task.daysUntilDeadline < 3
                        ? 'text-orange-600'
                        : 'text-gray-900'
                  }`}>
                    {task.daysUntilDeadline < 0
                      ? `${Math.abs(task.daysUntilDeadline)} days overdue`
                      : task.daysUntilDeadline === 0
                        ? 'Due today!'
                        : task.daysUntilDeadline === 1
                          ? 'Due tomorrow'
                      : `${task.daysUntilDeadline} days left`}
                  </p>
                </div>
              )}
            </div>

            {/* Screenshot Section */}
            {task.screenshot && (
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Screenshot:</p>
                <div className="relative border rounded-lg overflow-hidden">
                  <img 
                    src={task.screenshot} 
                    alt="Screenshot" 
                    className="w-full h-auto max-h-96 object-contain bg-gray-50"
                  />
                </div>
              </div>
            )}

            {developerMode && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-gray-700">Time Tracking</h4>
                    {task.timeSpent?.totalHours ? (
                      <p className="text-sm text-gray-600">
                        Total Time: <span className="font-medium">{task.timeSpent.totalHours}h</span>
                      </p>
                    ) : null}
                  </div>
                  
                  {onUpdateHours && (
                    <div className="flex items-center gap-2">
                      <input
                        id={`hours-${task.id}`}
                        type="number"
                        min="0"
                        step="0.5"
                        defaultValue={task.hoursInvested}
                        className="block w-24 rounded-lg text-sm border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => {
                          const input = document.getElementById(`hours-${task.id}`) as HTMLInputElement;
                          const hours = parseFloat(input.value);
                          if (!isNaN(hours)) {
                            onUpdateHours(task.id, hours);
                          }
                        }}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                      >
                        Update Hours
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
} 