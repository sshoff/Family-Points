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
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.username')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder={t('auth.usernamePlaceholder')}
                            onChange={field.onChange}
                            value={field.value || ""}
                          />
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
                          <Input
                            {...field}
                            type="password"
                            placeholder="••••••••"
                            onChange={field.onChange}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.name')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder={t('auth.namePlaceholder')}
                            onChange={field.onChange}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('auth.username')}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder={t('auth.usernamePlaceholder')}
                            onChange={field.onChange}
                            value={field.value || ""}
                          />
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
                          <Input
                            {...field}
                            type="email"
                            placeholder={t('auth.emailPlaceholder')}
                            onChange={field.onChange}
                            value={field.value || ""}
                          />
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
                          <Input
                            {...field}
                            type="password"
                            placeholder="••••••••"
                            onChange={field.onChange}
                            value={field.value || ""}
                          />
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
                          <Input
                            {...field}
                            type="text"
                            placeholder={t('auth.familyNamePlaceholder')}
                            onChange={field.onChange}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>{t('auth.role')}</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={(value) => field.onChange(value as UserRole)}
                            defaultValue={field.value}
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
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
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
