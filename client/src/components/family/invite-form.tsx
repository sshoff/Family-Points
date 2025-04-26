import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from '@shared/schema';

type InviteFormProps = {
  open: boolean;
  onClose: () => void;
};

export const InviteForm = ({ open, onClose }: InviteFormProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  const formSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email' }),
    role: z.enum([UserRole.PARENT, UserRole.CHILD]),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      role: UserRole.PARENT,
    },
  });

  // Invite mutation
  const inviteMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      await apiRequest('POST', '/api/family/invite', values);
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: t('family.invitationSent'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/family/invitations'] });
      onClose();
      form.reset();
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    inviteMutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('family.inviteMembers')}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('family.email')}</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('family.role')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('family.selectRole')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UserRole.PARENT}>{t('roles.parent')}</SelectItem>
                      <SelectItem value={UserRole.CHILD}>{t('roles.child')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={onClose}>
                {t('actions.cancel')}
              </Button>
              <Button type="submit" disabled={inviteMutation.isPending}>
                {inviteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('family.send')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
