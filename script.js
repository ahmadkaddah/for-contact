document.addEventListener('DOMContentLoaded', () => {
    initVisitCounter();
    updateFooterDate();
    initLanguageToggle();
    typeWriter(document.getElementById('typed-bio'), 'Computer Networks and Cyber Security');
});

const firebaseConfig = {
    apiKey: "AIzaSyBgEptr2h0L51zbJoHGYhdsn_0AtsNSgY0",
    authDomain: "my-contact-93149.firebaseapp.com",
    databaseURL: "https://my-contact-93149-default-rtdb.firebaseio.com",
    messagingSenderId: "703234243497",
    appId: "1:703234243497:web:5222998870477aca4722b8"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

function initVisitCounter() {
    const visitsElement = document.getElementById('visits');
    const visitsRef = db.ref('visits');

    visitsRef.transaction(currentVisits => {
        return (currentVisits || 0) + 1;
    }).then(snapshot => {
        const visits = snapshot.snapshot.val();
        visitsElement.textContent = visits;
        if (visits === 1) {
            alert('Welcome to your first visit! Enjoy exploring the links.');
        }
    }).catch(error => {
        console.error('Error updating visit counter:', error);
        visitsElement.textContent = '--';
    });
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
            telegram: 'تيليجرام',
            loveTest: 'هل تحبني',
            trustTest: 'هل تثق بي'
        },
        en: {
            visits: 'Visits',
            instagram: 'Instagram',
            twitter: 'Twitter',
            linkedin: 'LinkedIn',
            website: 'My Website',
            whatsapp: 'WhatsApp',
            telegram: 'Telegram',
            loveTest: 'Do U love me',
            trustTest: 'Do U trust me'
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
    const questionButtons = document.querySelectorAll('.question-button');
    questionButtons.forEach(button => {
        if (button.href.includes('Love-Test')) {
            button.querySelector(`span[data-lang="${currentLang}"]`).style.display = 'block';
            button.querySelector(`span[data-lang="${currentLang === 'ar' ? 'en' : 'ar'}"]`).style.display = 'none';
        }
        if (button.href.includes('matias.ma')) {
            button.querySelector(`span[data-lang="${currentLang}"]`).style.display = 'block';
            button.querySelector(`span[data-lang="${currentLang === 'ar' ? 'en' : 'ar'}"]`).style.display = 'none';
        }
    });
}