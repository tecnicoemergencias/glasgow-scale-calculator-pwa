
import React from 'react';
import { Button } from '@/components/ui/button';
import { Languages } from 'lucide-react';
import { useLanguage, Language } from '@/hooks/useLanguage';

const LanguageSelector = () => {
  const { currentLanguage, changeLanguage, t } = useLanguage();

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' }
  ];

  return (
    <div className="relative group">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
        aria-label={t.buttons.language}
      >
        <Languages className="w-4 h-4" />
        {languages.find(l => l.code === currentLanguage)?.flag}
      </Button>
      
      <div className="absolute top-full right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={`flex items-center gap-2 px-4 py-2 text-sm hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg w-full text-left ${
              currentLanguage === lang.code ? 'bg-blue-50 text-blue-700' : ''
            }`}
            aria-pressed={currentLanguage === lang.code}
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
