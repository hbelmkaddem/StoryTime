// StoryTime App - Main JavaScript

// Configuration
const CONFIG = {
    API_URL: 'http://api.onlinefitnessblog.com',
    API_KEY: 'StoryTime2024SecretKey'
};

// State
const state = {
    lang: localStorage.getItem('storytime_lang') || null,
    keywords: [],
    childNames: '',
    selectedVoice: null,
    duration: 5,
    voices: [],
    currentStory: null,
    savedStories: JSON.parse(localStorage.getItem('storytime_stories') || '[]'),
    isRecording: false,
    isPlaying: false,
    audioPosition: 0,
    audioDuration: 0,
    playbackSpeed: 1
};

// Translations
const translations = {
    fr: {
        appName: "StoryTime",
        tagline: "Des histoires magiques pour petits reveurs",
        chooseLanguage: "Choisis ta langue",
        tellMeStory: "Raconte-moi une histoire !",
        pressAndSpeak: "Appuie et parle !",
        listening: "J'ecoute...",
        whoTells: "Qui raconte l'histoire ?",
        storyDuration: "Duree de l'histoire",
        heroNames: "Prenoms des heros (optionnel)",
        heroNamesPlaceholder: "Lina, Adam...",
        createStory: "Creer mon histoire !",
        readingIdeas: "Lecture de vos idees...",
        writingStory: "Ecriture de l'histoire...",
        preparingNarration: "Preparation de la narration...",
        cancel: "Annuler",
        save: "Sauvegarder",
        newStory: "Nouvelle histoire",
        share: "Partager",
        showText: "Voir le texte",
        hideText: "Masquer le texte",
        library: "Ma bibliotheque",
        noStories: "Pas encore d'histoires ! Cree ta premiere",
        reRecord: "Re-enregistrer",
        addKeyword: "Ajouter",
        minutes: "min",
        retry: "Reessayer",
        errorMessage: "Oups ! Quelque chose s'est mal passe.",
        settings: "Parametres",
        changeLanguage: "Changer de langue",
        keywordsLabel: "Mots-cles de l'histoire",
        keywordsEmpty: "Dis ce que tu veux dans ton histoire...",
        back: "Retour",
        delete: "Supprimer",
        confirmDelete: "Supprimer cette histoire ?",
        yes: "Oui",
        no: "Non",
        addKeywordTitle: "Ajouter un mot-cle",
        saved: "Histoire sauvegardee !",
        voicePreview: "Ecouter"
    },
    en: {
        appName: "StoryTime",
        tagline: "Magical Stories for Little Dreamers",
        chooseLanguage: "Choose your language",
        tellMeStory: "Tell me a story!",
        pressAndSpeak: "Press and speak!",
        listening: "Listening...",
        whoTells: "Who tells the story?",
        storyDuration: "Story duration",
        heroNames: "Heroes' names (optional)",
        heroNamesPlaceholder: "Lina, Adam...",
        createStory: "Create my story!",
        readingIdeas: "Reading your ideas...",
        writingStory: "Writing the story...",
        preparingNarration: "Preparing the narration...",
        cancel: "Cancel",
        save: "Save",
        newStory: "New story",
        share: "Share",
        showText: "Show text",
        hideText: "Hide text",
        library: "My library",
        noStories: "No stories yet! Create your first",
        reRecord: "Re-record",
        addKeyword: "Add",
        minutes: "min",
        retry: "Retry",
        errorMessage: "Oops! Something went wrong.",
        settings: "Settings",
        changeLanguage: "Change language",
        keywordsLabel: "Story keywords",
        keywordsEmpty: "Say what you want in your story...",
        back: "Back",
        delete: "Delete",
        confirmDelete: "Delete this story?",
        yes: "Yes",
        no: "No",
        addKeywordTitle: "Add a keyword",
        saved: "Story saved!",
        voicePreview: "Listen"
    }
};

// Get translation
function t(key) {
    return translations[state.lang]?.[key] || translations.en[key] || key;
}

// Initialize app
function init() {
    if (state.lang) {
        showPage('home');
        loadVoices();
    } else {
        showPage('language');
    }
    updateUI();
}

// Show a specific page
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(`page-${pageId}`)?.classList.add('active');

    if (pageId === 'home') {
        updateHomeUI();
    } else if (pageId === 'library') {
        updateLibraryUI();
    }
}

