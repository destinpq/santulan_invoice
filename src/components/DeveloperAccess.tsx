import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

const developerSchema = z.object({
  key: z.string().min(1, { message: 'Developer key is required' }),
});

type DeveloperFormData = z.infer<typeof developerSchema>;

interface DeveloperAccessProps {
  onAccess: (key: string) => void;
}

export function DeveloperAccess({ onAccess }: DeveloperAccessProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<DeveloperFormData>({
    resolver: zodResolver(developerSchema),
  });

  const submitHandler = (data: DeveloperFormData) => {
    setIsLoading(true);
    // In a production app, you might want to verify this key with an API
    onAccess(data.key);
    setIsLoading(false);
  };

  return (
    <Card className="max-w-md mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Developer Access</h2>
      <p className="text-sm text-gray-600 mb-4">
        Enter your developer key to access your tasks and update their status.
      </p>
      
      <div className="mb-4 bg-blue-50 p-3 rounded-md text-sm text-blue-800">
        <p className="font-medium">Use &quot;Akanksha100991!&quot; to log in as DestinPQ</p>
      </div>
      
      <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
        <div>
          <label htmlFor="key" className="block text-sm font-medium text-gray-700">
            Developer Key
          </label>
          <input
            id="key"
            type="text"
            {...register('key')}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter your unique developer key"
          />
          {errors.key && (
            <p className="mt-1 text-sm text-red-600">{errors.key.message}</p>
          )}
        </div>
        
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? 'Accessing...' : 'Access Tasks'}
        </Button>
      </form>
    </Card>
  );
}