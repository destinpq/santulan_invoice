import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from './ui/Button';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const severityLevels = [
  'Low', 'Medium', 'High', 'Critical', 'Urgent'
];

const buckets = [
  'Frontend', 'Backend', 'Database', 'UI/UX', 'Authentication', 
  'Performance', 'Security', 'Documentation', 'Other'
];

// Form validation schema
const taskSchema = z.object({
  emailAddress: z.string().email({ message: 'Valid email address is required' }),
  dateReported: z.string().min(1, { message: 'Date reported is required' }),
  reportedBy: z.string().min(2, { message: 'Reporter name is required' }),
  type: z.enum(['bug', 'feature'], { 
    required_error: 'Task type is required',
    invalid_type_error: 'Task type must be either "bug" or "feature"'
  }),
  severity: z.string().min(1, { message: 'Severity level is required' }),
  screenshot: z.string().optional(),
  bucket: z.string().min(1, { message: 'Category bucket is required' }),
  description: z.string().min(3, { message: 'Description must be at least 3 characters' }),
  month: z.string().min(1, { message: 'Month is required' }),
  developer: z.string().min(1, { message: 'Developer key is required' }),
  hoursInvested: z.number().min(0, { message: 'Hours must be 0 or positive' }).default(0),
  status: z.enum(['pending', 'completed']).default('pending'),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface AddTaskFormProps {
  onSubmit: (data: TaskFormData) => void;
  isLoading?: boolean;
}

export function AddTaskForm({ onSubmit, isLoading = false }: AddTaskFormProps) {
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      month: new Date().toLocaleString('default', { month: 'long' }),
      dateReported: new Date().toISOString().split('T')[0],
      severity: 'Medium',
      hoursInvested: 0,
      status: 'pending'
    }
  });

  const submitHandler = (data: TaskFormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="reportedBy" className="block text-sm font-medium text-gray-700">
            Reported By
          </label>
          <input
            id="reportedBy"
            type="text"
            {...register('reportedBy')}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="John Doe"
          />
          {errors.reportedBy && (
            <p className="mt-1 text-sm text-red-600">{errors.reportedBy.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="emailAddress" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            id="emailAddress"
            type="email"
            {...register('emailAddress')}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="john.doe@example.com"
          />
          {errors.emailAddress && (
            <p className="mt-1 text-sm text-red-600">{errors.emailAddress.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="dateReported" className="block text-sm font-medium text-gray-700">
            Date Reported
          </label>
          <input
            id="dateReported"
            type="date"
            {...register('dateReported')}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.dateReported && (
            <p className="mt-1 text-sm text-red-600">{errors.dateReported.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="month" className="block text-sm font-medium text-gray-700">
            Month
          </label>
          <select 
            id="month"
            {...register('month')}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            {months.map((month) => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          {errors.month && (
            <p className="mt-1 text-sm text-red-600">{errors.month.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Task Type</label>
        <div className="mt-2 space-x-4">
          <label className="inline-flex items-center">
            <input
              type="radio"
              {...register('type')}
              value="bug"
              className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-700">Bug Fix ($200)</span>
          </label>
          <label className="inline-flex items-center">
            <input
              type="radio"
              {...register('type')}
              value="feature"
              className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-700">New Feature ($300)</span>
          </label>
        </div>
        {errors.type && (
          <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="severity" className="block text-sm font-medium text-gray-700">
            Severity / Urgency
          </label>
          <select 
            id="severity"
            {...register('severity')}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            {severityLevels.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
          {errors.severity && (
            <p className="mt-1 text-sm text-red-600">{errors.severity.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="bucket" className="block text-sm font-medium text-gray-700">
            Category / Bucket
          </label>
          <select 
            id="bucket"
            {...register('bucket')}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">Select a category</option>
            {buckets.map((bucket) => (
              <option key={bucket} value={bucket}>{bucket}</option>
            ))}
          </select>
          {errors.bucket && (
            <p className="mt-1 text-sm text-red-600">{errors.bucket.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          {...register('description')}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Describe the issue or feature request..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="screenshot" className="block text-sm font-medium text-gray-700">
          Screenshot URL (optional)
        </label>
        <input
          id="screenshot"
          type="url"
          {...register('screenshot')}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="https://example.com/screenshot.png"
        />
        {errors.screenshot && (
          <p className="mt-1 text-sm text-red-600">{errors.screenshot.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="developer" className="block text-sm font-medium text-gray-700">
            Developer Key
          </label>
          <input
            id="developer"
            type="text"
            {...register('developer')}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="developer-unique-key"
          />
          {errors.developer && (
            <p className="mt-1 text-sm text-red-600">{errors.developer.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="hoursInvested" className="block text-sm font-medium text-gray-700">
            Hours Invested
          </label>
          <input
            id="hoursInvested"
            type="number"
            min="0"
            step="0.5"
            {...register('hoursInvested', { valueAsNumber: true })}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.hoursInvested && (
            <p className="mt-1 text-sm text-red-600">{errors.hoursInvested.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select 
          id="status"
          {...register('status')}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        {errors.status && (
          <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
        )}
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Adding...' : 'Add Task'}
        </Button>
      </div>
    </form>
  );
} 