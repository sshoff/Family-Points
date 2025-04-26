import { useTranslation } from "react-i18next";
import { Link } from "wouter";

const FamilyPage = () => {
  const { t } = useTranslation();

  // Mock family members
  const familyMembers = [
    { id: 1, name: "John Smith", role: "head", email: "john@example.com" },
    { id: 2, name: "Sarah Smith", role: "parent", email: "sarah@example.com" },
    { id: 3, name: "Alex Smith", role: "child", email: "alex@example.com" },
    { id: 4, name: "Emily Smith", role: "child", email: "emily@example.com" },
  ];

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
              <Link href="/family" className="text-primary-600 font-medium">Family</Link>
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
          <h1 className="text-2xl font-bold">{t('family.inviteMembers')}</h1>
          
          <button
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition"
          >
            {t('family.inviteMembers')}
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-lg">{t('dashboard.familyMembers')}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('auth.name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('family.role')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('family.email')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('common.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {familyMembers.map((member) => (
                  <tr key={member.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{member.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        member.role === 'head' 
                          ? 'bg-purple-100 text-purple-800' 
                          : member.role === 'parent'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {t(`roles.${member.role}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {member.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {member.role !== 'head' && (
                        <button className="text-red-600 hover:text-red-900 ml-2">
                          {t('common.delete')}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-lg">{t('family.pendingInvitations')}</h2>
            </div>
            <div className="p-6">
              <p className="text-gray-500 text-center py-4">
                {t('family.noInvitations')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyPage;