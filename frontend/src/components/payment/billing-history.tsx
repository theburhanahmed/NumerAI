'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Receipt, Calendar } from 'lucide-react';
import { GlassCard } from '@/components/glassmorphism/glass-card';
import { paymentsAPI } from '@/lib/api-client';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

interface BillingHistoryItem {
  id: string;
  amount: string;
  currency: string;
  description: string;
  invoice_url?: string;
  period_start?: string;
  period_end?: string;
  created_at: string;
}

export function BillingHistory() {
  const [history, setHistory] = useState<BillingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await paymentsAPI.getBillingHistory();
      const data = response.data;
      setHistory(data.results || []);
      setHasMore(!!data.next);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load billing history',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: string, currency: string) => {
    const numAmount = parseFloat(amount);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase() || 'USD',
    }).format(numAmount);
  };

  if (loading) {
    return (
      <GlassCard variant="default" className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="default" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Receipt className="w-6 h-6" />
          Billing History
        </h2>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12">
          <Receipt className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            No billing history yet
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {item.description}
                    </h3>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatAmount(item.amount, item.currency)}
                    </span>
                  </div>
                  
                  {item.period_start && item.period_end && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(item.period_start).toLocaleDateString()} -{' '}
                        {new Date(item.period_end).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {formatDistanceToNow(new Date(item.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                
                {item.invoice_url && (
                  <a
                    href={item.invoice_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="View Invoice"
                  >
                    <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

