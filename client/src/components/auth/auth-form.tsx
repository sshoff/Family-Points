import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/hooks/use-auth';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export const AuthForm = () => {
  const { t } = useTranslation();
  const { loginMutation, registerMutation } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  const loginSchema = z.object({
    username: z.string().min(3, {
      message: 'Username must be at least 3 characters',
    }),
    password: z.string().min(6, {
      message: 'Password must be at least 6 characters',
    }),
  });

  const registerSchema = z.object({
    username: z.string().min(3, {
      message: 'Username must be at least 3 characters',
    }),
    password: z.string().min(6, {
      message: 'Password must be at least 6 characters',
    }),
    name: z.string().min(2, {
      message: 'Name must be at least 2 characters',
    }),
    email: z.string().email({
      message: 'Please enter a valid email',
    }).optional().or(z.literal('')),
    familyName: z.string().min(2, {
      message: 'Family name must be at least 2 characters',
    }),
  });

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      name: '',
      email: '',
      familyName: '',
    },
  });

  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values);
  };

  const onRegisterSubmit = (values: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(values);
  };

  return (
    <div className="w-full">
      {isLogin ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{t('auth.loginTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.username')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('auth.username')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.password')}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder={t('auth.password')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {t('auth.loginButton')}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter>
            <Button variant="link" className="mx-auto" onClick={() => setIsLogin(false)}>
              {t('auth.switchToRegister')}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">{t('auth.registerTitle')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.username')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('auth.username')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.password')}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder={t('auth.password')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.name')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('auth.name')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.email')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('auth.email')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="familyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('auth.familyName')}</FormLabel>
                      <FormControl>
                        <Input placeholder={t('auth.familyName')} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {t('auth.registerButton')}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter>
            <Button variant="link" className="mx-auto" onClick={() => setIsLogin(true)}>
              {t('auth.switchToLogin')}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};
