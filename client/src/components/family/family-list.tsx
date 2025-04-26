import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { InviteForm } from './invite-form';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { UserRole } from '@shared/schema';
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

export const FamilyList = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<number | null>(null);

  // Fetch family members
  const { data: members, isLoading, refetch } = useQuery({
    queryKey: ['/api/family/members'],
  });

  // Delete member mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/family/members/${id}`);
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: 'Family member removed successfully',
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

  const handleDeleteMember = () => {
    if (memberToDelete) {
      deleteMutation.mutate(memberToDelete);
      setMemberToDelete(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case UserRole.HEAD:
        return 'bg-primary-100 text-primary-700';
      case UserRole.PARENT:
        return 'bg-blue-100 text-blue-700';
      case UserRole.CHILD:
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getAvatarColor = (role: string) => {
    switch (role) {
      case UserRole.HEAD:
        return 'bg-primary-100 text-primary-600';
      case UserRole.PARENT:
        return 'bg-pink-100 text-pink-600';
      case UserRole.CHILD:
        return 'bg-amber-100 text-amber-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <>
      {/* Family Members List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">{t('dashboard.familyMembers')}</h2>
          <Button onClick={() => setIsInviteOpen(true)}>
            {t('family.inviteMembers')}
          </Button>
        </div>
        
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
                  <TableHead>Name</TableHead>
                  <TableHead>{t('family.role')}</TableHead>
                  <TableHead>{t('family.email')}</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members?.length > 0 ? (
                  members.map((member: any) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center mr-3 ${getAvatarColor(member.role)}`}>
                            {getInitials(member.name)}
                          </div>
                          <div className="font-medium">{member.name}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(member.role)}`}>
                          {t(`roles.${member.role}`)}
                        </span>
                      </TableCell>
                      <TableCell>{member.email || '-'}</TableCell>
                      <TableCell className="text-right">
                        {/* Only allow editing if you're a head, or if you're not trying to edit a head */}
                        {(member.role !== UserRole.HEAD) && (
                          <Button 
                            variant="ghost" 
                            className="text-red-600 hover:text-red-900"
                            onClick={() => setMemberToDelete(member.id)}
                          >
                            {t('common.delete')}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                      {t('common.noData')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Pending Invitations */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">{t('family.pendingInvitations')}</h2>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-center p-6 text-gray-500">
            <p>{t('family.noInvitations')}</p>
          </div>
        </div>
      </div>

      {/* Invite Form Dialog */}
      <InviteForm 
        open={isInviteOpen} 
        onClose={() => setIsInviteOpen(false)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!memberToDelete}
        onOpenChange={(open) => !open && setMemberToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Family Member?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently remove the member from your family.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('actions.noCancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMember}
              className="bg-red-600 hover:bg-red-700"
            >
              Yes, remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
