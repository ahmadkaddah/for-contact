document.addEventListener('DOMContentLoaded', () => {
    initStudio();
    updateFooterDate();
});

const firebaseConfig = {
    apiKey: "AIzaSyBmFFKL9k_FwSgl9CwOIlDa44UYgXs1YWc",
    authDomain: "forportfolio-12e53.firebaseapp.com",
    databaseURL: "https://forportfolio-12e53-default-rtdb.firebaseio.com",
    projectId: "forportfolio-12e53",
    storageBucket: "forportfolio-12e53.firebasestorage.app",
    messagingSenderId: "591432636",
    appId: "1:591432636:web:0d18618bb760f25529b9b9",
    measurementId: "G-01HJRPCM28"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

const CLOUDINARY_CONFIG = {
    cloudName: 'dmnvus7x0',
    uploadPreset: 'gallery-upload',
    apiKey: ''
};

const ADMIN_PASSWORD = 'Q1w2e3e3w2q1!!';

let currentImages = [];
let currentImageIndex = 0;
let isAdminLoggedIn = false;
let scrollObserver;

function initStudio() {
    const savedLang = localStorage.getItem('language') || 'ar';
    document.documentElement.setAttribute('lang', savedLang);

    setupScrollObserver();
    checkAdminStatus();
    loadGallery();
    setupEventListeners();
    setupGalleryListeners();
    initLanguageToggle();
}

function checkAdminStatus() {
    const adminStatus = sessionStorage.getItem('adminLoggedIn');
    if (adminStatus === 'true') {
        isAdminLoggedIn = true;
        showAdminControls();
    } else {
        showLoginButton();
    }
}

function showLoginButton() {
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const uploadSection = document.getElementById('uploadSection');
    if (adminLoginBtn) adminLoginBtn.style.display = 'block';
    if (uploadSection) uploadSection.style.display = 'none';
}

function showAdminControls() {
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const uploadSection = document.getElementById('uploadSection');
    if (adminLoginBtn) adminLoginBtn.style.display = 'none';
    if (uploadSection) uploadSection.style.display = 'block';
}

function setupEventListeners() {
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const loginModal = document.getElementById('loginModal');
    const loginClose = document.querySelector('.login-close');
    const loginSubmitBtn = document.getElementById('loginSubmitBtn');
    const passwordToggle = document.getElementById('passwordToggle');
    const adminPassword = document.getElementById('adminPassword');
    const imageUpload = document.getElementById('imageUpload');
    const logoutBtn = document.getElementById('logoutBtn');

    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', () => {
            if (loginModal) loginModal.style.display = 'block';
        });
    }

    if (loginClose) {
        loginClose.addEventListener('click', () => {
            if (loginModal) loginModal.style.display = 'none';
            const loginError = document.getElementById('loginError');
            if (loginError) loginError.style.display = 'none';
            if (adminPassword) adminPassword.value = '';
        });
    }

    if (loginSubmitBtn) {
        loginSubmitBtn.addEventListener('click', handleLogin);
    }

    if (adminPassword) {
        adminPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleLogin();
        });
    }

    if (passwordToggle) {
        passwordToggle.addEventListener('click', () => {
            const type = adminPassword.getAttribute('type') === 'password' ? 'text' : 'password';
            adminPassword.setAttribute('type', type);
            passwordToggle.querySelector('i').classList.toggle('fa-eye');
            passwordToggle.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }

    if (imageUpload) {
        imageUpload.addEventListener('change', handleImageUpload);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isAdminLoggedIn = false;
            sessionStorage.removeItem('adminLoggedIn');
            showLoginButton();
            displayGallery(currentImages);
        });
    }

    if (loginModal) {
        loginModal.addEventListener('click', (e) => {
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
                const loginError = document.getElementById('loginError');
                if (loginError) loginError.style.display = 'none';
                if (adminPassword) adminPassword.value = '';
            }
        });
    }
}

function handleLogin() {
    const adminPassword = document.getElementById('adminPassword');
    const loginError = document.getElementById('loginError');
    const loginModal = document.getElementById('loginModal');

    if (adminPassword && adminPassword.value === ADMIN_PASSWORD) {
        isAdminLoggedIn = true;
        sessionStorage.setItem('adminLoggedIn', 'true');
        showAdminControls();
        document.body.classList.add('is-admin');
        if (loginModal) loginModal.style.display = 'none';
        if (adminPassword) adminPassword.value = '';
        if (loginError) loginError.style.display = 'none';
        displayGallery(currentImages);
    } else {
        if (loginError) loginError.style.display = 'flex';
        if (adminPassword) adminPassword.value = '';
    }
}

