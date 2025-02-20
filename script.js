document.addEventListener('DOMContentLoaded', () => {
    initVisitCounter();
    updateFooterDate();
    initLanguageToggle();
    typeWriter(document.getElementById('typed-bio'), 'Computer Networks and Cyber Security');
});

function initVisitCounter() {
    const visitsElement = document.getElementById('visits');
    let visits = localStorage.getItem('visits') || 0;
    visits = parseInt(visits) + 1;
    localStorage.setItem('visits', visits);
    visitsElement.textContent = visits;
    if (visits === 1) {
        alert('Welcome to your first visit! Enjoy exploring the links.');
    }
}

function updateFooterDate() {
    const footerDateElement = document.getElementById('currentYear');
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = today.toLocaleDateString('en-US', options);
    footerDateElement.innerHTML = `Ahmad Kaddah<br>${formattedDate}`;
}

function typeWriter(element, text, speed = 100) {
    let i = 0;
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

function initLanguageToggle() {
    const langToggle = document.getElementById('langToggle');
    const translations = {
        ar: {
            visits: 'زيارات',
            instagram: 'انستغرام',
            twitter: 'تويتر',
            linkedin: 'لينكد إن',
            website: 'موقعي الشخصي',
            whatsapp: 'واتساب',
            telegram: 'تيليجرام'
        },
        en: {
            visits: 'Visits',
            instagram: 'Instagram',
            twitter: 'Twitter',
            linkedin: 'LinkedIn',
            website: 'My Website',
            whatsapp: 'WhatsApp',
            telegram: 'Telegram'
        }
    };

    let currentLang = 'ar';

    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'ar' ? 'en' : 'ar';
        document.documentElement.setAttribute('lang', currentLang);
        langToggle.querySelector('span').textContent = currentLang === 'ar' ? 'EN' : 'AR';
        updateTexts(translations[currentLang]);
    });
}

function updateTexts(texts) {
    document.querySelector('.visit-counter').childNodes[1].textContent = ` ${texts.visits} `;
    const buttons = document.querySelectorAll('.link-button');
    buttons.forEach(button => {
        if (button.href.includes('instagram')) button.childNodes[1].textContent = ` ${texts.instagram}`;
        if (button.href.includes('twitter')) button.childNodes[1].textContent = ` ${texts.twitter}`;
        if (button.href.includes('linkedin')) button.childNodes[1].textContent = ` ${texts.linkedin}`;
        if (button.href.includes('d7m0s.space')) button.childNodes[1].textContent = ` ${texts.website}`;
        if (button.href.includes('wa.me')) button.childNodes[1].textContent = ` ${texts.whatsapp}`;
        if (button.href.includes('t.me')) button.childNodes[1].textContent = ` ${texts.telegram}`;
    });
}