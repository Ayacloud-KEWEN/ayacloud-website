
    const defaultButtonTexts = {
        button_help: 'HELP',
        button_support: 'SUPPORT US'
    };

    async function loadLanguage(lang) {
      try {
        const res = await fetch('langpingo.json', { cache: "no-store" });
        if (!res.ok) throw new Error('Could not load langpingo.json: ' + res.status);
        const translations = await res.json();

        // Update DOM nodes
        document.querySelectorAll('[data-i18n]').forEach(el => {
          const key = el.getAttribute('data-i18n');
          const value = translations[lang] && translations[lang][key];
          if (value !== undefined) {
            el.textContent = value;
          } else if (defaultButtonTexts[key]) {
              // Fallback for new buttons if translation file is missing keys
              el.textContent = defaultButtonTexts[key];
          }
        });

        // Update <title> explicitly and html lang
        if (translations[lang] && translations[lang].title) {
          document.title = translations[lang].title;
        }
        document.documentElement.lang = lang;

      } catch (err) {
        console.error('i18n load error:', err);
        // Fail gracefully: 保持原始（英）文本
      }
    }

    // Persist and apply selection
    const switcher = document.getElementById('language-switcher');
    switcher.addEventListener('change', (e) => {
      const lang = e.target.value;
      loadLanguage(lang);
      localStorage.setItem('selectedLang', lang);
    });

    window.addEventListener('DOMContentLoaded', () => {
      const saved = localStorage.getItem('selectedLang') || 'en';
      switcher.value = saved;
      loadLanguage(saved);
      
      // 首次加载时，为按钮设置默认文本，直到多语言文件加载完成
      document.querySelectorAll('.tech-button').forEach(btn => {
          const key = btn.getAttribute('data-i18n');
          if (defaultButtonTexts[key] && !btn.textContent) {
              btn.textContent = defaultButtonTexts[key];
          }
      });
    });
 