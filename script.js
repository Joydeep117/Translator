// Translation API using Google Translate (free API)
// Note: For production use, you should use Google Cloud Translation API with an API key
// This implementation uses a free alternative approach

const englishTextarea = document.getElementById('englishText');
const translatedTextarea = document.getElementById('translatedText');
const targetLanguageSelect = document.getElementById('targetLanguage');
const translateBtn = document.getElementById('translateBtn');
const copyBtn = document.getElementById('copyBtn');
const wordCountSpan = document.getElementById('wordCount');
const loadingSpan = document.getElementById('loading');

// Word count update
englishTextarea.addEventListener('input', updateWordCount);

function updateWordCount() {
    const text = englishTextarea.value.trim();
    const wordCount = text ? text.split(/\s+/).length : 0;
    wordCountSpan.textContent = `${wordCount.toLocaleString()} / 10,000 words`;
    
    if (wordCount > 10000) {
        wordCountSpan.classList.add('warning');
        wordCountSpan.textContent = `${wordCount.toLocaleString()} / 10,000 words (exceeded limit!)`;
    } else {
        wordCountSpan.classList.remove('warning');
    }
}

// Translation function using Google Translate API (free method)
async function translateText(text, targetLang) {
    // Using Google Translate free API endpoint
    const apiUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Translation failed');
        }
        
        const data = await response.json();
        
        // Extract translated text from the response
        if (data && data[0] && Array.isArray(data[0])) {
            return data[0].map(item => item[0]).join('');
        }
        
        throw new Error('Invalid response format');
    } catch (error) {
        console.error('Translation error:', error);
        throw error;
    }
}

// Alternative translation method using LibreTranslate (free and open-source)
async function translateWithLibreTranslate(text, targetLang) {
    // Using LibreTranslate public API (free, no API key required)
    const apiUrl = 'https://libretranslate.de/translate';
    
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                source: 'en',
                target: targetLang,
                format: 'text'
            })
        });
        
        if (!response.ok) {
            throw new Error('Translation failed');
        }
        
        const data = await response.json();
        return data.translatedText || '';
    } catch (error) {
        console.error('LibreTranslate error:', error);
        throw error;
    }
}

// Main translate function with fallback
async function performTranslation() {
    const text = englishTextarea.value.trim();
    
    if (!text) {
        alert('Please enter some text to translate.');
        return;
    }
    
    const wordCount = text.split(/\s+/).length;
    if (wordCount > 10000) {
        alert('Text exceeds 10,000 words. Please reduce the text length.');
        return;
    }
    
    const targetLang = targetLanguageSelect.value;
    
    // Disable button and show loading
    translateBtn.disabled = true;
    translateBtn.querySelector('span:first-child').style.display = 'none';
    loadingSpan.style.display = 'inline';
    
    try {
        // Try Google Translate first (faster, but may have rate limits)
        let translatedText;
        try {
            translatedText = await translateText(text, targetLang);
        } catch (error) {
            // Fallback to LibreTranslate
            console.log('Falling back to LibreTranslate...');
            translatedText = await translateWithLibreTranslate(text, targetLang);
        }
        
        translatedTextarea.value = translatedText;
    } catch (error) {
        alert('Translation failed. Please try again later or check your internet connection.');
        console.error('Translation error:', error);
    } finally {
        // Re-enable button and hide loading
        translateBtn.disabled = false;
        translateBtn.querySelector('span:first-child').style.display = 'inline';
        loadingSpan.style.display = 'none';
    }
}

// Translate button click
translateBtn.addEventListener('click', performTranslation);

// Copy to clipboard
copyBtn.addEventListener('click', async () => {
    const text = translatedTextarea.value;
    
    if (!text) {
        alert('No translated text to copy.');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(text);
        copyBtn.textContent = '✓ Copied!';
        setTimeout(() => {
            copyBtn.textContent = '📋 Copy';
        }, 2000);
    } catch (error) {
        // Fallback for older browsers
        translatedTextarea.select();
        document.execCommand('copy');
        copyBtn.textContent = '✓ Copied!';
        setTimeout(() => {
            copyBtn.textContent = '📋 Copy';
        }, 2000);
    }
});

// Enter key shortcut (Ctrl+Enter to translate)
englishTextarea.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        performTranslation();
    }
});

// Initialize word count
updateWordCount();

