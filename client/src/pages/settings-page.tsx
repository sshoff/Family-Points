import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sidebar } from '@/components/layout/sidebar';
import { useAuth } from '@/hooks/use-auth';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const formSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
    email: z.string().email({ message: 'Please enter a valid email' }).optional().or(z.literal('')),
    currentPassword: z.string().optional(),
    newPassword: z.string().optional(),
    confirmPassword: z.string().optional(),
  }).refine((data) => {
    // If any password field is filled, all password fields must be filled
    if (data.currentPassword || data.newPassword || data.confirmPassword) {
      return data.currentPassword && data.newPassword && data.confirmPassword;
    }
    return true;
  }, {
    message: "All password fields must be filled to change password",
    path: ["confirmPassword"],
  }).refine((data) => {
    // If new password is provided, it must match confirm password
    if (data.newPassword && data.confirmPassword) {
      return data.newPassword === data.confirmPassword;
    }
    return true;
  }, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Update user profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      await apiRequest('PATCH', '/api/user', values);
    },
    onSuccess: () => {
      toast({
        title: t('common.success'),
        description: t('settings.settingsUpdated'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
    },
    onError: (error) => {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    updateProfileMutation.mutate(values);
  };

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto lg:ml-64">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-1">{t('nav.settings')}</h1>
            <p className="text-gray-600">Manage your account and application preferences</p>
          </div>

          {/* Settings Sections */}
          <div className="space-y-6">
            {/* Account Settings */}
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.accountSettings')}</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('settings.name')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('settings.email')}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <h3 className="font-medium pt-2">Change Password</h3>
                    
                    <FormField
                      control={form.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current {t('settings.password')}</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New {t('settings.password')}</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm {t('settings.password')}</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="pt-2">
                      <Button 
                        type="submit" 
                        className="w-full md:w-auto"
                        disabled={updateProfileMutation.isPending}
                      >
                        {updateProfileMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {t('settings.save')}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Language Settings */}
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.language')}</CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup 
                  defaultValue={i18n.language} 
                  onValueChange={changeLanguage} 
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="en" id="lang-en" />
                    <Label htmlFor="lang-en">{t('settings.english')}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="ru" id="lang-ru" />
                    <Label htmlFor="lang-ru">{t('settings.russian')}</Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle>{t('settings.notifications')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                    <span>{t('settings.emailNotifications')}</span>
                    <span className="font-normal text-sm text-gray-500">
                      Receive emails for important updates
                    </span>
                  </Label>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="action-reminders" className="flex flex-col space-y-1">
                    <span>{t('settings.actionReminders')}</span>
                    <span className="font-normal text-sm text-gray-500">
                      Get reminded about pending actions
                    </span>
                  </Label>
                  <Switch id="action-reminders" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="weekly-reports" className="flex flex-col space-y-1">
                    <span>{t('settings.weeklyReports')}</span>
                    <span className="font-normal text-sm text-gray-500">
                      Receive weekly activity reports
                    </span>
                  </Label>
                  <Switch id="weekly-reports" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
