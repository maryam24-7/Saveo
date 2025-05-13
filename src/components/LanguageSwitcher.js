import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.dir = lng === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <div className="flex justify-end mb-4">
      <button 
        onClick={() => changeLanguage('en')}
        className={`px-3 py-1 text-sm ${i18n.language === 'en' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
      >
        English
      </button>
      <button 
        onClick={() => changeLanguage('ar')}
        className={`px-3 py-1 text-sm ${i18n.language === 'ar' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
      >
        العربية
      </button>
    </div>
  );
};

export default LanguageSwitcher;
