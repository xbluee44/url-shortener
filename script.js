// Configuration
const API_URL = '/api/shorten';
const BASE_URL = window.location.origin;

// DOM Elements
const form = document.getElementById('urlForm');
const longUrlInput = document.getElementById('longUrl');
const resultContainer = document.getElementById('resultContainer');
const shortUrlDisplay = document.getElementById('shortUrl');
const originalUrlDisplay = document.getElementById('originalUrl');
const clickCountDisplay = document.getElementById('clickCount');
const createdAtDisplay = document.getElementById('createdAt');
const customDomainCheck = document.getElementById('customDomain');
const domainInput = document.getElementById('domainInput');
const customAliasCheck = document.getElementById('customAlias');
const aliasInput = document.getElementById('aliasInput');

// Toggle custom domain
customDomainCheck.addEventListener('change', function() {
    domainInput.style.display = this.checked ? 'inline-block' : 'none';
    domainInput.disabled = !this.checked;
});

// Toggle custom alias
customAliasCheck.addEventListener('change', function() {
    aliasInput.style.display = this.checked ? 'inline-block' : 'none';
    aliasInput.disabled = !this.checked;
});

// Handle form submission
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const longUrl = longUrlInput.value.trim();
    if (!longUrl) {
        showError('Please enter a URL');
        return;
    }
    
    // Validate URL
    try {
        new URL(longUrl);
    } catch {
        showError('Please enter a valid URL');
        return;
    }
    
    // Prepare data
    const data = {
        url: longUrl,
        customDomain: customDomainCheck.checked ? domainInput.value : null,
        customAlias: customAliasCheck.checked ? aliasInput.value : null
    };
    
    // Show loading
    const submitBtn = form.querySelector('.btn-shorten');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span class="loading"></span> Processing...';
    submitBtn.disabled = true;
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showResult(result);
        } else {
            showError(result.message || 'Failed to shorten URL');
        }
    } catch (error) {
        showError('Network error. Please try again.');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Show result
function showResult(data) {
    const shortUrl = data.shortUrl || `${BASE_URL}/${data.code}`;
    shortUrlDisplay.textContent = shortUrl;
    originalUrlDisplay.textContent = data.url;
    clickCountDisplay.textContent = data.clicks || 0;
    createdAtDisplay.textContent = new Date(data.createdAt).toLocaleString();
    
    resultContainer.style.display = 'block';
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Show error
function showError(message) {
    const existingError = document.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = `
        color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
        padding: 12px;
        border-radius: 8px;
        margin-top: 12px;
        border: 1px solid rgba(239, 68, 68, 0.2);
    `;
    errorDiv.textContent = '❌ ' + message;
    form.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Copy URL
function copyUrl() {
    const url = shortUrlDisplay.textContent;
    navigator.clipboard.writeText(url).then(() => {
        const btn = document.querySelector('.btn-copy');
        const originalText = btn.textContent;
        btn.textContent = '✅ Copied!';
        setTimeout(() => {
            btn.textContent = originalText;
        }, 2000);
    });
}

// Visit URL
function visitUrl() {
    const url = shortUrlDisplay.textContent;
    window.open(url, '_blank');
}

// Generate QR Code
function generateQR() {
    const url = shortUrlDisplay.textContent;
    const qrContainer = document.getElementById('qrContainer');
    
    if (qrContainer.style.display === 'block') {
        qrContainer.style.display = 'none';
        return;
    }
    
    qrContainer.style.display = 'block';
    
    // Simple QR Code using QRCode.js CDN
    if (typeof QRCode === 'undefined') {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
        script.onload = function() {
            qrContainer.innerHTML = '';
            new QRCode(qrContainer, {
                text: url,
                width: 200,
                height: 200,
                colorDark: '#ffffff',
                colorLight: '#0a0a0f'
            });
        };
        document.head.appendChild(script);
    } else {
        qrContainer.innerHTML = '';
        new QRCode(qrContainer, {
            text: url,
            width: 200,
            height: 200,
            colorDark: '#ffffff',
            colorLight: '#0a0a0f'
        });
    }
}

// Mobile menu toggle
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
}

// Auto-focus on page load
document.addEventListener('DOMContentLoaded', () => {
    longUrlInput.focus();
});

// Animate stats on scroll
const observerOptions = {
    threshold: 0.5
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const numbers = entry.target.querySelectorAll('.stat-number');
            numbers.forEach(num => {
                const text = num.textContent;
                const hasComma = text.includes(',');
                let target = parseInt(text.replace(/,/g, ''));
                if (!isNaN(target)) {
                    animateNumber(num, 0, target, 2000);
                }
            });
        }
    });
}, observerOptions);

const statsSection = document.querySelector('.stats');
if (statsSection) {
    observer.observe(statsSection);
}

function animateNumber(element, start, end, duration) {
    const startTime = performance.now();
    const updateNumber = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (end - start) * easeOutCubic(progress));
        element.textContent = current.toLocaleString();
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    };
    requestAnimationFrame(updateNumber);
}

function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}
