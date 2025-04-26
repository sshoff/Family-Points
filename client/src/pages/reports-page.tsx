import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";

const ReportsPage = () => {
  const { t } = useTranslation();
  const [selectedChild, setSelectedChild] = useState<string>("");
  const [reportType, setReportType] = useState<string>("");
  const [dateRange, setDateRange] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [showResults, setShowResults] = useState(false);
  
  // Mock family members data for selector
  const familyMembers = [
    { id: 1, name: "Alex", role: "child" },
    { id: 2, name: "Emily", role: "child" },
    { id: 3, name: "Sam", role: "child" }
  ];

  const childrenOptions = familyMembers.filter(member => member.role === "child");

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(true);
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
              <Link href="/reports" className="text-primary-600 font-medium">Reports</Link>
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
        <h1 className="text-2xl font-bold mb-6">{t('nav.reports')}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="font-semibold text-lg mb-4">{t('reports.generateReport')}</h2>
              <form onSubmit={handleGenerateReport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('reports.selectChild')}
                  </label>
                  <select 
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={selectedChild}
                    onChange={(e) => setSelectedChild(e.target.value)}
                    required
                  >
                    <option value="" disabled>{t('reports.selectChild')}</option>
                    {childrenOptions.map(child => (
                      <option key={child.id} value={child.id.toString()}>{child.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('reports.reportType')}
                  </label>
                  <select 
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    required
                  >
                    <option value="" disabled>{t('reports.reportType')}</option>
                    <option value="actions">{t('dashboard.todaysActions')}</option>
                    <option value="points">{t('dashboard.pointsEarned')}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('reports.dateRange')}
                  </label>
                  <select 
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    required
                  >
                    <option value="" disabled>{t('reports.dateRange')}</option>
                    <option value="day">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="custom">{t('reports.custom')}</option>
                  </select>
                </div>
                
                {dateRange === 'custom' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t('reports.from')}
                      </label>
                      <input 
                        type="date" 
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        {t('reports.to')}
                      </label>
                      <input 
                        type="date" 
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}
                
                <button 
                  type="submit"
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
                >
                  {t('reports.generateReport')}
                </button>
              </form>
            </div>
          </div>
          
          <div className="md:col-span-2">
            {!showResults ? (
              <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center h-full">
                <p className="text-gray-500 text-center">
                  {t('reports.generateReport')} {t('common.toSeeResults')}.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="font-semibold text-lg">
                    {reportType === 'actions' ? t('dashboard.todaysActions') : t('dashboard.pointsEarned')} - {selectedChild ? childrenOptions.find(c => c.id.toString() === selectedChild)?.name : 'All Children'}
                  </h2>
                </div>
                
                <div className="p-6">
                  {reportType === 'points' ? (
                    <div>
                      {/* Points summary */}
                      <div className="flex justify-center mb-10">
                        <div className="bg-primary-50 rounded-full w-40 h-40 flex flex-col items-center justify-center border-4 border-primary-100">
                          <span className="text-4xl font-bold text-primary-600">156</span>
                          <span className="text-sm text-gray-500">{t('dashboard.pointsEarned')}</span>
                        </div>
                      </div>
                      
                      {/* Point distribution */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                          <h3 className="font-medium text-green-700 mb-1">Clean room</h3>
                          <p className="text-2xl font-bold text-green-600">45 <span className="text-sm font-normal">pts</span></p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                          <h3 className="font-medium text-blue-700 mb-1">Homework</h3>
                          <p className="text-2xl font-bold text-blue-600">60 <span className="text-sm font-normal">pts</span></p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                          <h3 className="font-medium text-purple-700 mb-1">Other</h3>
                          <p className="text-2xl font-bold text-purple-600">51 <span className="text-sm font-normal">pts</span></p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Actions List */}
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('actions.actionName')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('actions.date')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('actions.points')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('actions.status')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">Clean room</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                              June 15, 2023
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-semibold text-primary-600">5 pts</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {t('actions.completed')}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">Do homework</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                              June 14, 2023
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-semibold text-primary-600">10 pts</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {t('actions.completed')}
                              </span>
                            </td>
                          </tr>
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">Take out trash</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                              June 14, 2023
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-semibold text-primary-600">3 pts</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                                {t('actions.pending')}
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;