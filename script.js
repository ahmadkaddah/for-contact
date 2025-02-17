document.addEventListener('DOMContentLoaded', () => {
    // عداد الزيارات
    initVisitCounter();

    // وضع الليل/النهار
    initThemeToggle();
});

function initVisitCounter() {
    const visitsElement = document.getElementById('visits');
    let visits = localStorage.getItem('visits') || 0;
    visits = parseInt(visits) + 1;
    localStorage.setItem('visits', visits);
    visitsElement.textContent = visits;
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

const bioElement = document.getElementById('typed-bio');
typeWriter(bioElement, 'Computer Networks and Cyber Security');
// Add this to your existing code
document.getElementById('currentYear').textContent = new Date().getFullYear();
function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // تحقق من الوضع المحفوظ
    const savedTheme = localStorage.getItem('theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);
    themeToggle.checked = savedTheme === 'light';

    themeToggle.addEventListener('change', () => {
        const newTheme = themeToggle.checked ? 'light' : 'dark';
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}