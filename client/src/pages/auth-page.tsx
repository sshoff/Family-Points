import { useTranslation } from 'react-i18next';

const AuthPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Left side with auth form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="bg-white shadow-lg rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {t('auth.loginTitle')}
            </h2>
            <p className="text-center mb-6">
              Welcome to FamilyPoints - a multilingual family action tracking app with role-based permissions.
            </p>
            <div className="space-y-4">
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
              <button 
                className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 transition"
              >
                {t('auth.loginButton')}
              </button>
              <div className="text-center mt-4">
                <a href="#" className="text-sm text-primary-600 hover:underline">
                  {t('auth.switchToRegister')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side with hero section */}
      <div className="flex-1 bg-primary-600 text-white flex items-center justify-center p-6 md:p-12">
        <div className="max-w-md">
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
          <div className="mt-6">
            <p className="text-sm text-white/80">
              Choose your language:
              <button className="ml-2 px-3 py-1 bg-white/20 rounded-md hover:bg-white/30 transition">
                English
              </button>
              <button className="ml-2 px-3 py-1 bg-white/20 rounded-md hover:bg-white/30 transition">
                Русский
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