// Select language
function selectLanguage(lang) {
    state.lang = lang;
    localStorage.setItem('storytime_lang', lang);
    loadVoices();
    showPage('home');
    updateUI();
}

// Update all UI texts
function updateUI() {
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });

    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });
}

// Update home page UI
function updateHomeUI() {
    updateUI();
    updateKeywordsUI();
    updateVoicesUI();
    updateDurationUI();
    updateGenerateButton();
}

// Load voices from API
async function loadVoices() {
    try {
        const response = await fetch(`${CONFIG.API_URL}/api/voices?lang=${state.lang}`, {
            headers: { 'X-API-Key': CONFIG.API_KEY }
        });
        const data = await response.json();
        state.voices = data.voices;

        if (state.voices.length > 0) {
            state.selectedVoice = state.voices[0].id;
        }

        updateVoicesUI();
    } catch (error) {
        console.error('Error loading voices:', error);
        // Use default voices if API fails
        state.voices = getDefaultVoices();
        state.selectedVoice = state.voices[0].id;
        updateVoicesUI();
    }
}

// Get default voices (fallback)
function getDefaultVoices() {
    if (state.lang === 'en') {
        return [
            { id: 'en-US-JennyNeural', name: 'The Fairy', description: 'Warm and gentle voice' },
            { id: 'en-US-GuyNeural', name: 'The Wizard', description: 'Deep narrator voice' },
            { id: 'en-US-AnaNeural', name: 'The Little One', description: 'Young and cheerful voice' }
        ];
    }
    return [
        { id: 'fr-FR-DeniseNeural', name: 'La Fee', description: 'Voix douce et chaleureuse' },
        { id: 'fr-FR-HenriNeural', name: 'Le Sage', description: 'Voix grave et rassurante' },
        { id: 'fr-FR-EloiseNeural', name: 'La Petite', description: 'Voix jeune et enjouee' }
    ];
}

// Update voices dropdown
function updateVoicesUI() {
    const select = document.getElementById('voice-select');
    if (!select) return;

    select.innerHTML = state.voices.map(voice =>
        `<option value="${voice.id}">${voice.name} - ${voice.description}</option>`
    ).join('');

    if (state.selectedVoice) {
        select.value = state.selectedVoice;
    }
}

// Update keywords UI
function updateKeywordsUI() {
    const container = document.getElementById('keywords-container');
    if (!container) return;

    if (state.keywords.length === 0) {
        container.innerHTML = `<span class="keywords-empty">${t('keywordsEmpty')}</span>`;
    } else {
        container.innerHTML = state.keywords.map((keyword, index) =>
            `<span class="keyword-chip">
                ${keyword}
                <span class="remove" onclick="removeKeyword(${index})">×</span>
            </span>`
        ).join('');
    }

    updateGenerateButton();
}

// Add keyword
function addKeyword(keyword) {
    const clean = keyword.trim().toLowerCase();
    if (clean && !state.keywords.includes(clean)) {
        state.keywords.push(clean);
        updateKeywordsUI();
    }
}

// Remove keyword
function removeKeyword(index) {
    state.keywords.splice(index, 1);
    updateKeywordsUI();
}

// Clear all keywords
function clearKeywords() {
    state.keywords = [];
    updateKeywordsUI();
}

// Update duration UI
function updateDurationUI() {
    document.querySelectorAll('.duration-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.duration) === state.duration);
    });
}

// Select duration
function selectDuration(duration) {
    state.duration = duration;
    updateDurationUI();
}

// Update generate button state
function updateGenerateButton() {
    const btn = document.getElementById('generate-btn');
    if (btn) {
        btn.disabled = state.keywords.length === 0;
    }
}

// Voice change handler
function onVoiceChange(voiceId) {
    state.selectedVoice = voiceId;
}

// Child names change handler
function onChildNamesChange(value) {
    state.childNames = value;
}

// Speech Recognition callbacks (called from Android)
function onSpeechStart() {
    state.isRecording = true;
    const btn = document.getElementById('record-btn');
    btn?.classList.add('recording');
    document.getElementById('record-label').textContent = t('listening');
}

function onSpeechStop() {
    state.isRecording = false;
    const btn = document.getElementById('record-btn');
    btn?.classList.remove('recording');
    document.getElementById('record-label').textContent = t('pressAndSpeak');
}

function onSpeechResults(results) {
    onSpeechStop();
    if (results && results.length > 0) {
        // Extract keywords from speech
        const text = results[0];
        const words = text.split(/[\s,]+/).filter(w => w.length > 2);
        words.forEach(word => addKeyword(word));
    }
}