function setupGalleryListeners() {
    const galleryClose = document.querySelector('.gallery-close');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const imageModal = document.getElementById('imageModal');

    if (galleryClose) {
        galleryClose.addEventListener('click', () => {
            if (imageModal) imageModal.style.display = 'none';
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentImageIndex > 0) {
                currentImageIndex--;
                updateModalImage();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentImageIndex < currentImages.length - 1) {
                currentImageIndex++;
                updateModalImage();
            }
        });
    }

    if (imageModal) {
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal) imageModal.style.display = 'none';
        });
    }
}

function handleImageUpload(event) {
    const files = event.target.files;
    if (files.length === 0) return;

    const uploadInfo = document.getElementById('uploadInfo');
    if (uploadInfo) {
        uploadInfo.style.display = 'flex';
        uploadInfo.style.justifyContent = 'center';
    }

    const uploadPromises = Array.from(files).map(file => uploadToCloudinary(file));

    Promise.all(uploadPromises)
        .then(urls => {
            const validUrls = urls.filter(Boolean);
            const savePromises = validUrls.map(url => saveImageToFirebase(url));
            return Promise.all(savePromises).then(() => validUrls.length);
        })
        .then(successCount => {
            if (uploadInfo) uploadInfo.style.display = 'none';
            event.target.value = '';
            if (successCount > 0) {
                showSuccessMessage(successCount);
            } else {
                showErrorMessage('فشل رفع جميع الصور. تحقق من إعدادات Cloudinary.');
            }
        })
        .catch(error => {
            if (uploadInfo) uploadInfo.style.display = 'none';
            showErrorMessage('حدث خطأ أثناء رفع الصور: ' + error.message);
            event.target.value = '';
        });
}

function uploadToCloudinary(file) {
    return new Promise((resolve, reject) => {
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            reject(new Error(`حجم الملف كبير جداً. الحد الأقصى هو 10MB.`));
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
        formData.append('folder', 'studio');

        fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                if (data.secure_url) {
                    resolve(data.secure_url);
                } else {
                    reject(new Error('Upload failed: ' + (data.error?.message || 'Unknown error')));
                }
            })
            .catch(reject);
    });
}

function saveImageToFirebase(imageUrl) {
    const imagesRef = db.ref('gallery/images');
    const newImageRef = imagesRef.push();
    return newImageRef.set({
        url: imageUrl,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    }).catch(error => {
        showErrorMessage('حدث خطأ في حفظ الصورة: ' + error.message);
    });
}

function loadGallery() {
    const galleryContainer = document.getElementById('galleryContainer');
    if (!galleryContainer) return;

    showSkeletons(galleryContainer, 6);

    db.ref('gallery/images').orderByChild('timestamp').once('value', (snapshot) => {
        const images = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const imageData = childSnapshot.val();
                if (imageData && imageData.url) {
                    images.push({
                        id: childSnapshot.key,
                        url: imageData.url,
                        timestamp: imageData.timestamp || 0
                    });
                }
            });
        }

        currentImages = shuffleArray(images);
        updateGalleryStats(currentImages);
        displayGallery(currentImages);
    }, (error) => {
        galleryContainer.innerHTML = `
            <div class="empty-gallery">
                <i class="fas fa-exclamation-triangle"></i>
                <p data-lang="ar">حدث خطأ في تحميل الصور: ${error.message}</p>
                <p data-lang="en" style="display: none;">Error loading images: ${error.message}</p>
            </div>
        `;
    });

    db.ref('gallery/images').on('child_added', (snapshot) => {
        const imageData = snapshot.val();
        if (!imageData || !imageData.url) return;
        const exists = currentImages.some(img => img.id === snapshot.key);
        if (!exists) {
            currentImages.unshift({ id: snapshot.key, url: imageData.url, timestamp: imageData.timestamp || 0 });
            updateGalleryStats(currentImages);
            displayGallery(currentImages);
        }
    });

    db.ref('gallery/images').on('child_removed', (snapshot) => {
        currentImages = currentImages.filter(img => img.id !== snapshot.key);
        updateGalleryStats(currentImages);
        displayGallery(currentImages);
    });
}

