import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

const LanguageSwitcher = () => {
  const { lang, setLang } = useTranslation();

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', padding: '2px 4px' }}>
      <button
        type="button"
        onClick={() => setLang('en')}
        style={{
          border: 'none',
          background: lang === 'en' ? '#fff' : 'transparent',
          color: lang === 'en' ? '#2E7D32' : '#fff',
          fontWeight: 'bold',
          padding: '4px 10px',
          borderRadius: '16px',
          cursor: 'pointer',
          fontSize: '0.85rem'
        }}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang('hi')}
        style={{
          border: 'none',
          background: lang === 'hi' ? '#fff' : 'transparent',
          color: lang === 'hi' ? '#2E7D32' : '#fff',
          fontWeight: 'bold',
          padding: '4px 10px',
          borderRadius: '16px',
          cursor: 'pointer',
          fontSize: '0.85rem'
        }}
      >
        हिन्दी
      </button>
    </div>
  );
};

export default LanguageSwitcher;
