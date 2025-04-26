import { useTranslation } from 'react-i18next';
import { Sidebar } from '@/components/layout/sidebar';
import { FamilyList } from '@/components/family/family-list';
import { useAuth } from '@/hooks/use-auth';

const FamilyPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto lg:ml-64">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-1">{t('nav.family')}</h1>
            <p className="text-gray-600">Manage your family members and invitations</p>
          </div>

          <FamilyList />
        </div>
      </div>
    </div>
  );
};

export default FamilyPage;
