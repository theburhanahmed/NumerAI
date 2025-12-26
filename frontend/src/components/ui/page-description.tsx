'use client';

import React from 'react';
import { InfoIcon } from 'lucide-react';
import { GlassCard } from './glass-card';

interface PageDescriptionProps {
  title: string;
  description: string;
  features?: string[];
  usage?: string;
  examples?: string[];
  className?: string;
}

export function PageDescription({
  title,
  description,
  features,
  usage,
  examples,
  className = ''
}: PageDescriptionProps) {
  return (
    <GlassCard variant="default" className={`p-6 mb-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <InfoIcon className="w-5 h-5 text-white" />
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
            {description}
          </p>
          
          {features && features.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Key Features:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
          
          {usage && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                How to Use:
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {usage}
              </p>
            </div>
          )}
          
          {examples && examples.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Examples:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
                {examples.map((example, index) => (
                  <li key={index}>{example}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

