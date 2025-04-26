import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

const DashboardPage = () => {
  const { t } = useTranslation();
  const [selectedChild, setSelectedChild] = useState<string>("");
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(navigator.language, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const todayActions = [
    {
      id: 1,
      name: "Clean room",
      points: 5,
      quantity: 1,
      assignedBy: "Mom",
      isCompleted: true,
      date: formatDate(new Date()),
      description: "Clean your room and make your bed"
    },
    {
      id: 2,
      name: "Do homework",
      points: 10,
      quantity: 1,
      assignedBy: "Dad",
      isCompleted: false,
      date: formatDate(new Date()),
      description: "Complete math and science homework"
    },
    {
      id: 3,
      name: "Take out trash",
      points: 3,
      quantity: 1,
      assignedBy: "Mom",
      isCompleted: false,
      date: formatDate(new Date()),
      description: "Take out the trash from all rooms"
    }
  ];

  // Mock family members data for selector
  const familyMembers = [
    { id: 1, name: "Alex", role: "child" },
    { id: 2, name: "Emily", role: "child" },
    { id: 3, name: "Sam", role: "child" }
  ];

  const childrenOptions = familyMembers.filter(member => member.role === "child");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with navigation */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-xl font-bold text-primary-600">FamilyPoints</Link>
            
            <nav className="hidden md:flex space-x-6">
              <Link href="/dashboard" className="text-primary-600 font-medium">{t('nav.dashboard')}</Link>
              <Link href="/actions" className="text-gray-700 hover:text-primary-600 transition">{t('nav.actions')}</Link>
              <Link href="/reports" className="text-gray-700 hover:text-primary-600 transition">{t('nav.reports')}</Link>
              <Link href="/family" className="text-gray-700 hover:text-primary-600 transition">{t('nav.family')}</Link>
              <Link href="/suggestions" className="text-gray-700 hover:text-primary-600 transition">{t('nav.suggestions')}</Link>
              <Link href="/settings" className="text-gray-700 hover:text-primary-600 transition">{t('nav.settings')}</Link>
            </nav>
            
            <div className="flex items-center space-x-3">
              <Link href="/auth" className="text-gray-700 hover:text-primary-600 transition">
                {t('nav.logout')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t('dashboard.welcomeBack')}, Parent User</h1>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{t('actions.selectChild')}:</span>
            <select 
              className="border border-gray-300 rounded-md px-3 py-1.5"
              value={selectedChild}
              onChange={(e) => setSelectedChild(e.target.value)}
            >
              <option value="">All children</option>
              {childrenOptions.map(child => (
                <option key={child.id} value={child.id.toString()}>{child.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Dashboard Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-2">{t('dashboard.thisWeek')}</h3>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-primary-600">45</p>
                <p className="text-sm text-gray-500">{t('dashboard.pointsEarned')}</p>
              </div>
              <div className="text-green-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                <span className="text-sm ml-1">+15%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-2">{t('dashboard.thisMonth')}</h3>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-primary-600">156</p>
                <p className="text-sm text-gray-500">{t('dashboard.pointsEarned')}</p>
              </div>
              <div className="text-green-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                <span className="text-sm ml-1">+8%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-2">{t('dashboard.actionsCompleted')}</h3>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-bold text-primary-600">12</p>
                <p className="text-sm text-gray-500">{t('actions.completed')}</p>
              </div>
              <div className="text-green-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                <span className="text-sm ml-1">+20%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{t('dashboard.todaysActions')}</h2>
            <Link href="/actions" className="text-primary-600 hover:underline text-sm">
              {t('dashboard.viewAll')} →
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todayActions.map(action => (
              <div key={action.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className={`px-4 py-2 border-l-4 ${action.isCompleted ? 'border-green-500 bg-green-50' : 'border-orange-500 bg-orange-50'}`}>
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{action.name}</span>
                    <span className="text-primary-600 font-bold">
                      {action.points} × {action.quantity} = {action.points * action.quantity} pts
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 text-sm mb-3">{action.description}</p>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div>{action.assignedBy}</div>
                    <div>{action.date}</div>
                  </div>
                  <div className="mt-4 flex justify-end space-x-2">
                    {!action.isCompleted && (
                      <button className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition">
                        {t('actions.completed')}
                      </button>
                    )}
                    <button className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition">
                      {t('common.edit')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;