document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('visits')) {
        initVisitCounter();
    }

    updateFooterDate();

    if (document.getElementById('langToggle')) {
        initLanguageToggle();
    }
    if (document.getElementById('typed-bio')) {
        typeWriter(document.getElementById('typed-bio'), 'Computer Networks and Cyber Security');
    }
    initCertificateViewer();
    initProjectsPage();
    initCertificatesPage();
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

function updateFooterDate(lang = 'ar') {
    const footerDateElement = document.getElementById('currentYear');
    if (footerDateElement) {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = today.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', options);
        footerDateElement.innerHTML = `Ahmad Kaddah<br>${formattedDate}`;
    }
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
            trustTest: 'هل تثق بي',
            funnyVid: 'اضحك شوي',
            github: 'جيتهاب',
            certificates: 'شهاداتي',
            projects: 'مشاريعي'
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
            trustTest: 'Do U trust me',
            funnyVid: 'Laugh a bit',
            github: 'GitHub',
            certificates: 'My Certificates',
            projects: 'My Projects'
        }
    };

    let currentLang = 'ar';

    const savedLang = localStorage.getItem('language');
    if (savedLang) {
        currentLang = savedLang;
        document.documentElement.setAttribute('lang', currentLang);
        langToggle.querySelector('span').textContent = currentLang === 'ar' ? 'EN' : 'AR';
    }

    updateTexts(translations[currentLang], currentLang);

    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'ar' ? 'en' : 'ar';
        document.documentElement.setAttribute('lang', currentLang);
        langToggle.querySelector('span').textContent = currentLang === 'ar' ? 'EN' : 'AR';
        updateTexts(translations[currentLang], currentLang);
        updateFooterDate(currentLang);

        localStorage.setItem('language', currentLang);
    });
}

function updateTexts(texts, currentLang) {
    const visitCounter = document.querySelector('.visit-counter');
    if (visitCounter) {
        visitCounter.childNodes[1].textContent = ` ${texts.visits} `;
    }
    const buttons = document.querySelectorAll('.link-button');
    buttons.forEach(button => {
        if (button.href.includes('instagram')) button.childNodes[1].textContent = ` ${texts.instagram}`;
        if (button.href.includes('twitter')) button.childNodes[1].textContent = ` ${texts.twitter}`;
        if (button.href.includes('linkedin')) button.childNodes[1].textContent = ` ${texts.linkedin}`;
        if (button.href.includes('d7m0s.space')) button.childNodes[1].textContent = ` ${texts.website}`;
        if (button.href.includes('wa.me')) button.childNodes[1].textContent = ` ${texts.whatsapp}`;
        if (button.href.includes('t.me')) button.childNodes[1].textContent = ` ${texts.telegram}`;
        if (button.href.includes('github.com')) button.childNodes[1].textContent = ` ${texts.github}`;
        if (button.href.includes('certificates.html')) button.childNodes[1].textContent = ` ${texts.certificates}`;
        if (button.href.includes('projects.html')) button.childNodes[1].textContent = ` ${texts.projects}`;
    });
    const questionButtons = document.querySelectorAll('.question-button');
    questionButtons.forEach(button => {
        const arSpan = button.querySelector('span[data-lang="ar"]');
        const enSpan = button.querySelector('span[data-lang="en"]');
        if (currentLang === 'ar') {
            arSpan.style.display = 'block';
            enSpan.style.display = 'none';
        } else {
            arSpan.style.display = 'none';
            enSpan.style.display = 'block';
        }
    });
}

function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    function type() {
        if (i < text.length) {
            element.innerHTML = text.substring(0, i + 1);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

function initCertificateViewer() {
    const modal = document.getElementById('certificateModal');
    const modalImg = document.getElementById('expandedCertificate');
    const closeBtn = document.getElementsByClassName('close')[0];
    const certificateImages = document.querySelectorAll('.certificate-image');

    if (!modal || !modalImg || !closeBtn || certificateImages.length === 0) {
        console.log('Certificate viewer elements not found');
        return;
    }

    console.log('Certificate viewer initialized');

    certificateImages.forEach(img => {
        img.style.cursor = 'pointer';
        img.addEventListener('click', function () {
            modal.style.display = 'block';
            modalImg.src = this.src;
        });
    });

    closeBtn.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    modal.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function initCertificatesPage() {
    if (window.location.pathname.includes('certificates.html')) {
        const savedLang = localStorage.getItem('language') || 'ar';
        const htmlElement = document.documentElement;
        htmlElement.setAttribute('lang', savedLang);

        const certificatesTranslations = {
            ar: {
                backButton: 'العودة للصفحة الرئيسية',
                pageTitle: 'شهاداتي'
            },
            en: {
                backButton: 'Back to Home',
                pageTitle: 'My Certificates'
            }
        };

        const texts = certificatesTranslations[savedLang];

        document.querySelector('h1').textContent = texts.pageTitle;

        const backButton = document.querySelector('.back-button');
        if (backButton) {
            const icon = backButton.querySelector('i');
            backButton.innerHTML = '';
            backButton.appendChild(icon);
            backButton.appendChild(document.createTextNode(` ${texts.backButton}`));
        }

        updateFooterDate(savedLang);
    }
}

function initProjectsPage() {
    if (window.location.pathname.includes('projects.html')) {
        const savedLang = localStorage.getItem('language') || 'ar';
        const htmlElement = document.documentElement;
        htmlElement.setAttribute('lang', savedLang);

        const projectsTranslations = {
            ar: {
                backButton: 'العودة للصفحة الرئيسية',
                pageTitle: 'مشاريعي',
                viewCode: 'عرض الكود',
                viewProject: 'عرض المشروع'
            },
            en: {
                backButton: 'Back to Home',
                pageTitle: 'My Projects',
                viewCode: 'View Code',
                viewProject: 'View Project'
            }
        };

        const texts = projectsTranslations[savedLang];

        document.querySelector('h1').textContent = texts.pageTitle;

        const backButton = document.querySelector('.back-button');
        if (backButton) {
            const icon = backButton.querySelector('i');
            backButton.innerHTML = '';
            backButton.appendChild(icon);
            backButton.appendChild(document.createTextNode(` ${texts.backButton}`));
        }

        const projectLinks = document.querySelectorAll('.project-link');
        projectLinks.forEach(link => {
            const icon = link.querySelector('i');
            link.innerHTML = '';
            link.appendChild(icon);

            if (link.href.includes('github.com')) {
                link.appendChild(document.createTextNode(` ${texts.viewCode}`));
            } else {
                link.appendChild(document.createTextNode(` ${texts.viewProject}`));
            }
        });

        updateFooterDate(savedLang);
    }
}
