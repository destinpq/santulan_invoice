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
    <Card className="w-full max-w-md mx-auto px-4 py-5 sm:px-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-3">Developer Access</h2>
      <p className="text-xs sm:text-sm text-gray-600 mb-3">
        Enter your developer key to access and manage all tasks in the system.
      </p>
      
      <div className="mb-3 bg-blue-50 p-2 sm:p-3 rounded-md text-xs sm:text-sm text-blue-800">
        <p className="font-medium">Log in as system administrator</p>
      </div>
      
      <form onSubmit={handleSubmit(submitHandler)} className="space-y-3 sm:space-y-4">
        <div>
          <label htmlFor="key" className="block text-xs sm:text-sm font-medium text-gray-700">
            Developer Key
          </label>
          <input
            id="key"
            type="text"
            {...register('key')}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-xs sm:text-sm"
            placeholder="Enter your unique developer key"
          />
          {errors.key && (
            <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.key.message}</p>
          )}
        </div>
        
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full text-sm"
        >
          {isLoading ? 'Accessing...' : 'Access Tasks'}
        </Button>
      </form>
    </Card>
  );
}