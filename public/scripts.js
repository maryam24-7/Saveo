// Language Support
const translations = {
    en: {
        title: "Video to MP3 Converter",
        subtitle: "Convert videos from multiple platforms",
        dropFiles: "Drop video file here or click to upload",
        maxSize: "Max 50MB (MP4, MOV, AVI)",
        pasteYoutubeUrl: "Paste YouTube URL here",
        pasteFacebookUrl: "Paste Facebook URL here",
        pasteInstagramUrl: "Paste Instagram URL here",
        convert: "Convert",
        converting: "Converting...",
        download: "Download MP3",
        switchToArabic: "العربية",
        invalidUrl: "Please enter a valid URL",
        youtube: "YouTube",
        facebook: "Facebook",
        instagram: "Instagram",
        file: "File"
    },
    ar: {
        title: "محول الفيديو إلى MP3",
        subtitle: "تحويل الفيديوهات من منصات متعددة",
        dropFiles: "اسحب ملف الفيديو هنا أو انقر للرفع",
        maxSize: "الحد الأقصى 50 ميجابايت (MP4, MOV, AVI)",
        pasteYoutubeUrl: "الصق رابط يوتيوب هنا",
        pasteFacebookUrl: "الصق رابط فيسبوك هنا",
        pasteInstagramUrl: "الصق رابط إنستجرام هنا",
        convert: "تحويل",
        converting: "جاري التحويل...",
        download: "تنزيل MP3",
        switchToArabic: "English",
        invalidUrl: "الرجاء إدخال رابط صحيح",
        youtube: "يوتيوب",
        facebook: "فيسبوك",
        instagram: "إنستجرام",
        file: "ملف"
    }
};

let currentLang = 'en';
const toggleLang = () => {
    currentLang = currentLang === 'en' ? 'ar' : 'en';
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.getElementById('languageToggle').textContent = 
        currentLang === 'en' ? translations.ar.switchToArabic : translations.en.switchToArabic;
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.textContent = translations[currentLang][el.getAttribute('data-i18n')];
    });
    
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        el.placeholder = translations[currentLang][el.getAttribute('data-i18n-placeholder')];
    });
};

document.getElementById('languageToggle').addEventListener('click', toggleLang);

// Tab Switching
const tabs = [
    { id: 'fileTab', section: 'fileSection' },
    { id: 'youtubeTab', section: 'youtubeSection' },
    { id: 'facebookTab', section: 'facebookSection' },
    { id: 'instagramTab', section: 'instagramSection' }
];

tabs.forEach(tab => {
    document.getElementById(tab.id).addEventListener('click', () => {
        // Hide all sections
        document.querySelectorAll('[id$="Section"]').forEach(section => {
            section.classList.add('hidden');
        });
        
        // Show selected section
        document.getElementById(tab.section).classList.remove('hidden');
        
        // Update active tab
        document.querySelectorAll('.tab-button').forEach(button => {
            button.classList.remove('active');
        });
        document.getElementById(tab.id).classList.add('active');
    });
});

// File Upload with Dropzone
Dropzone.autoDiscover = false;
const myDropzone = new Dropzone("#myDropzone", {
    url: "http://your-oracle-cloud-ip:3000/upload",
    paramName: "file",
    maxFiles: 1,
    maxFilesize: 50, // MB
    acceptedFiles: "video/*,.mp4,.mov,.avi",
    init: function() {
        this.on("success", function(file, response) {
            showDownloadLink(response.fileUrl);
        });
        this.on("uploadprogress", function(file, progress) {
            updateProgress(progress);
        });
    }
});

// Platform Conversion Functions
const platformConverters = {
    youtube: {
        buttonId: 'convertYoutubeBtn',
        urlId: 'youtubeUrl',
        endpoint: '/convert-youtube'
    },
    facebook: {
        buttonId: 'convertFacebookBtn',
        urlId: 'facebookUrl',
        endpoint: '/convert-facebook'
    },
    instagram: {
        buttonId: 'convertInstagramBtn',
        urlId: 'instagramUrl',
        endpoint: '/convert-instagram'
    }
};

Object.entries(platformConverters).forEach(([platform, config]) => {
    document.getElementById(config.buttonId).addEventListener('click', async () => {
        const url = document.getElementById(config.urlId).value.trim();
        
        if (!url) {
            alert(translations[currentLang].invalidUrl);
            return;
        }

        try {
            updateProgress(0);
            
            const response = await fetch(`http://your-oracle-cloud-ip:3000${config.endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            });

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            simulateConversionProgress(() => {
                showDownloadLink(data.fileUrl);
            });
        } catch (error) {
            alert(error.message);
            document.getElementById('progress').classList.add('hidden');
        }
    });
});

// Helper Functions
function updateProgress(percent) {
    const progress = document.getElementById('progress');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    
    progress.classList.remove('hidden');
    progressBar.style.width = `${percent}%`;
    progressText.textContent = 
        `${translations[currentLang].converting.split('...')[0]}... ${Math.round(percent)}%`;
}

function simulateConversionProgress(callback) {
    let progressValue = 0;
    const interval = setInterval(() => {
        progressValue += 5;
        updateProgress(progressValue);
        
        if (progressValue >= 100) {
            clearInterval(interval);
            callback();
        }
    }, 300);
}

function showDownloadLink(url) {
    const downloadLink = document.getElementById('download-link');
    downloadLink.href = url;
    downloadLink.classList.remove('hidden');
}

// Initialize language
toggleLang();
