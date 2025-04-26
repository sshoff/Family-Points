import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';

export const LanguageSwitch = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ru' : 'en';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <Button 
      variant="ghost" 
      onClick={toggleLanguage} 
      className="text-sm text-gray-600 flex items-center"
    >
      <Languages className="h-5 w-5 mr-2" />
      <span>{t('nav.language')}</span>
    </Button>
  );
};
