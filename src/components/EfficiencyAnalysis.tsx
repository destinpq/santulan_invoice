'use client';

import React from 'react';
import { Task } from '@/lib/sheets';
import { Card } from './ui/Card';
import { differenceInDays } from 'date-fns';

interface EfficiencyAnalysisProps {
  tasks: Task[];
}

type EfficiencyData = {
  developer: string;
  totalTasks: number;
  completedTasks: number;
  avgCompletionTime: number;
  bugsFixed: number;
  featuresAdded: number;
  totalHours: number;
  efficiency: number; // hours per task
}

export function EfficiencyAnalysis({ tasks }: EfficiencyAnalysisProps) {
  // Calculate efficiency metrics by developer
  const getEfficiencyData = (): EfficiencyData[] => {
    const developerMap = new Map<string, EfficiencyData>();
    
    // Initialize with all developers who have tasks
    tasks.forEach(task => {
      if (!developerMap.has(task.developer)) {
        developerMap.set(task.developer, {
          developer: task.developer,
          totalTasks: 0,
          completedTasks: 0,
          avgCompletionTime: 0,
          bugsFixed: 0,
          featuresAdded: 0,
          totalHours: 0,
          efficiency: 0
        });
      }
    });
    
    // Calculate metrics
    tasks.forEach(task => {
      const data = developerMap.get(task.developer)!;
      
      // Update total tasks
      data.totalTasks++;
      
      // Update completed tasks count
      if (task.status === 'completed') {
        data.completedTasks++;
      }
      
      // Track bugs and features
      if (task.type === 'bug') {
        data.bugsFixed += task.status === 'completed' ? 1 : 0;
      } else {
        data.featuresAdded += task.status === 'completed' ? 1 : 0;
      }
      
      // Track hours
      data.totalHours += task.hoursInvested;
      
      developerMap.set(task.developer, data);
    });
    
    // Calculate average completion time and efficiency metrics
    developerMap.forEach((data, developer) => {
      // Calculate efficiency (hours per task for completed tasks)
      if (data.completedTasks > 0) {
        data.efficiency = +(data.totalHours / data.completedTasks).toFixed(1);
      }
      
      // Calculate average completion time
      const completedTasks = tasks.filter(t => 
        t.developer === developer && 
        t.status === 'completed' &&
        t.kanbanStatus === 'done'
      );
      
      if (completedTasks.length > 0) {
        let totalDays = 0;
        
        completedTasks.forEach(task => {
          try {
            // Assuming dateReported is in a format that Date can parse
            // For simplicity, assume each task took at least 1 day plus 1 day per 8 hours
            const estimatedDays = Math.max(1, Math.ceil(task.hoursInvested / 8));
            totalDays += estimatedDays;
          } catch {
            // Skip if date parsing fails
          }
        });
        
        data.avgCompletionTime = Math.round(totalDays / completedTasks.length);
      }
      
      developerMap.set(developer, data);
    });
    
    return Array.from(developerMap.values());
  };
  
  const efficiencyData = getEfficiencyData();

  // Get overall team metrics
  const getTeamMetrics = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalHours = tasks.reduce((sum, t) => sum + t.hoursInvested, 0);
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Calculate average task age (in days)
    let totalAge = 0;
    tasks.forEach(task => {
      try {
        const reportDate = new Date(task.dateReported);
        const now = new Date();
        const age = differenceInDays(now, reportDate);
        totalAge += age;
      } catch {
        // Skip if date parsing fails
      }
    });
    
    const avgTaskAge = tasks.length > 0 ? Math.round(totalAge / tasks.length) : 0;
    
    return {
      totalTasks,
      completedTasks,
      completionRate,
      totalHours,
      avgTaskAge
    };
  };
  
  const teamMetrics = getTeamMetrics();
  
  // Get task completion timeline
  const getTaskTimeline = () => {
    // Group completed tasks by month
    const monthlyCompletion = new Map<string, number>();
    
    tasks.filter(t => t.status === 'completed').forEach(task => {
      // Use the task's month field
      const month = task.month;
      if (month) {
        monthlyCompletion.set(
          month, 
          (monthlyCompletion.get(month) || 0) + 1
        );
      }
    });
    
    return Array.from(monthlyCompletion.entries())
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => {
        // Simple month name sorting logic
        const months = [
          'January', 'February', 'March', 'April', 'May', 'June', 
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months.indexOf(a.month) - months.indexOf(b.month);
      });
  };
  
  const timeline = getTaskTimeline();

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Team Efficiency Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-blue-700">{teamMetrics.totalTasks}</div>
            <div className="text-sm text-blue-600">Total Tasks</div>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-green-700">{teamMetrics.completedTasks}</div>
            <div className="text-sm text-green-600">Completed</div>
          </div>
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-purple-700">{teamMetrics.completionRate}%</div>
            <div className="text-sm text-purple-600">Completion Rate</div>
          </div>
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-orange-700">{teamMetrics.totalHours.toFixed(1)}</div>
            <div className="text-sm text-orange-600">Total Hours</div>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-2xl font-bold text-red-700">{teamMetrics.avgTaskAge}</div>
            <div className="text-sm text-red-600">Avg Task Age (days)</div>
          </div>
        </div>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Developer Efficiency</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Developer</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bugs Fixed</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Features Added</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hours/Task</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Completion (days)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {efficiencyData.map((data) => (
                <tr key={data.developer}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{data.developer}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{data.totalTasks}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {data.completedTasks} ({data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0}%)
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{data.bugsFixed}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{data.featuresAdded}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{data.totalHours.toFixed(1)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{data.efficiency}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{data.avgCompletionTime || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-medium mb-4">Monthly Task Completion</h3>
        <div className="overflow-x-auto">
          <div className="flex items-end h-40 gap-2">
            {timeline.map(({ month, count }) => (
              <div key={month} className="flex flex-col items-center">
                <div 
                  className="bg-blue-500 w-10 rounded-t" 
                  style={{ height: `${Math.max(20, (count / Math.max(...timeline.map(t => t.count))) * 120)}px` }}
                >
                  <div className="h-full w-full flex items-center justify-center text-white font-bold">
                    {count}
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-1 rotate-45 origin-top-left translate-x-4">
                  {month}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
} 