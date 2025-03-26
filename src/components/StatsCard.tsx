import React from 'react';
import { Card } from './ui/Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  className?: string;
}

export function StatsCard({ title, value, description, className = '' }: StatsCardProps) {
  return (
    <Card className={`text-center ${className}`}>
      <h3 className="text-lg font-medium text-gray-700">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
      {description && (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      )}
    </Card>
  );
} 