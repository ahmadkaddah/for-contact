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

function initStudio() {
    const savedLang = localStorage.getItem('language') || 'ar';
    document.documentElement.setAttribute('lang', savedLang);
    
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
    const galleryClose = document.querySelector('.gallery-close');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

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
            if (e.key === 'Enter') {
                handleLogin();
            }
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
            console.log('تم تسجيل الخروج - تم إخفاء قسم الرفع');
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

    if (galleryClose) {
        galleryClose.addEventListener('click', () => {
            const imageModal = document.getElementById('imageModal');
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

    const imageModal = document.getElementById('imageModal');
    if (imageModal) {
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal) {
                imageModal.style.display = 'none';
            }
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

    console.log(`بدء رفع ${files.length} صورة...`);

    const uploadPromises = [];
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`رفع الصورة ${i + 1}/${files.length}: ${file.name}`);
        uploadPromises.push(uploadToCloudinary(file));
    }

    Promise.all(uploadPromises)
        .then(urls => {
            console.log('جميع الصور تم رفعها:', urls);
            let successCount = 0;
            urls.forEach((url, index) => {
                if (url) {
                    saveImageToFirebase(url);
                    successCount++;
                    console.log(`تم حفظ الصورة ${index + 1} في Firebase`);
                } else {
                    console.error(`فشل رفع الصورة ${index + 1}`);
                }
            });
            if (uploadInfo) uploadInfo.style.display = 'none';
            event.target.value = '';
            if (successCount > 0) {
                console.log(`تم رفع ${successCount} من ${files.length} صورة بنجاح`);
                showSuccessMessage(successCount);
            } else {
                showErrorMessage('فشل رفع جميع الصور. تحقق من إعدادات Cloudinary.');
            }
        })
        .catch(error => {
            console.error('Upload error:', error);
            if (uploadInfo) uploadInfo.style.display = 'none';
            showErrorMessage('حدث خطأ أثناء رفع الصور: ' + error.message);
            event.target.value = '';
        });
}

function uploadToCloudinary(file) {
    return new Promise((resolve, reject) => {
        // التحقق من حجم الملف (حد أقصى 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            reject(new Error(`حجم الملف كبير جداً. الحد الأقصى هو 10MB. حجم الملف الحالي: ${(file.size / 1024 / 1024).toFixed(2)}MB`));
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
        formData.append('folder', 'studio'); // إضافة مجلد للتنظيم

        console.log('إرسال طلب رفع إلى Cloudinary...');
        console.log('Cloud Name:', CLOUDINARY_CONFIG.cloudName);
        console.log('Upload Preset:', CLOUDINARY_CONFIG.uploadPreset);

        fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            console.log('استجابة Cloudinary:', response.status, response.statusText);
            if (!response.ok) {
                return response.text().then(text => {
                    console.error('خطأ في الاستجابة:', text);
                    throw new Error(`HTTP error! status: ${response.status}, message: ${text}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('بيانات الاستجابة من Cloudinary:', data);
            if (data.secure_url) {
                console.log('تم رفع الصورة بنجاح:', data.secure_url);
                resolve(data.secure_url);
            } else if (data.error) {
                console.error('خطأ من Cloudinary:', data.error);
                reject(new Error('Upload failed: ' + data.error.message));
            } else {
                console.error('فشل الرفع - لا يوجد secure_url:', data);
                reject(new Error('Upload failed: Unknown error - ' + JSON.stringify(data)));
            }
        })
        .catch(error => {
            console.error('خطأ في رفع الصورة إلى Cloudinary:', error);
            reject(error);
        });
    });
}

function saveImageToFirebase(imageUrl) {
    const imagesRef = db.ref('gallery/images');
    const newImageRef = imagesRef.push();
    const imageData = {
        url: imageUrl,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };
    
    newImageRef.set(imageData)
        .then(() => {
            console.log('تم حفظ الصورة في Firebase بنجاح:', imageUrl);
            console.log('المسار:', newImageRef.toString());
            // إعادة تحميل المعرض بعد الحفظ
            setTimeout(() => {
                loadGallery();
            }, 500);
        })
        .catch(error => {
            console.error('خطأ في حفظ الصورة في Firebase:', error);
            alert('حدث خطأ في حفظ الصورة: ' + error.message);
        });
}

function loadGallery() {
    const galleryContainer = document.getElementById('galleryContainer');
    if (!galleryContainer) return;

    const imagesRef = db.ref('gallery/images');
    
    console.log('جاري تحميل الصور من Firebase...');
    console.log('المسار:', imagesRef.toString());
    
    imagesRef.orderByChild('timestamp').on('value', (snapshot) => {
        console.log('بيانات من Firebase:', snapshot.val());
        const images = [];
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const imageData = childSnapshot.val();
                console.log('صورة:', childSnapshot.key, imageData);
                if (imageData && imageData.url) {
                    images.push({
                        id: childSnapshot.key,
                        url: imageData.url,
                        timestamp: imageData.timestamp || 0
                    });
                }
            });
        } else {
            console.log('لا توجد صور في Firebase');
        }
        
        console.log(`تم تحميل ${images.length} صورة من Firebase`);
        currentImages = images.reverse();
        displayGallery(currentImages);
    }, (error) => {
        console.error('خطأ في تحميل الصور من Firebase:', error);
        const galleryContainer = document.getElementById('galleryContainer');
        if (galleryContainer) {
            galleryContainer.innerHTML = `
                <div class="empty-gallery">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p data-lang="ar">حدث خطأ في تحميل الصور: ${error.message}</p>
                    <p data-lang="en" style="display: none;">Error loading images: ${error.message}</p>
                </div>
            `;
        }
    });
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

    galleryContainer.innerHTML = '';
    images.forEach((image, index) => {
        const imageCard = document.createElement('div');
        imageCard.className = 'gallery-item';
        imageCard.innerHTML = `
            <img src="${image.url}" alt="Gallery Image" loading="lazy">
            ${isAdminLoggedIn ? `<button class="delete-image-btn" data-id="${image.id}"><i class="fas fa-trash"></i></button>` : ''}
        `;
        
        const img = imageCard.querySelector('img');
        img.addEventListener('click', () => {
            currentImageIndex = index;
            showImageModal(image.url);
        });

        if (isAdminLoggedIn) {
            const deleteBtn = imageCard.querySelector('.delete-image-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (confirm('هل أنت متأكد من حذف هذه الصورة؟')) {
                        deleteImage(image.id);
                    }
                });
            }
        }

        galleryContainer.appendChild(imageCard);
    });
}

function showImageModal(imageUrl) {
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (imageModal && modalImage) {
        modalImage.src = imageUrl;
        imageModal.style.display = 'block';
        
        if (prevBtn) {
            prevBtn.style.display = currentImageIndex > 0 ? 'block' : 'none';
        }
        if (nextBtn) {
            nextBtn.style.display = currentImageIndex < currentImages.length - 1 ? 'block' : 'none';
        }
    }
}

function updateModalImage() {
    if (currentImages.length === 0) return;
    
    const modalImage = document.getElementById('modalImage');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const imageModal = document.getElementById('imageModal');

    if (modalImage && currentImages[currentImageIndex]) {
        modalImage.src = currentImages[currentImageIndex].url;
        
        if (prevBtn) {
            prevBtn.style.display = currentImageIndex > 0 ? 'block' : 'none';
        }
        if (nextBtn) {
            nextBtn.style.display = currentImageIndex < currentImages.length - 1 ? 'block' : 'none';
        }
    }
}

function deleteImage(imageId) {
    const imageRef = db.ref(`gallery/images/${imageId}`);
    imageRef.remove()
        .then(() => {
            console.log('تم حذف الصورة بنجاح');
            // إعادة تحميل المعرض بعد الحذف
            loadGallery();
        })
        .catch(error => {
            console.error('خطأ في حذف الصورة:', error);
            alert('حدث خطأ أثناء حذف الصورة: ' + error.message);
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
    
    setTimeout(() => {
        message.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        message.classList.remove('show');
        setTimeout(() => {
            message.remove();
        }, 300);
    }, 3000);
}

function showErrorMessage(message) {
    const errorMsg = document.createElement('div');
    errorMsg.className = 'upload-error-message';
    errorMsg.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(errorMsg);
    
    setTimeout(() => {
        errorMsg.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        errorMsg.classList.remove('show');
        setTimeout(() => {
            errorMsg.remove();
        }, 300);
    }, 4000);
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
    const savedLang = localStorage.getItem('language') || 'ar';
    document.documentElement.setAttribute('lang', savedLang);
    
    const langToggle = document.getElementById('langToggle');
    if (langToggle) {
        const langSpan = langToggle.querySelector('span');
        if (langSpan) {
            langSpan.textContent = savedLang === 'ar' ? 'EN' : 'AR';
        }
        
        langToggle.addEventListener('click', () => {
            const currentLang = document.documentElement.getAttribute('lang');
            const newLang = currentLang === 'ar' ? 'en' : 'ar';
            document.documentElement.setAttribute('lang', newLang);
            localStorage.setItem('language', newLang);
            updateFooterDate(newLang);
            
            if (langSpan) {
                langSpan.textContent = newLang === 'ar' ? 'EN' : 'AR';
            }
            
            // Update all data-lang elements
            document.querySelectorAll('[data-lang="ar"]').forEach(el => {
                el.style.display = newLang === 'ar' ? 'block' : 'none';
            });
            document.querySelectorAll('[data-lang="en"]').forEach(el => {
                el.style.display = newLang === 'en' ? 'block' : 'none';
            });
        });
    }
}
