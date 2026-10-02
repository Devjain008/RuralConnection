import { useContext } from 'react';
import { LanguageContext } from '../store/languageStore';
import { getTranslation } from '../i18n';

export const useTranslation = () => {
  const { lang, setLang } = useContext(LanguageContext);

  const t = (key) => {
    return getTranslation(lang, key);
  };

  return { t, lang, setLang };
};
