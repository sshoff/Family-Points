import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Sidebar } from '@/components/layout/sidebar';
import { ActionList } from '@/components/actions/action-list';
import { useAuth } from '@/hooks/use-auth';
import { UserRole } from '@shared/schema';

const ActionsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto lg:ml-64">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-1">{t('nav.actions')}</h1>
            <p className="text-gray-600">
              {user?.role === UserRole.CHILD
                ? 'View available actions and your assigned tasks'
                : 'Create and manage action templates for your family'}
            </p>
          </div>

          {/* Only show action management for Head and Parent roles */}
          {user?.role !== UserRole.CHILD && <ActionList />}

          {/* Children can only view actions, not create them */}
          {user?.role === UserRole.CHILD && (
            <div className="bg-white rounded-lg shadow p-6">
              <p>As a child, you can view your assigned actions but cannot create or manage action templates.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActionsPage;
