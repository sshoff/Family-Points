import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SuggestionForm } from './suggestion-form';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { format, parseISO } from 'date-fns';

export const SuggestionList = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [isSuggestionFormOpen, setIsSuggestionFormOpen] = useState(false);
  const [tab, setTab] = useState('pending');

  // Extract query parameters if present
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const approveId = params.get('approve');
    const declineId = params.get('decline');
    
    if (approveId) {
      approveMutation.mutate(parseInt(approveId));
      setLocation('/suggestions', { replace: true });
    } else if (declineId) {
      declineMutation.mutate(parseInt(declineId));
      setLocation('/suggestions', { replace: true });
    }
  }, [location]);

  // Fetch suggestions based on current tab
  const { data: suggestions, isLoading, refetch } = useQuery({
    queryKey: ['/api/action-suggestions', tab],
  });

  // Approve suggestion mutation
  const approveMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('PATCH', `/api/action-suggestions/${id}/approve`);
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: t('suggestions.suggestionApproved'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/action-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Decline suggestion mutation
  const declineMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('PATCH', `/api/action-suggestions/${id}/decline`);
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: t('suggestions.suggestionDeclined'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/action-suggestions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleTabChange = (value: string) => {
    setTab(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">{t('suggestions.pending')}</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">{t('suggestions.approved')}</Badge>;
      case 'declined':
        return <Badge variant="outline" className="bg-red-100 text-red-800">{t('suggestions.declined')}</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'PPP');
    } catch (error) {
      return dateString;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <>
      {/* Suggestions Tabs */}
      <div className="mb-6 flex justify-between items-center">
        <Tabs defaultValue="pending" value={tab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="pending">{t('suggestions.pending')}</TabsTrigger>
            <TabsTrigger value="approved">{t('suggestions.approved')}</TabsTrigger>
            <TabsTrigger value="declined">{t('suggestions.declined')}</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button onClick={() => setIsSuggestionFormOpen(true)}>
          {t('suggestions.suggestNew')}
        </Button>
      </div>

      {/* Suggestions Content */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap justify-between items-start">
                    <div className="flex items-center mb-2">
                      <Skeleton className="h-10 w-10 rounded-full mr-3" />
                      <div className="space-y-1">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  {tab === 'pending' && (
                    <div className="flex space-x-2">
                      <Skeleton className="h-10 w-24" />
                      <Skeleton className="h-10 w-24" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : suggestions?.length > 0 ? (
          suggestions.map((suggestion: any) => (
            <Card key={suggestion.id}>
              <CardContent className="p-4">
                <div className="flex flex-wrap justify-between items-start mb-3">
                  <div className="mb-2 md:mb-0">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mr-3">
                        {getInitials(suggestion.child.name)}
                      </div>
                      <div>
                        <h3 className="font-medium">{suggestion.child.name}</h3>
                        <p className="text-sm text-gray-500">
                          {formatDate(suggestion.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(suggestion.status)}
                </div>
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{suggestion.actionTemplate.name}</h3>
                    <span className={`${suggestion.actionTemplate.points >= 0 ? 'text-green-500' : 'text-red-500'} font-semibold`}>
                      {suggestion.actionTemplate.points >= 0 ? '+' : ''}
                      {suggestion.actionTemplate.points}
                    </span>
                  </div>
                  {suggestion.description && (
                    <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                  )}
                  <div className="text-sm text-gray-600">
                    <p>
                      <span>{t('actions.quantity')}: </span>
                      {suggestion.quantity}
                    </p>
                    <p>
                      <span>{t('actions.date')}: </span>
                      {formatDate(suggestion.date)}
                    </p>
                    {suggestion.status !== 'pending' && suggestion.decidedBy && (
                      <>
                        <p>
                          <span>{t('suggestions.decidedBy')}: </span>
                          {suggestion.decidedBy.name}
                        </p>
                        {suggestion.decidedAt && (
                          <p>
                            <span>{t('suggestions.decidedAt')}: </span>
                            {formatDate(suggestion.decidedAt)}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
                {suggestion.status === 'pending' && (
                  <div className="flex flex-wrap space-x-2">
                    <Button 
                      variant="outline"
                      className="bg-primary-100 text-primary-700 border-primary-200 hover:bg-primary-200"
                      onClick={() => approveMutation.mutate(suggestion.id)}
                    >
                      {t('suggestions.approve')}
                    </Button>
                    <Button 
                      variant="outline"
                      className="bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
                      onClick={() => declineMutation.mutate(suggestion.id)}
                    >
                      {t('suggestions.decline')}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 flex justify-center">
              <p className="text-gray-500">{t('suggestions.noSuggestions')}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Suggestion Form Dialog */}
      <SuggestionForm 
        open={isSuggestionFormOpen} 
        onClose={() => setIsSuggestionFormOpen(false)} 
      />
    </>
  );
};
