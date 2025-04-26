import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

const ActionsPage = () => {
  const { t } = useTranslation();
  const [selectedChild, setSelectedChild] = useState<string>("");
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(navigator.language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // Mock action templates
  const actionTemplates = [
    {
      id: 1,
      name: "Clean room",
      points: 5,
      description: "Clean your room and make your bed"
    },
    {
      id: 2,
      name: "Do homework",
      points: 10,
      description: "Complete math and science homework"
    },
    {
      id: 3,
      name: "Take out trash",
      points: 3,
      description: "Take out the trash from all rooms"
    },
    {
      id: 4,
      name: "Do the dishes",
      points: 4,
      description: "Wash and put away the dishes after dinner"
    },
    {
      id: 5,
      name: "Read a book",
      points: 8,
      description: "Read a book for at least 30 minutes"
    },
    {
      id: 6,
      name: "Help with groceries",
      points: 6,
      description: "Help bring in and put away groceries"
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
              <Link href="/dashboard" className="text-gray-700 hover:text-primary-600 transition">Dashboard</Link>
              <Link href="/actions" className="text-primary-600 font-medium">Actions</Link>
              <Link href="/reports" className="text-gray-700 hover:text-primary-600 transition">Reports</Link>
              <Link href="/family" className="text-gray-700 hover:text-primary-600 transition">Family</Link>
              <Link href="/suggestions" className="text-gray-700 hover:text-primary-600 transition">Suggestions</Link>
              <Link href="/settings" className="text-gray-700 hover:text-primary-600 transition">Settings</Link>
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">{t('nav.actions')}</h1>
          
          <div className="flex space-x-4">
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
            
            <button
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
            >
              {t('actions.addAction')}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-lg">{t('actions.actionName')}</h2>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder={t('actions.searchActions')}
                  className="border border-gray-300 rounded-md py-1.5 px-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary-600"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('actions.actionName')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('actions.description')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('actions.points')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {actionTemplates.map((action) => (
                  <tr key={action.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{action.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {action.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-primary-600">{action.points} pts</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900">
                        {t('actions.assignAction')}
                      </button>
                      <button className="text-blue-600 hover:text-blue-900 ml-2">
                        {t('common.edit')}
                      </button>
                      <button className="text-red-600 hover:text-red-900 ml-2">
                        {t('common.delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ActionsPage;