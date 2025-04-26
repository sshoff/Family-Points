import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/use-auth';
import { loginSchema, registerSchema, UserRole } from '@shared/schema';
import { CheckCircle2 } from 'lucide-react';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from '@/hooks/use-toast';

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

const AuthPage = () => {
  const { t, i18n } = useTranslation();
  const [, navigate] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const { user, loginMutation, registerMutation } = useAuth();
  
  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  // Login form
  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  // Register form
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      password: '',
      name: '',
      email: '',
      role: UserRole.HEAD,
      familyName: '',
    },
  });
  
  const handleLoginSubmit = (values: LoginValues) => {
    loginMutation.mutate(values, {
      onSuccess: () => {
        navigate('/dashboard');
      }
    });
  };
  
  const handleRegisterSubmit = (values: RegisterValues) => {
    registerMutation.mutate(values, {
      onSuccess: () => {
        toast({
          title: t('auth.registerSuccess'),
          description: t('auth.registerSuccessDescription'),
        });
        navigate('/dashboard');
      }
    });
  };
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Header for mobile */}
      <div className="md:hidden bg-white p-4 shadow-sm">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-primary-600">FamilyPoints</Link>
          <div className="flex space-x-2">
            <button 
              onClick={() => changeLanguage('en')}
              className={`px-2 py-1 rounded-md ${i18n.language === 'en' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              EN
            </button>
            <button 
              onClick={() => changeLanguage('ru')}
              className={`px-2 py-1 rounded-md ${i18n.language === 'ru' ? 'bg-primary-100 text-primary-700' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              RU
            </button>
          </div>
        </div>
      </div>
      
      {/* Left side with auth form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {isLogin ? t('auth.loginTitle') : t('auth.registerTitle')}
            </h2>
            <p className="text-center mb-6">
              {isLogin 
                ? t('auth.welcomeBack') 
                : t('auth.joinTracking')}
            </p>
            
            {isLogin ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLoginSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">{t('auth.username')}</Label>
                    <Input
                      id="login-username"
                      type="text"
                      placeholder={t('auth.usernamePlaceholder')}
                      value={loginForm.watch('username')}
                      onChange={(e) => loginForm.setValue('username', e.target.value)}
                    />
                    {loginForm.formState.errors.username && (
                      <p className="text-sm text-red-500">{loginForm.formState.errors.username.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="login-password">{t('auth.password')}</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginForm.watch('password')}
                      onChange={(e) => loginForm.setValue('password', e.target.value)}
                    />
                    {loginForm.formState.errors.password && (
                      <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit"
                    className="w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? t('auth.loggingIn') : t('auth.loginButton')}
                  </Button>
                  
                  <div className="text-center mt-4">
                    <Button 
                      type="button"
                      variant="link"
                      onClick={() => setIsLogin(false)} 
                      className="text-sm"
                    >
                      {t('auth.switchToRegister')}
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(handleRegisterSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t('auth.name')}</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder={t('auth.namePlaceholder')}
                      value={registerForm.watch('name')}
                      onChange={(e) => registerForm.setValue('name', e.target.value)}
                    />
                    {registerForm.formState.errors.name && (
                      <p className="text-sm text-red-500">{registerForm.formState.errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">{t('auth.username')}</Label>
                    <Input
                      id="username"
                      type="text"
                      placeholder={t('auth.usernamePlaceholder')}
                      value={registerForm.watch('username')}
                      onChange={(e) => registerForm.setValue('username', e.target.value)}
                    />
                    {registerForm.formState.errors.username && (
                      <p className="text-sm text-red-500">{registerForm.formState.errors.username.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">{t('auth.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder={t('auth.emailPlaceholder')}
                      value={registerForm.watch('email')}
                      onChange={(e) => registerForm.setValue('email', e.target.value)}
                    />
                    {registerForm.formState.errors.email && (
                      <p className="text-sm text-red-500">{registerForm.formState.errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">{t('auth.password')}</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={registerForm.watch('password')}
                      onChange={(e) => registerForm.setValue('password', e.target.value)}
                    />
                    {registerForm.formState.errors.password && (
                      <p className="text-sm text-red-500">{registerForm.formState.errors.password.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="familyName">{t('auth.familyName')}</Label>
                    <Input
                      id="familyName"
                      type="text"
                      placeholder={t('auth.familyNamePlaceholder')}
                      value={registerForm.watch('familyName')}
                      onChange={(e) => registerForm.setValue('familyName', e.target.value)}
                    />
                    {registerForm.formState.errors.familyName && (
                      <p className="text-sm text-red-500">{registerForm.formState.errors.familyName.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t('auth.role')}</Label>
                    <RadioGroup
                      value={registerForm.watch('role')}
                      onValueChange={(value) => registerForm.setValue('role', value as UserRole)}
                      className="flex flex-col space-y-1"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={UserRole.HEAD} id="head" />
                        <Label htmlFor="head" className="font-normal">{t('auth.roleHead')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={UserRole.CHILD} id="child" />
                        <Label htmlFor="child" className="font-normal">{t('auth.roleChild')}</Label>
                      </div>
                    </RadioGroup>
                    {registerForm.formState.errors.role && (
                      <p className="text-sm text-red-500">{registerForm.formState.errors.role.message}</p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit"
                    className="w-full"
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? t('auth.registering') : t('auth.registerButton')}
                  </Button>
                  
                  <div className="text-center mt-4">
                    <Button 
                      type="button"
                      variant="link"
                      onClick={() => setIsLogin(true)} 
                      className="text-sm"
                    >
                      {t('auth.switchToLogin')}
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </div>
        </div>
      </div>
      
      {/* Right side with hero section */}
      <div className="hidden md:flex flex-1 bg-primary-600 text-white items-center justify-center p-6 md:p-12">
        <div className="max-w-md">
          <div className="flex justify-between items-center mb-8">
            <Link href="/" className="text-xl font-bold text-white">FamilyPoints</Link>
            <div className="flex space-x-2">
              <button 
                onClick={() => changeLanguage('en')}
                className="px-2 py-1 bg-white/20 rounded-md hover:bg-white/30 transition"
              >
                EN
              </button>
              <button 
                onClick={() => changeLanguage('ru')}
                className="px-2 py-1 bg-white/20 rounded-md hover:bg-white/30 transition"
              >
                RU
              </button>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {t('auth.heroTitle')}
          </h1>
          <p className="text-lg mb-6">
            {t('auth.startTracking')}
          </p>
          <div className="bg-white/10 rounded-lg p-4">
            <ul className="space-y-2">
              <li className="flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                <span>{t('auth.featureTrack')}</span>
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                <span>{t('auth.featureAssign')}</span>
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                <span>{t('auth.featureReports')}</span>
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                <span>{t('auth.featureFamily')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
