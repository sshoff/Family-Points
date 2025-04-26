import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Sidebar } from '@/components/layout/sidebar';
import { DashboardSummary } from '@/components/dashboard/dashboard-summary';
import { ActionCard } from '@/components/dashboard/action-card';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@shared/schema';

const DashboardPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [today] = useState(new Date());
  
  // Fetch today's actions
  const { data: todaysActions, isLoading: isLoadingActions } = useQuery({
    queryKey: ['/api/assigned-actions/today'],
  });

  // Fetch pending suggestions (only if user is head or parent)
  const { data: pendingSuggestions, isLoading: isLoadingSuggestions } = useQuery({
    queryKey: ['/api/action-suggestions/pending'],
    enabled: user?.role !== UserRole.CHILD,
  });

  // Fetch family members
  const { data: familyMembers, isLoading: isLoadingFamily } = useQuery({
    queryKey: ['/api/family/members'],
  });

  const formatDate = (date: Date) => {
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto lg:ml-64">
        <div className="p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold mb-1">
              {t('dashboard.welcomeBack')}, {user?.name}!
            </h1>
            <p className="text-gray-600">{formatDate(today)}</p>
          </div>

          {/* Dashboard Summary */}
          <DashboardSummary />

          {/* Today's Actions */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{t('dashboard.todaysActions')}</h2>
              <Link href="/actions">
                <a className="text-primary-600 text-sm font-medium hover:underline">
                  {t('dashboard.viewAll')}
                </a>
              </Link>
            </div>
            
            {isLoadingActions ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(i => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <Skeleton className="h-5 w-1/2" />
                          <Skeleton className="h-5 w-12" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                        <div className="flex justify-between">
                          <Skeleton className="h-6 w-24 rounded-full" />
                          <Skeleton className="h-6 w-6 rounded-full" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : todaysActions?.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {todaysActions.map((action: any) => (
                  <ActionCard 
                    key={action.id}
                    id={action.id}
                    name={action.actionTemplate.name}
                    points={action.actionTemplate.points}
                    assignedBy={action.assignedByUser.name}
                    quantity={action.quantity}
                    isCompleted={action.completed}
                    date={action.date}
                    description={action.description}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 flex justify-center">
                  <p className="text-gray-500">{t('common.noData')}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Family Members and Pending Suggestions */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Family Members */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold">
                    {t('dashboard.familyMembers')}
                  </CardTitle>
                  {(user?.role === UserRole.HEAD || user?.role === UserRole.PARENT) && (
                    <Link href="/family">
                      <a className="text-primary-600 text-sm font-medium hover:underline">
                        {t('family.inviteMembers')}
                      </a>
                    </Link>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingFamily ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="flex items-center">
                        <Skeleton className="h-10 w-10 rounded-full mr-3" />
                        <div>
                          <Skeleton className="h-5 w-24 mb-1" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : familyMembers?.length > 0 ? (
                  <div className="space-y-4">
                    {familyMembers.map((member: any) => (
                      <div key={member.id} className="flex items-center">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 
                          ${member.role === UserRole.HEAD ? 'bg-primary-100 text-primary-600' : 
                            member.role === UserRole.PARENT ? 'bg-pink-100 text-pink-600' : 
                            'bg-amber-100 text-amber-600'}`}>
                          {member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                            ${member.role === UserRole.HEAD ? 'bg-primary-100 text-primary-700' : 
                              member.role === UserRole.PARENT ? 'bg-blue-100 text-blue-700' : 
                              'bg-amber-100 text-amber-700'}`}>
                            {t(`roles.${member.role}`)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-6 text-gray-500">
                    <p>{t('common.noData')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Suggestions (Only for parents and heads) */}
            {user?.role !== UserRole.CHILD && (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold">
                      {t('dashboard.pendingSuggestions')}
                    </CardTitle>
                    <Link href="/suggestions">
                      <a className="text-primary-600 text-sm font-medium hover:underline">
                        {t('dashboard.viewAll')}
                      </a>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingSuggestions ? (
                    <div className="space-y-4">
                      {[1, 2].map(i => (
                        <Card key={i}>
                          <CardContent className="p-3">
                            <div className="space-y-3">
                              <div className="flex justify-between">
                                <Skeleton className="h-5 w-1/2" />
                                <Skeleton className="h-5 w-12" />
                              </div>
                              <Skeleton className="h-4 w-full" />
                              <div className="flex space-x-2">
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-8 w-24" />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : pendingSuggestions?.length > 0 ? (
                    <div className="space-y-4">
                      {pendingSuggestions.map((suggestion: any) => (
                        <Card key={suggestion.id}>
                          <CardContent className="p-3">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <p className="font-medium">{suggestion.actionTemplate.name}</p>
                                <p className="text-sm text-gray-600">From: {suggestion.child.name}</p>
                              </div>
                              <span className={`font-semibold ${suggestion.actionTemplate.points >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {suggestion.actionTemplate.points >= 0 ? '+' : ''}
                                {suggestion.actionTemplate.points}
                              </span>
                            </div>
                            {suggestion.description && (
                              <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                            )}
                            <div className="flex space-x-2">
                              <Link href={`/suggestions?approve=${suggestion.id}`}>
                                <a className="px-3 py-1 text-sm font-medium rounded-md bg-primary-100 text-primary-700">
                                  {t('suggestions.approve')}
                                </a>
                              </Link>
                              <Link href={`/suggestions?decline=${suggestion.id}`}>
                                <a className="px-3 py-1 text-sm font-medium rounded-md bg-red-100 text-red-700">
                                  {t('suggestions.decline')}
                                </a>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-6 text-gray-500">
                      <p>{t('suggestions.noSuggestions')}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
