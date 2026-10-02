import { en } from './en/index.js';
import { hi } from './hi/index.js';

const dictionaries = { en, hi };

export const getTranslation = (lang, key) => {
  const keys = key.split('.');
  let current = dictionaries[lang] || dictionaries['en'];
  
  for (const k of keys) {
    if (current && typeof current === 'object' && k in current) {
      current = current[k];
    } else {
      return key; // Fallback to key if not found
    }
  }
  return current;
};
