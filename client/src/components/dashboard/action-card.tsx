import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MoreVertical, CheckCircle, Clock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

type ActionCardProps = {
  id: number;
  name: string;
  points: number;
  assignedBy: string;
  quantity: number;
  isCompleted: boolean;
  date: string;
  description?: string;
  onEdit?: () => void;
  refreshData?: () => void;
  showManageOptions?: boolean;
};

export const ActionCard = ({
  id,
  name,
  points,
  assignedBy,
  quantity,
  isCompleted,
  description,
  onEdit,
  refreshData,
  showManageOptions = true,
}: ActionCardProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);

  // Complete action mutation
  const completeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('PATCH', `/api/assigned-actions/${id}/complete`, { completed: true });
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Action marked as completed!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/assigned-actions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary'] });
      if (refreshData) refreshData();
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete action mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('DELETE', `/api/assigned-actions/${id}`);
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Action deleted successfully!',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/assigned-actions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/summary'] });
      if (refreshData) refreshData();
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleComplete = () => {
    setIsCompleteDialogOpen(false);
    completeMutation.mutate();
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(false);
    deleteMutation.mutate();
  };

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-medium">{name}</h3>
            <span className={`font-semibold ${points >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {points >= 0 ? '+' : ''}{points}
            </span>
          </div>
          <div className="text-sm text-gray-600 mb-3">
            <p>
              <span>{t('actions.assignedBy')}: </span>
              {assignedBy}
            </p>
            <p>
              <span>{t('actions.quantity')}: </span>
              {quantity}
            </p>
            {description && <p>{description}</p>}
          </div>
          <div className="flex justify-between items-center">
            <Badge variant={isCompleted ? 'success' : 'secondary'}>
              {isCompleted ? (
                <CheckCircle className="mr-1 h-3 w-3" />
              ) : (
                <Clock className="mr-1 h-3 w-3" />
              )}
              {isCompleted ? t('actions.completed') : t('actions.pending')}
            </Badge>
            
            {showManageOptions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!isCompleted && (
                    <DropdownMenuItem onClick={() => setIsCompleteDialogOpen(true)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      <span>{t('actions.completed')}</span>
                    </DropdownMenuItem>
                  )}
                  {onEdit && (
                    <DropdownMenuItem onClick={onEdit}>
                      <span>{t('common.edit')}</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <span>{t('common.delete')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Complete Confirmation Dialog */}
      <AlertDialog
        open={isCompleteDialogOpen}
        onOpenChange={setIsCompleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Completed?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the action as completed and award points.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete}>
              {t('actions.completed')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
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
              onClick={handleDelete}
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
