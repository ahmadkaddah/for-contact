document.addEventListener('DOMContentLoaded', () => {
    // عداد الزيارات
    initVisitCounter();
    // تحديث التاريخ في الفوتر
    updateFooterDate();
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