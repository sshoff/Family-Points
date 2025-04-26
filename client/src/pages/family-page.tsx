import { useTranslation } from "react-i18next";
import { FamilyMembersList } from "@/components/family/family-members-list";

const FamilyPage = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('family.title')}</h1>
      </div>

      <FamilyMembersList />
    </div>
  );
};

export default FamilyPage;