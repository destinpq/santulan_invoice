'use client';

import React, { useState } from 'react';
import { Task } from '@/lib/sheets';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

// Update to only have 3 statuses: todo, doing, done
type KanbanStatus = 'todo' | 'doing' | 'done';

interface KanbanBoardProps {
  tasks: Task[];
  onStatusUpdate?: (taskId: string, status: KanbanStatus) => void;
  isLoading?: boolean;
  readOnly?: boolean;
}

export function KanbanBoard({ 
  tasks, 
  onStatusUpdate, 
  isLoading = false, 
  readOnly = false 
}: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<KanbanStatus | null>(null);
  const [activeColumn, setActiveColumn] = useState<KanbanStatus>('todo');
  
  // Simplified to 3 columns
  const columns: KanbanStatus[] = ['todo', 'doing', 'done'];
  
  const getColumnTasks = (status: KanbanStatus) => {
    let filteredTasks;
    
    // Map the 4-column model to the 3-column model
    if (status === 'todo') {
      // Only show tasks that are not resolved and in todo status
      filteredTasks = tasks.filter(task => 
        !task.resolvedOn && 
        task.status === 'pending' && 
        task.kanbanStatus === 'todo'
      );
    } else if (status === 'doing') {
      // Only show tasks that are not resolved and in progress
      filteredTasks = tasks.filter(task => 
        !task.resolvedOn && 
        task.status === 'pending' && 
        (task.kanbanStatus === 'in-progress' || task.kanbanStatus === 'review')
      );
    } else { // done
      // Show all resolved tasks
      filteredTasks = tasks.filter(task => 
        task.resolvedOn || 
        task.status === 'completed' || 
        task.kanbanStatus === 'done'
      );
    }
    
    // Sort tasks: priority to tasks with "logo" in description
    return filteredTasks.sort((a, b) => {
      // For done column, sort by resolved date (most recent first)
      if (status === 'done' && a.resolvedOn && b.resolvedOn) {
        return new Date(b.resolvedOn).getTime() - new Date(a.resolvedOn).getTime();
      }
      
      // Then sort by logo priority
      const aHasLogo = a.description?.toLowerCase().includes('logo') ?? false;
      const bHasLogo = b.description?.toLowerCase().includes('logo') ?? false;
      
      if (aHasLogo && !bHasLogo) return -1;
      if (!aHasLogo && bHasLogo) return 1;
      return 0;
    });
  };

  const getColumnName = (status: KanbanStatus) => {
    switch(status) {
      case 'todo': return 'To Do';
      case 'doing': return 'Doing';
      case 'done': return 'Done';
      default: return '';
    }
  };

  const getColumnColor = (status: KanbanStatus) => {
    switch(status) {
      case 'todo': return 'bg-blue-50 border-blue-200';
      case 'doing': return 'bg-amber-50 border-amber-200';
      case 'done': return 'bg-green-50 border-green-200';
      default: return '';
    }
  };

  const getColumnTextColor = (status: KanbanStatus) => {
    switch(status) {
      case 'todo': return 'text-blue-800';
      case 'doing': return 'text-amber-800';
      case 'done': return 'text-green-800';
      default: return '';
    }
  };

  const getTaskTypeColor = (type: 'bug' | 'feature') => {
    return type === 'bug' 
      ? 'bg-red-100 text-red-800' 
      : 'bg-green-100 text-green-800';
  };
  
  // Drag and drop handlers
  const handleDragStart = (taskId: string) => {
    if (readOnly || isLoading) return;
    setDraggedTask(taskId);
  };
  
  const handleDragOver = (e: React.DragEvent, status: KanbanStatus) => {
    if (readOnly || isLoading) return;
    e.preventDefault();
    setDragOverColumn(status);
  };
  
  const handleDrop = (e: React.DragEvent, status: KanbanStatus) => {
    if (readOnly || isLoading || !draggedTask || !onStatusUpdate) return;
    e.preventDefault();
    
    // Get the current status of the dragged task
    const task = tasks.find(t => t.id === draggedTask);
    if (!task) return;
    
    // Get the current column of the task
    let currentColumn: KanbanStatus;
    if (task.kanbanStatus === 'todo') {
      currentColumn = 'todo';
    } else if (task.kanbanStatus === 'in-progress' || task.kanbanStatus === 'review') {
      currentColumn = 'doing';
    } else {
      currentColumn = 'done';
    }
    
    // Only update if dropping to a different column
    if (currentColumn !== status) {
      // If moving to done, confirm with user as it will update the price
      if (status === 'done' && currentColumn !== 'done') {
        const hourlyRate = task.type === 'bug' ? 200 : 300;
        const price = hourlyRate * task.hoursInvested;
        const confirmed = window.confirm(
          `Moving this ${task.type} to Done will set its price to Rs${price} (${task.hoursInvested} hours × Rs${hourlyRate}/hr). Continue?`
        );
        if (!confirmed) {
          setDraggedTask(null);
          setDragOverColumn(null);
          return;
        }
      }
      
      onStatusUpdate(draggedTask, status);
    }
    
    setDraggedTask(null);
    setDragOverColumn(null);
  };
  
  const handleDragEnd = () => {
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  // Mobile column tabs
  const renderMobileTabs = () => (
    <div className="flex border-b mb-4 md:hidden">
      {columns.map(column => (
        <button
          key={column}
          className={`flex-1 py-2 font-medium text-sm ${
            activeColumn === column
              ? `${getColumnTextColor(column)} border-b-2 border-current`
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveColumn(column)}
        >
          {getColumnName(column)} 
          <span className={`ml-1 text-xs ${activeColumn === column ? 'font-bold' : ''}`}>
            ({getColumnTasks(column).length})
          </span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="p-2">
      {/* Mobile instructions */}
      <div className="md:hidden mb-4 text-sm text-gray-600 italic px-2 text-center">
        {!readOnly ? "Tap 'Move to' button to change task status" : ""}
      </div>

      {/* Mobile tabs */}
      {renderMobileTabs()}

      {draggedTask && !readOnly && (
        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-md shadow-lg z-50 animate-pulse flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
          Dragging task... Drop to change status
        </div>
      )}

      {/* Desktop view - all columns side by side */}
      <div className="hidden md:grid md:grid-cols-3 gap-6">
        {columns.map(column => (
          <div key={column} 
            className={`flex flex-col rounded-lg border ${getColumnColor(column)} 
              ${readOnly ? 'shadow-none' : 'hover:shadow-md transition-shadow'}
              ${dragOverColumn === column ? 'ring-2 ring-blue-400 bg-blue-50/50' : ''}`}
            onDragOver={(e) => handleDragOver(e, column)}
            onDrop={(e) => handleDrop(e, column)}
            onDragLeave={() => setDragOverColumn(null)}
          >
            <div className={`p-4 border-b border-inherit ${readOnly ? '' : 'font-bold'}`}>
              <h3 className={`font-semibold text-lg ${getColumnTextColor(column)}`}>
                {getColumnName(column)} ({getColumnTasks(column).length})
              </h3>
            </div>
            <div className={`flex-1 p-3 ${readOnly ? 'min-h-[300px]' : 'min-h-[500px]'} max-h-[calc(100vh-300px)] overflow-y-auto
              ${dragOverColumn === column ? 'bg-blue-50/30' : ''}`}
            >
              {renderColumnTasks(column)}
            </div>
          </div>
        ))}
      </div>

      {/* Mobile view - active column only */}
      <div className="md:hidden">
        <div className={`flex flex-col rounded-lg border ${getColumnColor(activeColumn)} 
            ${readOnly ? 'shadow-none' : 'hover:shadow-md transition-shadow'}`}
        >
          <div className={`p-3 min-h-[50vh] overflow-y-auto`}>
            {renderColumnTasks(activeColumn)}
          </div>
        </div>
      </div>
    </div>
  );

  // Helper function to render tasks for a column
  function renderColumnTasks(column: KanbanStatus) {
    const columnTasks = getColumnTasks(column);
    
    if (columnTasks.length === 0) {
      return (
        <div className="flex items-center justify-center h-24 rounded-lg border border-dashed border-gray-300 bg-white/50">
          <div className="text-center">
            <p className={`text-sm ${getColumnTextColor(column)} font-medium`}>No tasks</p>
            <p className="text-xs text-gray-500 mt-1">Tasks will appear here</p>
          </div>
        </div>
      );
    }

    return columnTasks.map(task => (
      <div 
        key={task.id}
        className={`mb-3 ${!readOnly ? 'cursor-grab active:cursor-grabbing' : ''} 
          ${draggedTask === task.id ? 'opacity-50 scale-95' : 'opacity-100'}
          transition-all duration-200`}
        draggable={!readOnly && !isLoading}
        onDragStart={() => handleDragStart(task.id)}
        onDragEnd={handleDragEnd}
      >
        <Card 
          className={`${readOnly ? '' : 'hover:shadow-md hover:translate-y-[-2px] hover:border-gray-300'} 
            transition-all duration-200 border border-gray-200`}
        >
          <div className="p-3">
            <div className="flex gap-2 mb-2 flex-wrap">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTaskTypeColor(task.type)}`}>
                {task.type === 'bug' ? 'Bug' : 'Feature'}
              </span>
              {task.severity && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  task.severity.toLowerCase().includes('high') || task.severity.toLowerCase().includes('urgent') 
                    ? 'bg-orange-100 text-orange-800' 
                    : task.severity.toLowerCase().includes('medium') 
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                }`}>
                  {task.severity}
                </span>
              )}
            </div>
            
            <h4 className="font-medium text-sm text-gray-800 mb-2" title={task.description}>
              {task.description?.length > 80 
                ? `${task.description.substring(0, 80)}...` 
                : task.description || 'No description'}
            </h4>
            
            <div className="text-xs text-gray-600 mb-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-indigo-700">Developer: {task.developer}</span>
                <span className="font-medium text-gray-700">{task.hoursInvested} hrs</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span>Reported by: {task.reportedBy}</span>
                <span className="font-medium text-gray-700">Cost: Rs{task.cost}</span>
              </div>
              {task.kanbanStatus === 'done' && task.resolvedOn && (
                <div className="flex justify-between items-center mt-1 text-green-600">
                  <span>Resolved on:</span>
                  <span className="font-medium">{task.resolvedOn}</span>
                </div>
              )}
            </div>

            {!readOnly && onStatusUpdate && column !== 'done' && (
              <div className="mt-2">
                <Button
                  variant={column === 'todo' ? 'primary' : 'outline'}
                  disabled={isLoading}
                  onClick={() => {
                    const nextStatus = column === 'todo' ? 'doing' : 'done';
                    
                    // If moving to done, confirm with user as it will update the price
                    if (nextStatus === 'done') {
                      const hourlyRate = task.type === 'bug' ? 200 : 300;
                      const price = hourlyRate * task.hoursInvested;
                      const confirmed = window.confirm(
                        `Moving this ${task.type} to Done will set its price to Rs${price} (${task.hoursInvested} hours × Rs${hourlyRate}/hr). Continue?`
                      );
                      if (!confirmed) return;
                    }
                    
                    onStatusUpdate(task.id, nextStatus);
                  }}
                  className="w-full text-sm py-1"
                >
                  Move to {column === 'todo' ? 'Doing' : 'Done'}
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    ));
  }
}