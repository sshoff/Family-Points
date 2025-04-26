import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CircleDollarSign,
  BarChart3,
  CheckSquare,
  MessageSquare
} from 'lucide-react';

export const DashboardSummary = ({ childId }: { childId?: number }) => {
  const { t } = useTranslation();
  
  const { data: summaryData, isLoading } = useQuery({
    queryKey: ['/api/summary', childId],
    enabled: childId !== undefined,
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center">
                <Skeleton className="h-12 w-12 rounded-full mr-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Default data if no specific child is selected
  const data = summaryData || {
    weeklyPoints: 45,
    monthlyPoints: 120,
    completedActions: 18,
    pendingSuggestions: 3
  };

  return (
    <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
      {/* Points This Week Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-primary-500 mr-4">
              <CircleDollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-gray-600">{t('dashboard.thisWeek')}</p>
              <p className="text-2xl font-semibold text-gray-900">+{data.weeklyPoints}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Points This Month Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-secondary-500 mr-4">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-gray-600">{t('dashboard.thisMonth')}</p>
              <p className="text-2xl font-semibold text-gray-900">+{data.monthlyPoints}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Completed Actions Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-500 mr-4">
              <CheckSquare className="h-6 w-6" />
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-gray-600">{t('dashboard.actionsCompleted')}</p>
              <p className="text-2xl font-semibold text-gray-900">{data.completedActions}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Pending Suggestions Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-500 mr-4">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-gray-600">{t('dashboard.pendingSuggestions')}</p>
              <p className="text-2xl font-semibold text-gray-900">{data.pendingSuggestions}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