function showSkeletons(container, count) {
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
        const skeleton = document.createElement('div');
        skeleton.className = 'gallery-item skeleton-card';
        fragment.appendChild(skeleton);
    }
    container.appendChild(fragment);
}

function updateGalleryStats(images) {
    const statsContainer = document.getElementById('galleryStats');
    if (!statsContainer) return;

    if (images.length > 0) {
        statsContainer.style.display = 'flex';
        document.getElementById('totalImages').textContent = images.length;

        const timestamps = images.map(img => img.timestamp).filter(t => t);
        if (timestamps.length > 0) {
            const lastTimestamp = Math.max(...timestamps);
            const date = new Date(lastTimestamp);
            const currentLang = document.documentElement.getAttribute('lang') || 'ar';
            const options = { year: 'numeric', month: 'short', day: 'numeric' };
            document.getElementById('lastUpdate').textContent = date.toLocaleDateString(currentLang === 'ar' ? 'ar-SA' : 'en-US', options);
        }
    } else {
        statsContainer.style.display = 'none';
    }
}

function displayGallery(images) {
    const galleryContainer = document.getElementById('galleryContainer');
    if (!galleryContainer) return;

    if (images.length === 0) {
        galleryContainer.innerHTML = `
            <div class="empty-gallery">
                <i class="fas fa-images"></i>
                <p data-lang="ar">لا توجد صور في المعرض بعد</p>
                <p data-lang="en" style="display: none;">No images in gallery yet</p>
            </div>
        `;
        return;
    }

    const fragment = document.createDocumentFragment();

    images.forEach((image) => {
        const imageCard = document.createElement('div');
        imageCard.className = 'gallery-item scroll-reveal img-loading';

        let optimizedUrl = image.url;
        if (optimizedUrl.includes('cloudinary.com') && optimizedUrl.includes('/upload/') && !optimizedUrl.includes('f_auto,q_auto')) {
            optimizedUrl = optimizedUrl.replace('/upload/', '/upload/f_auto,q_auto,w_600/');
        }

        const date = new Date(image.timestamp || Date.now());
        const dateStr = date.toLocaleDateString('en-GB');

        imageCard.innerHTML = `
            <div class="gallery-item-inner">
                <div class="gallery-item-front">
                    <img data-src="${optimizedUrl}" src="" alt="Gallery Image" class="lazy-img">
                    ${isAdminLoggedIn ? `<button class="delete-image-btn" data-id="${image.id}"><i class="fas fa-trash"></i></button>` : ''}
                    <div class="flip-hint"><i class="fas fa-info"></i></div>
                </div>
                <div class="gallery-item-back">
                    <div class="back-content">
                        <i class="fas fa-info-circle"></i>
                        <div class="detail-row">
                            <span class="detail-label">
                                <span data-lang="ar">التاريخ:</span>
                                <span data-lang="en">Date:</span>
                            </span>
                            <span class="detail-value" style="font-family: sans-serif; direction: ltr;">${dateStr}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">
                                <span data-lang="ar">الحجم:</span>
                                <span data-lang="en">Size:</span>
                            </span>
                            <span class="image-size detail-value" style="font-family: sans-serif; direction: ltr;">...</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        imageCard.addEventListener('click', (e) => {
            if (e.target.closest('.delete-image-btn')) return;

            const isFlipped = imageCard.classList.contains('flipped');
            document.querySelectorAll('.gallery-item.flipped').forEach(card => {
                if (card !== imageCard) card.classList.remove('flipped');
            });
            imageCard.classList.toggle('flipped');

            if (!isFlipped && !imageCard.dataset.sizeLoaded) {
                const sizeEl = imageCard.querySelector('.image-size');
                fetch(optimizedUrl, { method: 'HEAD' })
                    .then(response => {
                        const size = response.headers.get('content-length');
                        if (sizeEl) sizeEl.textContent = size ? formatBytes(size) : 'Unknown';
                        imageCard.dataset.sizeLoaded = 'true';
                    })
                    .catch(() => {
                        if (sizeEl) sizeEl.textContent = 'Unknown';
                        imageCard.dataset.sizeLoaded = 'true';
                    });
            }
        });

        if (isAdminLoggedIn) {
            const deleteBtn = imageCard.querySelector('.delete-image-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm('هل أنت متأكد من حذف هذه الصورة؟')) deleteImage(image.id);
                });
            }
        }

        fragment.appendChild(imageCard);
    });

    galleryContainer.innerHTML = '';
    galleryContainer.appendChild(fragment);

    if (scrollObserver) {
        galleryContainer.querySelectorAll('.gallery-item').forEach(card => scrollObserver.observe(card));
    }
}

function showImageModal(imageUrl) {
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (imageModal && modalImage) {
        modalImage.src = imageUrl;
        imageModal.style.display = 'block';
        if (prevBtn) prevBtn.style.display = currentImageIndex > 0 ? 'block' : 'none';
        if (nextBtn) nextBtn.style.display = currentImageIndex < currentImages.length - 1 ? 'block' : 'none';
    }
}

function updateModalImage() {
    if (currentImages.length === 0) return;
    const modalImage = document.getElementById('modalImage');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (modalImage && currentImages[currentImageIndex]) {
        modalImage.src = currentImages[currentImageIndex].url;
        if (prevBtn) prevBtn.style.display = currentImageIndex > 0 ? 'block' : 'none';
        if (nextBtn) nextBtn.style.display = currentImageIndex < currentImages.length - 1 ? 'block' : 'none';
    }
}

function deleteImage(imageId) {
    db.ref(`gallery/images/${imageId}`).remove()
        .catch(error => {
            showErrorMessage('حدث خطأ أثناء حذف الصورة: ' + error.message);
        });
}

function showSuccessMessage(count) {
    const message = document.createElement('div');
    message.className = 'upload-success-message';
    const currentLang = document.documentElement.getAttribute('lang') || 'ar';
    message.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span data-lang="ar" style="display: ${currentLang === 'ar' ? 'inline' : 'none'};">تم رفع ${count} صورة بنجاح</span>
        <span data-lang="en" style="display: ${currentLang === 'en' ? 'inline' : 'none'};">Successfully uploaded ${count} image(s)</span>
    `;
    document.body.appendChild(message);
    setTimeout(() => message.classList.add('show'), 100);
    setTimeout(() => {
        message.classList.remove('show');
        setTimeout(() => message.remove(), 300);
    }, 3000);
}

function setupScrollObserver() {
    scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                const img = entry.target.querySelector('img[data-src]');
                if (img) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    img.addEventListener('load', () => {
                        img.classList.add('loaded');
                        entry.target.classList.remove('img-loading');
                    });
                    img.addEventListener('error', () => {
                        entry.target.classList.remove('img-loading');
                    });
                }
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, { root: null, rootMargin: '300px', threshold: 0.01 });
}

