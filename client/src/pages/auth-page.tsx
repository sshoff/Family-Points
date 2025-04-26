import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'wouter';

const AuthPage = () => {
  const { t, i18n } = useTranslation();
  const [, navigate] = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Just redirect to dashboard for now
    navigate('/dashboard');
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
                ? "Welcome back to FamilyPoints!" 
                : "Join FamilyPoints to track your family's activities!"}
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('auth.name')}
                  </label>
                  <input 
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="John Doe"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('auth.username')}
                </label>
                <input 
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="username"
                />
              </div>
              
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('auth.email')}
                  </label>
                  <input 
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="you@example.com"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('auth.password')}
                </label>
                <input 
                  type="password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="••••••••"
                />
              </div>
              
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('auth.familyName')}
                  </label>
                  <input 
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Smith Family"
                  />
                </div>
              )}
              
              <button 
                type="submit"
                className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 transition"
              >
                {isLogin ? t('auth.loginButton') : t('auth.registerButton')}
              </button>
              
              <div className="text-center mt-4">
                <button 
                  type="button"
                  onClick={() => setIsLogin(!isLogin)} 
                  className="text-sm text-primary-600 hover:underline"
                >
                  {isLogin ? t('auth.switchToRegister') : t('auth.switchToLogin')}
                </button>
              </div>
            </form>
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
            {t('auth.welcomeBack')}
          </h1>
          <p className="text-lg mb-6">
            {t('auth.startTracking')}
          </p>
          <div className="bg-white/10 rounded-lg p-4">
            <ul className="space-y-2">
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Track children's actions and rewards</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Assign points for completed tasks</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Generate detailed reports</span>
              </li>
              <li className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Manage your family members</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
