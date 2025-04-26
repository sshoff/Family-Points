import { useTranslation } from 'react-i18next';
import { Sidebar } from '@/components/layout/sidebar';
import { SuggestionList } from '@/components/suggestions/suggestion-list';
import { useAuth } from '@/hooks/use-auth';

const SuggestionsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto lg:ml-64">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-1">{t('nav.suggestions')}</h1>
            <p className="text-gray-600">Review and manage action suggestions from your children</p>
          </div>

          <SuggestionList />
        </div>
      </div>
    </div>
  );
};

export default SuggestionsPage;
