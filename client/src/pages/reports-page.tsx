import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Sidebar } from '@/components/layout/sidebar';
import { ReportForm } from '@/components/reports/report-form';
import { ReportResults } from '@/components/reports/report-results';

const ReportsPage = () => {
  const { t } = useTranslation();
  const [reportParams, setReportParams] = useState<{
    childId: number;
    reportType: string;
    dateRange: string;
    startDate: Date;
    endDate: Date;
    childName?: string;
  } | null>(null);

  // Fetch family members to get child names
  const { data: familyMembers } = useQuery({
    queryKey: ['/api/family/members'],
  });

  const handleSubmit = (values: {
    childId: number;
    reportType: string;
    dateRange: string;
    startDate: Date;
    endDate: Date;
  }) => {
    // Find the child name
    const child = familyMembers?.find((member: any) => member.id === values.childId);
    const childName = child ? child.name : '';
    
    setReportParams({
      ...values,
      childName
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 overflow-auto lg:ml-64">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold mb-1">{t('nav.reports')}</h1>
            <p className="text-gray-600">Track and analyze children's activities and points</p>
          </div>

          {/* Report Controls */}
          <div className="mb-6">
            <ReportForm onSubmit={handleSubmit} />
          </div>

          {/* Report Content */}
          {reportParams && (
            <ReportResults
              childId={reportParams.childId}
              reportType={reportParams.reportType}
              startDate={reportParams.startDate}
              endDate={reportParams.endDate}
              childName={reportParams.childName || ''}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
