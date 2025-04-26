import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

const SettingsPage = () => {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || "en");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [actionReminders, setActionReminders] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(false);
  
  // Mock user data
  const user = {
    name: "John Smith",
    email: "john@example.com"
  };

  const handleLanguageChange = (lng: string) => {
    setLanguage(lng);
    i18n.changeLanguage(lng);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Would save settings to server in a real implementation
    alert(t('settings.settingsUpdated'));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with navigation */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-primary-600">FamilyPoints</Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link href="/dashboard" className="text-gray-700 hover:text-primary-600 transition">Dashboard</Link>
              <Link href="/actions" className="text-gray-700 hover:text-primary-600 transition">Actions</Link>
              <Link href="/reports" className="text-gray-700 hover:text-primary-600 transition">Reports</Link>
              <Link href="/family" className="text-gray-700 hover:text-primary-600 transition">Family</Link>
              <Link href="/suggestions" className="text-gray-700 hover:text-primary-600 transition">Suggestions</Link>
              <Link href="/settings" className="text-primary-600 font-medium">Settings</Link>
            </nav>
            
            <div className="flex items-center space-x-3">
              <Link href="/auth" className="text-gray-700 hover:text-primary-600 transition">
                Logout
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">{t('settings.accountSettings')}</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-lg">{t('settings.accountSettings')}</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">{t('auth.name')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t('settings.name')}
                    </label>
                    <input 
                      type="text" 
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      defaultValue={user.name}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t('settings.email')}
                    </label>
                    <input 
                      type="email" 
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      defaultValue={user.email}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t('settings.password')}
                    </label>
                    <input 
                      type="password" 
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="••••••••"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      {t('settings.leaveBlankToKeepCurrent')}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Preferences */}
              <div>
                <h3 className="text-lg font-medium mb-4">{t('settings.preferences')}</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">{t('settings.language')}</h4>
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => handleLanguageChange("en")}
                        className={`px-4 py-2 rounded-md ${
                          language === "en"
                            ? "bg-primary-600 text-white"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        {t('settings.english')}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLanguageChange("ru")}
                        className={`px-4 py-2 rounded-md ${
                          language === "ru"
                            ? "bg-primary-600 text-white"
                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                        }`}
                      >
                        {t('settings.russian')}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">{t('settings.notifications')}</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="emailNotifications"
                          checked={emailNotifications}
                          onChange={(e) => setEmailNotifications(e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                        />
                        <label htmlFor="emailNotifications" className="ml-2 text-gray-700">
                          {t('settings.emailNotifications')}
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="actionReminders"
                          checked={actionReminders}
                          onChange={(e) => setActionReminders(e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                        />
                        <label htmlFor="actionReminders" className="ml-2 text-gray-700">
                          {t('settings.actionReminders')}
                        </label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="weeklyReports"
                          checked={weeklyReports}
                          onChange={(e) => setWeeklyReports(e.target.checked)}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 h-4 w-4"
                        />
                        <label htmlFor="weeklyReports" className="ml-2 text-gray-700">
                          {t('settings.weeklyReports')}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 border-t border-gray-200 pt-6">
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
              >
                {t('settings.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;