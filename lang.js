document.addEventListener('DOMContentLoaded', () => {
    const langBtn = document.getElementById('lang-toggle');
    const langLabel = document.getElementById('lang-label');
    
    let currentLang = localStorage.getItem('site_lang') || 'en';

    function setLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('site_lang', lang);
        
        document.documentElement.lang = lang;
        
        if (langLabel) {
            langLabel.textContent = lang === 'en' ? 'TR' : 'EN';
        }

        const translatableElements = document.querySelectorAll('[data-tr][data-en]');
        translatableElements.forEach(el => {
            if (lang === 'tr') {
                el.innerHTML = el.getAttribute('data-tr');
            } else {
                el.innerHTML = el.getAttribute('data-en');
            }
        });

        window.dispatchEvent(new Event('languageChanged'));
    }

    setLanguage(currentLang);

    if (langBtn) {
        langBtn.addEventListener('click', () => {
            const newLang = currentLang === 'en' ? 'tr' : 'en';
            setLanguage(newLang);
        });
    }
});
