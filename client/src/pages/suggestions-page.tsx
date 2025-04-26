import { useTranslation } from "react-i18next";
import { SuggestionsList } from "@/components/suggestions/suggestions-list";

const SuggestionsPage = () => {
  const { t } = useTranslation();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('suggestion.title')}</h1>
      </div>

      <SuggestionsList />
    </div>
  );
};

export default SuggestionsPage;