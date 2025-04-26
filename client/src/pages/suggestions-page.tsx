import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

const SuggestionsPage = () => {
  const { t } = useTranslation();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // Mock suggestions data
  const suggestions = [
    {
      id: 1,
      name: "Play outside",
      points: 7,
      description: "Play outside for at least 30 minutes",
      status: "pending",
      from: "Alex",
      createdAt: "June 15, 2023"
    },
    {
      id: 2,
      name: "Feed the pet",
      points: 4,
      description: "Feed the dog and refresh water bowl",
      status: "approved",
      from: "Emily",
      decidedBy: "Dad",
      decidedAt: "June 14, 2023",
      createdAt: "June 13, 2023"
    },
    {
      id: 3,
      name: "Practice piano",
      points: 8,
      description: "Practice piano for at least 20 minutes",
      status: "declined",
      from: "Sam",
      decidedBy: "Mom",
      decidedAt: "June 12, 2023",
      createdAt: "June 11, 2023"
    }
  ];

  const filteredSuggestions = filterStatus === "all" 
    ? suggestions 
    : suggestions.filter(s => s.status === filterStatus);

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
              <Link href="/suggestions" className="text-primary-600 font-medium">Suggestions</Link>
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
          <h1 className="text-2xl font-bold">{t('nav.suggestions')}</h1>
          
          <button
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
          >
            {t('suggestions.suggestNew')}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-lg">{t('nav.suggestions')}</h2>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">{t('common.filter')}:</label>
              <select 
                className="border border-gray-300 rounded-md px-3 py-1.5"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">{t('common.all')}</option>
                <option value="pending">{t('suggestions.pending')}</option>
                <option value="approved">{t('suggestions.approved')}</option>
                <option value="declined">{t('suggestions.declined')}</option>
              </select>
            </div>
          </div>
          
          {filteredSuggestions.length === 0 ? (
            <div className="p-6">
              <p className="text-gray-500 text-center py-4">
                {t('suggestions.noSuggestions')}
              </p>
            </div>
          ) : (
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('suggestions.from')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('actions.status')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('common.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSuggestions.map((suggestion) => (
                    <tr key={suggestion.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{suggestion.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {suggestion.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-primary-600">{suggestion.points} pts</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {suggestion.from}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          suggestion.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : suggestion.status === 'declined'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {t(`suggestions.${suggestion.status}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {suggestion.status === 'pending' && (
                          <>
                            <button className="text-green-600 hover:text-green-900">
                              {t('suggestions.approve')}
                            </button>
                            <button className="text-red-600 hover:text-red-900 ml-2">
                              {t('suggestions.decline')}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuggestionsPage;