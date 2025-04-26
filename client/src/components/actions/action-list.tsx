import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ActionForm } from './action-form';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Plus } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const ActionList = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [isActionFormOpen, setIsActionFormOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<{ id: number; name: string; points: number } | undefined>();
  const [actionToDelete, setActionToDelete] = useState<number | null>(null);

  // Fetch action templates
  const { data: actions, isLoading, refetch } = useQuery({
    queryKey: ['/api/action-templates'],
  });

  // Delete action mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/action-templates/${id}`);
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: t('actions.actionDeleted'),
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleEditAction = (action: any) => {
    setCurrentAction(action);
    setIsActionFormOpen(true);
  };

  const handleAddAction = () => {
    setCurrentAction(undefined);
    setIsActionFormOpen(true);
  };

  const handleCloseActionForm = () => {
    setIsActionFormOpen(false);
    setCurrentAction(undefined);
  };

  const handleDeleteAction = () => {
    if (actionToDelete) {
      deleteMutation.mutate(actionToDelete);
      setActionToDelete(null);
    }
  };

  const filteredActions = actions?.filter((action: any) => 
    action.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Action Controls */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[240px]">
          <div className="relative">
            <Input
              className="pl-10 pr-4 py-2"
              placeholder={t('actions.searchActions')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
        <Button onClick={handleAddAction}>
          <Plus className="h-4 w-4 mr-2" />
          {t('actions.addAction')}
        </Button>
      </div>

      {/* Actions Table */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('actions.actionName')}</TableHead>
                  <TableHead>{t('actions.points')}</TableHead>
                  <TableHead>{t('actions.description')}</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActions?.length > 0 ? (
                  filteredActions.map((action: any) => (
                    <TableRow key={action.id}>
                      <TableCell className="font-medium">{action.name}</TableCell>
                      <TableCell className={`${action.points >= 0 ? 'text-green-500' : 'text-red-500'} font-semibold`}>
                        {action.points >= 0 ? '+' : ''}{action.points}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {action.description || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          className="text-primary-600 hover:text-primary-900 mr-3"
                          onClick={() => handleEditAction(action)}
                        >
                          {t('common.edit')}
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => setActionToDelete(action.id)}
                        >
                          {t('common.delete')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                      {search ? t('common.noData') : 'No actions created yet. Add your first action!'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
      
      {/* Action Form Dialog */}
      <ActionForm 
        open={isActionFormOpen} 
        onClose={handleCloseActionForm} 
        action={currentAction}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!actionToDelete}
        onOpenChange={(open) => !open && setActionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('actions.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('actions.noCancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAction}
              className="bg-red-600 hover:bg-red-700"
            >
              {t('actions.yesDelete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