function onSpeechPartial(text) {
    // Could show partial text in UI if desired
    console.log('Partial:', text);
}

function onSpeechError(error) {
    onSpeechStop();
    console.error('Speech error:', error);
    if (error !== 'no_match') {
        showToast(t('errorMessage'), 'error');
    }
}

function onAudioLevel(level) {
    // Could use for visualization
}

function onPermissionGranted() {
    // Permission granted, can now record
}

// Toggle recording
function toggleRecording() {
    if (state.isRecording) {
        Android.stopSpeechRecognition();
    } else {
        if (!Android.hasAudioPermission()) {
            Android.requestAudioPermission();
            return;
        }
        Android.startSpeechRecognition(state.lang);
    }
}

// Show add keyword modal
function showAddKeywordModal() {
    const modal = document.getElementById('modal-add-keyword');
    const input = document.getElementById('keyword-input');
    input.value = '';
    modal.classList.add('active');
    input.focus();
}

// Hide add keyword modal
function hideAddKeywordModal() {
    document.getElementById('modal-add-keyword').classList.remove('active');
}

// Confirm add keyword
function confirmAddKeyword() {
    const input = document.getElementById('keyword-input');
    if (input.value.trim()) {
        addKeyword(input.value);
    }
    hideAddKeywordModal();
}

