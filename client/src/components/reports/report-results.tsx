import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock } from 'lucide-react';

type ReportResultsProps = {
  childId: number;
  reportType: string;
  startDate: Date;
  endDate: Date;
  childName: string;
};

export const ReportResults = ({ childId, reportType, startDate, endDate, childName }: ReportResultsProps) => {
  const { t } = useTranslation();

  // Format dates for display
  const formattedStartDate = format(startDate, 'MMM d, yyyy');
  const formattedEndDate = format(endDate, 'MMM d, yyyy');

  // Fetch report data based on report type
  const { data, isLoading, error } = useQuery({
    queryKey: [
      reportType === 'actions' ? '/api/reports/actions' : '/api/reports/points',
      childId,
      startDate.toISOString(),
      endDate.toISOString()
    ],
    enabled: childId > 0,
  });

  if (childId <= 0) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center h-64">
          <p className="text-gray-500">{t('reports.selectChild')}</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-2/3" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center h-64">
          <p className="text-red-500">{t('common.error')}</p>
        </CardContent>
      </Card>
    );
  }

  if (reportType === 'points') {
    // Points report is simpler - just show the total points
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {childName} - {t('reports.pointsEarned')} ({formattedStartDate} - {formattedEndDate})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <h2 className="text-4xl font-bold mb-2 text-primary-600">{data.points >= 0 ? '+' : ''}{data.points}</h2>
              <p className="text-gray-500">{t('reports.pointsEarned')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Actions report - show summary and detailed table
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {childName} - {t('reports.actionsSummary')} ({formattedStartDate} - {formattedEndDate})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-12">
            <p className="text-gray-500">{t('reports.noData')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate summary data
  const totalPoints = data.reduce((sum: number, action: any) => sum + action.totalPoints, 0);
  const completedActions = data.filter((action: any) => action.completed).length;
  
  // Find the most common action (if any)
  const actionCounts: Record<string, number> = {};
  data.forEach((action: any) => {
    const actionName = action.actionTemplate.name;
    actionCounts[actionName] = (actionCounts[actionName] || 0) + 1;
  });
  
  let topAction = '';
  let maxCount = 0;
  
  Object.entries(actionCounts).forEach(([action, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topAction = action;
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {childName} - {t('reports.actionsSummary')} ({formattedStartDate} - {formattedEndDate})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-gray-600 mb-1">{t('reports.pointsEarned')}</p>
              <p className="text-2xl font-semibold text-gray-900">{totalPoints >= 0 ? '+' : ''}{totalPoints}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-gray-600 mb-1">{t('reports.actionsCompleted')}</p>
              <p className="text-2xl font-semibold text-gray-900">{completedActions}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-medium text-gray-600 mb-1">{t('reports.topAction')}</p>
              <p className="text-xl font-semibold text-gray-900">{topAction || '-'}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Actions Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('actions.date')}</TableHead>
                <TableHead>{t('actions.actionName')}</TableHead>
                <TableHead>{t('actions.points')}</TableHead>
                <TableHead>{t('actions.quantity')}</TableHead>
                <TableHead>{t('actions.total')}</TableHead>
                <TableHead>{t('actions.status')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((action: any) => (
                <TableRow key={action.id}>
                  <TableCell className="whitespace-nowrap text-sm text-gray-600">
                    {format(new Date(action.date), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="font-medium">{action.actionTemplate.name}</TableCell>
                  <TableCell className="whitespace-nowrap text-sm">
                    {action.actionTemplate.points >= 0 ? '+' : ''}
                    {action.actionTemplate.points}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm">{action.quantity}</TableCell>
                  <TableCell className={`whitespace-nowrap text-sm font-medium ${action.totalPoints >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {action.totalPoints >= 0 ? '+' : ''}
                    {action.totalPoints}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <Badge variant={action.completed ? 'success' : 'secondary'}>
                      {action.completed ? (
                        <CheckCircle className="mr-1 h-3 w-3" />
                      ) : (
                        <Clock className="mr-1 h-3 w-3" />
                      )}
                      {action.completed ? t('actions.completed') : t('actions.pending')}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