function showErrorMessage(message) {
    const errorMsg = document.createElement('div');
    errorMsg.className = 'upload-error-message';
    errorMsg.innerHTML = `<i class="fas fa-exclamation-circle"></i><span>${message}</span>`;
    document.body.appendChild(errorMsg);
    setTimeout(() => errorMsg.classList.add('show'), 100);
    setTimeout(() => {
        errorMsg.classList.remove('show');
        setTimeout(() => errorMsg.remove(), 300);
    }, 4000);
}

function updateFooterDate(lang = 'ar') {
    const footerDateElement = document.getElementById('currentYear');
    if (footerDateElement) {
        const today = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const formattedDate = today.toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', options);
        const madeInText = lang === 'ar' ? 'صنع في سورية' : 'Made in Syria';
        footerDateElement.innerHTML = `
            <div>Ahmad Kaddah<br>${formattedDate}</div>
            <div class="made-in-container">
                <span class="made-in-text">${madeInText}</span>
                <span class="syrian-flag"></span>
            </div>
        `;
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function initLanguageToggle() {
    const savedLang = localStorage.getItem('language') || 'ar';
    document.documentElement.setAttribute('lang', savedLang);

    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        const langSpan = langToggle.querySelector('span');
        if (langSpan) langSpan.textContent = savedLang === 'ar' ? 'EN' : 'AR';

        langToggle.addEventListener('click', () => {
            const currentLang = document.documentElement.getAttribute('lang');
            const newLang = currentLang === 'ar' ? 'en' : 'ar';
            document.documentElement.setAttribute('lang', newLang);
            localStorage.setItem('language', newLang);
            updateFooterDate(newLang);
            if (langSpan) langSpan.textContent = newLang === 'ar' ? 'EN' : 'AR';

            document.querySelectorAll('[data-lang="ar"]').forEach(el => {
                el.style.display = newLang === 'ar' ? 'block' : 'none';
            });
            document.querySelectorAll('[data-lang="en"]').forEach(el => {
                el.style.display = newLang === 'en' ? 'block' : 'none';
            });
        });
    }
}

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