// Generate story
async function generateStory() {
    if (state.keywords.length === 0) return;

    showPage('generating');
    updateGeneratingUI(0, t('readingIdeas'));

    try {
        // Simulate initial progress
        await sleep(1500);
        updateGeneratingUI(20, t('writingStory'));

        // Parse child names
        const childNames = state.childNames.split(',')
            .map(n => n.trim())
            .filter(n => n.length > 0);

        // Call API
        const response = await fetch(`${CONFIG.API_URL}/api/story/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': CONFIG.API_KEY
            },
            body: JSON.stringify({
                keywords: state.keywords.join(', '),
                lang: state.lang,
                voice_id: state.selectedVoice,
                duration_minutes: state.duration,
                child_names: childNames.length > 0 ? childNames : null
            })
        });

        updateGeneratingUI(70, t('preparingNarration'));

        if (!response.ok) {
            throw new Error('API error');
        }

        const story = await response.json();
        state.currentStory = story;

        updateGeneratingUI(100, t('preparingNarration'));
        await sleep(500);

        // Show player
        showPlayer();

    } catch (error) {
        console.error('Error generating story:', error);
        showToast(t('errorMessage'), 'error');
        showPage('home');
    }
}

// Update generating UI
function updateGeneratingUI(progress, text) {
    document.getElementById('generating-text').textContent = text;
    document.getElementById('progress-fill').style.width = `${progress}%`;
}

// Cancel generation
function cancelGeneration() {
    showPage('home');
}

// Show player page
function showPlayer() {
    showPage('player');

    document.getElementById('story-title').textContent = state.currentStory.title;
    document.getElementById('story-text').textContent = state.currentStory.text;

    // Start playing audio
    const audioUrl = `${CONFIG.API_URL}${state.currentStory.audio_url}`;
    Android.playAudio(audioUrl);
}

// Audio callbacks
function onAudioPlay(duration) {
    state.isPlaying = true;
    state.audioDuration = duration;
    updatePlayerUI();
}

function onAudioPause() {
    state.isPlaying = false;
    updatePlayerUI();
}

function onAudioResume() {
    state.isPlaying = true;
    updatePlayerUI();
}

function onAudioStop() {
    state.isPlaying = false;
    state.audioPosition = 0;
    updatePlayerUI();
}

function onAudioComplete() {
    state.isPlaying = false;
    state.audioPosition = state.audioDuration;
    updatePlayerUI();
}

function onAudioProgress(position, duration) {
    state.audioPosition = position;
    state.audioDuration = duration;
    updateProgressUI();
}

function onAudioError(error) {
    console.error('Audio error:', error);
    showToast(t('errorMessage'), 'error');
}

// Update player UI
function updatePlayerUI() {
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
        playBtn.innerHTML = state.isPlaying ? '⏸' : '▶';
    }
    updateProgressUI();
}

// Update progress UI
function updateProgressUI() {
    const progress = state.audioDuration > 0 ? (state.audioPosition / state.audioDuration) * 100 : 0;
    document.getElementById('audio-progress-fill').style.width = `${progress}%`;
    document.getElementById('audio-time-current').textContent = formatTime(state.audioPosition);
    document.getElementById('audio-time-total').textContent = formatTime(state.audioDuration);
}

// Format time in mm:ss
function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Toggle play/pause
function togglePlay() {
    if (state.isPlaying) {
        Android.pauseAudio();
    } else {
        Android.resumeAudio();
    }
}

// Seek audio
function seekAudio(seconds) {
    const newPosition = Math.max(0, Math.min(state.audioDuration, state.audioPosition + seconds * 1000));
    Android.seekAudio(newPosition);
}

// Seek to position
function seekToPosition(event) {
    const bar = event.currentTarget;
    const rect = bar.getBoundingClientRect();
    const percent = (event.clientX - rect.left) / rect.width;
    const position = Math.floor(state.audioDuration * percent);
    Android.seekAudio(position);
}

// Set playback speed
function setSpeed(speed) {
    state.playbackSpeed = speed;
    document.querySelectorAll('.speed-btn').forEach(btn => {
        btn.classList.toggle('active', parseFloat(btn.dataset.speed) === speed);
    });
    // Note: Native MediaPlayer speed control would require additional implementation
}

// Toggle story text visibility
function toggleText() {
    const container = document.getElementById('story-text-container');
    const btn = document.getElementById('text-toggle-btn');

    if (container.style.display === 'none') {
        container.style.display = 'block';
        btn.textContent = t('hideText');
    } else {
        container.style.display = 'none';
        btn.textContent = t('showText');
    }
}

// Save story
function saveStory() {
    if (!state.currentStory) return;

    const story = {
        ...state.currentStory,
        savedAt: new Date().toISOString(),
        voice: state.selectedVoice,
        lang: state.lang
    };

    state.savedStories.unshift(story);
    localStorage.setItem('storytime_stories', JSON.stringify(state.savedStories));

    showToast(t('saved'), 'success');
}

// Share story
function shareStory() {
    if (!state.currentStory) return;

    const text = `${state.currentStory.title}\n\n${state.currentStory.text}`;
    Android.shareText(text);
}

// New story
function newStory() {
    Android.stopAudio();
    state.currentStory = null;
    state.keywords = [];
    state.childNames = '';
    showPage('home');
}

// Show library
function showLibrary() {
    showPage('library');
}

// Update library UI
function updateLibraryUI() {
    updateUI();
    const list = document.getElementById('library-list');

    if (state.savedStories.length === 0) {
        list.innerHTML = `
            <div class="library-empty">
                <div class="library-empty-icon">📚</div>
                <p>${t('noStories')} ✨</p>
            </div>
        `;
    } else {
        list.innerHTML = state.savedStories.map((story, index) => {
            const date = new Date(story.savedAt).toLocaleDateString();
            const duration = Math.round(story.duration_seconds / 60);
            return `
                <div class="story-card">
                    <div class="story-card-icon">📖</div>
                    <div class="story-card-info">
                        <div class="story-card-title">${story.title}</div>
                        <div class="story-card-meta">${date} • ${duration} ${t('minutes')}</div>
                    </div>
                    <div class="story-card-actions">
                        <button class="story-card-btn" onclick="playLibraryStory(${index})">▶</button>
                        <button class="story-card-btn delete" onclick="deleteStory(${index})">🗑</button>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// Play story from library
function playLibraryStory(index) {
    state.currentStory = state.savedStories[index];
    showPlayer();
}

// Delete story
function deleteStory(index) {
    if (confirm(t('confirmDelete'))) {
        state.savedStories.splice(index, 1);
        localStorage.setItem('storytime_stories', JSON.stringify(state.savedStories));
        updateLibraryUI();
    }
}

// Show settings
function showSettings() {
    // Simple language change
    const newLang = state.lang === 'fr' ? 'en' : 'fr';
    selectLanguage(newLang);
}

// Show toast
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast active ${type}`;

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// Utility: sleep
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Utility: go back
function goBack() {
    showPage('home');
}

// Preview voice
async function previewVoice() {
    if (!state.selectedVoice) return;

    try {
        const response = await fetch(`${CONFIG.API_URL}/api/voices/preview`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-Key': CONFIG.API_KEY
            },
            body: JSON.stringify({
                voice_id: state.selectedVoice,
                lang: state.lang
            })
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audio.play();
        }
    } catch (error) {
        console.error('Error previewing voice:', error);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
