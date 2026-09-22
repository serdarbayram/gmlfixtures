// Classic scripts keep the editor usable directly from file:// without a server.
let currentLang = 'en';
const languageStorageKey = 'fixture-editor-language';
const htmlTranslationKeys = new Set(['important_note', 'msg_concave']);

function t(key, parameters = {}) {
    const message = translations[currentLang]?.[key] ?? translations.en[key] ?? key;
    return message.replace(/\{(\w+)\}/g, (placeholder, name) => parameters[name] ?? placeholder);
}

function getSavedLanguage() {
    try {
        return localStorage.getItem(languageStorageKey) || 'en';
    } catch {
        return 'en';
    }
}

function setLanguage(language) {
    const previousLanguage = currentLang;
    currentLang = Object.hasOwn(translations, language) ? language : 'en';
    document.documentElement.lang = currentLang;
    document.getElementById('langSelect').value = currentLang;
    try {
        localStorage.setItem(languageStorageKey, currentLang);
    } catch {
        // Storage can be disabled, especially for local files.
    }

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.dataset.i18n;
        if (htmlTranslationKeys.has(key)) element.innerHTML = t(key);
        else element.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const label = t(element.dataset.i18nTitle);
        element.title = label;
        element.setAttribute('aria-label', label);
    });
    updateWarningMsg();
    updatePointsList();
    translateCodeComments(previousLanguage);
}

// Translate existing output without regenerating it from potentially edited points.
function translateCodeComments(previousLanguage) {
    const output = document.getElementById('codeOutput');
    const previous = translations[previousLanguage];
    if (!output.textContent.trim() || output.textContent === previous.msg_code_placeholder) {
        output.textContent = t('msg_code_placeholder');
        return;
    }
    const keys = Object.keys(previous).filter(key => key.startsWith('code_'));
    output.textContent = output.textContent.split('\n').map(line => {
        for (const key of keys) {
            const template = previous[key];
            if (!template.includes('{n}')) {
                if (line === template) return t(key);
                continue;
            }
            const [prefix, suffix] = template.split('{n}');
            if (line.startsWith(prefix) && line.endsWith(suffix)) {
                const number = line.slice(prefix.length, suffix ? -suffix.length : undefined);
                if (/^\d+$/.test(number)) return t(key, { n: number });
            }
        }
        return line;
    }).join('\n');
}
