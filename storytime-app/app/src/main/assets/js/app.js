// StoryTime App - Main JavaScript

// Configuration
const CONFIG = {
    API_URL: 'http://api.onlinefitnessblog.com',
    API_KEY: 'StoryTime2024SecretKey'
};

// State
const state = {
    lang: localStorage.getItem('storytime_lang') || null,
    gender: localStorage.getItem('storytime_gender') || null,
    age: parseInt(localStorage.getItem('storytime_age')) || 6,
    isSetupDone: localStorage.getItem('storytime_setup_done') === 'true',
    isOnboardingDone: localStorage.getItem('storytime_onboarding_done') === 'true',
    currentOnboardingSlide: 1,
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
    playbackSpeed: 1,
    previewAudio: null,
    isPreviewPlaying: false,
    isEditMode: false,
    storySentences: [],
    currentSentenceIndex: 0,
    textVisible: true,
    starGameScore: 0,
    starGameInterval: null
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
        alreadySaved: "Histoire deja sauvegardee",
        voicePreview: "Ecouter",
        setupTitle: "Parametres",
        setupSubtitle: "Personnalise tes histoires",
        storyFor: "Histoire pour :",
        boy: "Garcon",
        girl: "Fille",
        childAge: "Age de l'enfant :",
        years: "ans",
        storyLanguage: "Langue des histoires :",
        letsGo: "C'est parti !",
        shareTitle: "Partager l'histoire",
        shareAsText: "Texte",
        shareAsAudio: "Audio",
        preparingShare: "Preparation du partage...",
        patienceMessage: "Merci de patienter, ne quittez pas cette page...",
        stepWriting: "Ecriture de l'histoire...",
        stepAudio: "Generation de l'audio...",
        stepComplete: "Termine !",
        skip: "Passer",
        next: "Suivant",
        start: "Commencer",
        onboarding1Title: "Bienvenue sur StoryTime !",
        onboarding1Text: "Des histoires magiques personnalisées pour votre enfant, générées en quelques secondes.",
        onboarding2Title: "Parle, et la magie opère !",
        onboarding2Text: "Dis simplement ce que tu veux dans ton histoire : dragons, princesses, pirates... L'IA crée une aventure unique !",
        onboarding3Title: "Écoute et rêve",
        onboarding3Text: "Choisis la voix du narrateur et la durée. Parfait pour le coucher ou les longs trajets !",
        catchStars: "Attrape les étoiles !"
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
        alreadySaved: "Story already saved",
        voicePreview: "Listen",
        setupTitle: "Settings",
        setupSubtitle: "Customize your stories",
        storyFor: "Story for:",
        boy: "Boy",
        girl: "Girl",
        childAge: "Child's age:",
        years: "years",
        storyLanguage: "Story language:",
        letsGo: "Let's go!",
        shareTitle: "Share the story",
        shareAsText: "Text",
        shareAsAudio: "Audio",
        preparingShare: "Preparing share...",
        patienceMessage: "Please wait, do not leave this page...",
        stepWriting: "Writing the story...",
        stepAudio: "Generating audio...",
        stepComplete: "Complete!",
        skip: "Skip",
        next: "Next",
        start: "Start",
        onboarding1Title: "Welcome to StoryTime!",
        onboarding1Text: "Personalized magical stories for your child, generated in seconds.",
        onboarding2Title: "Speak, and the magic happens!",
        onboarding2Text: "Just say what you want in your story: dragons, princesses, pirates... AI creates a unique adventure!",
        onboarding3Title: "Listen and dream",
        onboarding3Text: "Choose the narrator's voice and duration. Perfect for bedtime or long trips!",
        catchStars: "Catch the stars!"
    }
};

// Fun facts shown during generation
const funFacts = {
    fr: [
        "Saviez-vous que les enfants qui ecoutent des histoires developpent un vocabulaire plus riche ?",
        "Les contes de fees existent depuis plus de 4000 ans !",
        "Lire une histoire avant de dormir ameliore la qualite du sommeil.",
        "Les histoires aident les enfants a developper leur empathie.",
        "Le premier livre pour enfants date de 1658 !",
        "Les histoires stimulent l'imagination et la creativite.",
        "Ecouter des histoires renforce le lien parent-enfant.",
        "Les enfants retiennent mieux les informations sous forme d'histoire."
    ],
    en: [
        "Did you know? Children who listen to stories develop a richer vocabulary!",
        "Fairy tales have existed for over 4000 years!",
        "Reading a story before bed improves sleep quality.",
        "Stories help children develop empathy.",
        "The first children's book dates back to 1658!",
        "Stories stimulate imagination and creativity.",
        "Listening to stories strengthens the parent-child bond.",
        "Children remember information better when it's in story form."
    ]
};

let funFactInterval = null;

// Get translation
function t(key) {
    return translations[state.lang]?.[key] || translations.en[key] || key;
}

// Initialize app
function init() {
    // Check if onboarding is done
    if (!state.isOnboardingDone) {
        showPage('onboarding');
        return;
    }

    if (state.lang && state.isSetupDone) {
        showPage('home');
        loadVoices();
        updateLangButton();
    } else if (state.lang && !state.isSetupDone) {
        showPage('setup');
        initSetupPage();
    } else {
        showPage('language');
    }
    updateUI();
}

// Onboarding functions
function nextOnboardingSlide() {
    if (state.currentOnboardingSlide < 3) {
        state.currentOnboardingSlide++;
        updateOnboardingUI();
    } else {
        completeOnboarding();
    }
}

function skipOnboarding() {
    completeOnboarding();
}

function goToOnboardingSlide(slideNum) {
    state.currentOnboardingSlide = slideNum;
    updateOnboardingUI();
}

function updateOnboardingUI() {
    // Update slides
    document.querySelectorAll('.onboarding-slide').forEach(slide => {
        slide.classList.remove('active');
        if (parseInt(slide.dataset.slide) === state.currentOnboardingSlide) {
            slide.classList.add('active');
        }
    });

    // Update dots
    document.querySelectorAll('.onboarding-dots .dot').forEach(dot => {
        dot.classList.remove('active');
        if (parseInt(dot.dataset.dot) === state.currentOnboardingSlide) {
            dot.classList.add('active');
        }
    });

    // Update button text on last slide
    const nextBtn = document.querySelector('.onboarding-next');
    if (nextBtn) {
        if (state.currentOnboardingSlide === 3) {
            nextBtn.textContent = t('start') || 'Commencer';
        } else {
            nextBtn.textContent = t('next') || 'Suivant';
        }
    }
}

function completeOnboarding() {
    state.isOnboardingDone = true;
    localStorage.setItem('storytime_onboarding_done', 'true');
    showPage('language');
}

// First time language selection (goes to setup)
function selectLanguageFirst(lang) {
    state.lang = lang;
    localStorage.setItem('storytime_lang', lang);
    showPage('setup');
    initSetupPage();
    updateUI();
}

// Initialize setup page
function initSetupPage() {
    // Set default gender if not set
    if (!state.gender) {
        state.gender = 'boy';
    }
    updateGenderUI();
    updateAgeUI();
    updateSetupLanguageUI();

    // Show/hide back row based on edit mode
    const backRow = document.getElementById('setup-back-row');
    if (backRow) {
        backRow.style.display = state.isEditMode ? 'block' : 'none';
    }
}

// Show settings page from home (edit mode)
function showSettingsPage() {
    state.isEditMode = true;
    showPage('setup');
    initSetupPage();
}

// Cancel settings and go back to home
function cancelSettings() {
    state.isEditMode = false;
    showPage('home');
}

// Select gender
function selectGender(gender) {
    state.gender = gender;
    updateGenderUI();
}

// Update gender UI
function updateGenderUI() {
    document.querySelectorAll('.gender-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.gender === state.gender);
    });
}

// Change age
function changeAge(delta) {
    state.age = Math.max(3, Math.min(14, state.age + delta));
    updateAgeUI();
}

// Update age UI
function updateAgeUI() {
    const display = document.getElementById('age-display');
    if (display) {
        display.innerHTML = `${state.age} <span data-i18n="years">${t('years')}</span>`;
    }
}

// Select setup language
function selectSetupLanguage(lang) {
    state.lang = lang;
    localStorage.setItem('storytime_lang', lang);
    updateSetupLanguageUI();
    updateUI();
}

// Update setup language UI
function updateSetupLanguageUI() {
    document.getElementById('setup-lang-fr')?.classList.toggle('active', state.lang === 'fr');
    document.getElementById('setup-lang-en')?.classList.toggle('active', state.lang === 'en');
}

// Confirm setup and go to home
function confirmSetup() {
    // Save settings
    localStorage.setItem('storytime_gender', state.gender);
    localStorage.setItem('storytime_age', state.age);
    localStorage.setItem('storytime_setup_done', 'true');
    state.isSetupDone = true;

    // Always reload voices (language may have changed)
    loadVoices();

    // If edit mode, just go back to home
    if (state.isEditMode) {
        state.isEditMode = false;
        showPage('home');
        return;
    }

    // First time setup - load voices and go to home
    loadVoices();
    showPage('home');
    updateLangButton();
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
    updateLangButton();
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
            { id: 'en-US-JennyNeural', name: 'The Fairy', description: 'Warm and gentle voice', avatar: '🧚' },
            { id: 'en-US-GuyNeural', name: 'The Wizard', description: 'Deep narrator voice', avatar: '🧙' },
            { id: 'en-US-AnaNeural', name: 'The Little One', description: 'Young and cheerful voice', avatar: '👧' },
            { id: 'en-US-AriaNeural', name: 'The Princess', description: 'Elegant and dreamy voice', avatar: '👸' },
            { id: 'en-US-ChristopherNeural', name: 'The Knight', description: 'Brave and adventurous voice', avatar: '🤴' },
            { id: 'en-US-MichelleNeural', name: 'The Grandma', description: 'Warm and comforting voice', avatar: '👵' }
        ];
    }
    return [
        { id: 'fr-FR-DeniseNeural', name: 'La Fée', description: 'Voix douce et chaleureuse', avatar: '🧚' },
        { id: 'fr-FR-HenriNeural', name: 'Le Sage', description: 'Voix grave et rassurante', avatar: '🧙' },
        { id: 'fr-FR-EloiseNeural', name: 'La Petite', description: 'Voix jeune et enjouée', avatar: '👧' },
        { id: 'fr-FR-BrigitteNeural', name: 'La Princesse', description: 'Voix élégante et rêveuse', avatar: '👸' },
        { id: 'fr-FR-AlainNeural', name: 'Le Chevalier', description: 'Voix brave et aventureuse', avatar: '🤴' },
        { id: 'fr-FR-JacquelineNeural', name: 'Mamie', description: 'Voix chaude et réconfortante', avatar: '👵' }
    ];
}

// Update voices grid
function updateVoicesUI() {
    const grid = document.getElementById('voice-grid');
    if (!grid) return;

    grid.innerHTML = state.voices.map(voice =>
        `<div class="voice-avatar ${state.selectedVoice === voice.id ? 'active' : ''}"
             data-voice-id="${voice.id}"
             onclick="selectVoice('${voice.id}')">
            <span class="voice-avatar-emoji">${voice.avatar || '🎤'}</span>
            <span class="voice-avatar-name">${voice.name}</span>
        </div>`
    ).join('');

    // Update voice info
    updateVoiceInfo();
}

// Select voice
function selectVoice(voiceId) {
    state.selectedVoice = voiceId;

    // Update avatar selection UI
    document.querySelectorAll('.voice-avatar').forEach(avatar => {
        avatar.classList.remove('active');
        if (avatar.dataset.voiceId === voiceId) {
            avatar.classList.add('active');
        }
    });

    // Update voice info
    updateVoiceInfo();
}

// Update voice info display
function updateVoiceInfo() {
    const voice = state.voices.find(v => v.id === state.selectedVoice);
    const nameEl = document.getElementById('voice-name');
    const descEl = document.getElementById('voice-desc');

    if (voice && nameEl && descEl) {
        nameEl.textContent = voice.name;
        descEl.textContent = voice.description;
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

// Voice change handler (for backwards compatibility)
function onVoiceChange(voiceId) {
    selectVoice(voiceId);
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

// Start fun facts rotation
function startFunFacts() {
    const facts = funFacts[state.lang] || funFacts.en;
    let currentIndex = Math.floor(Math.random() * facts.length);

    const factEl = document.getElementById('fun-fact');
    if (factEl) {
        factEl.textContent = facts[currentIndex];
    }

    funFactInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % facts.length;
        if (factEl) {
            factEl.style.opacity = '0';
            setTimeout(() => {
                factEl.textContent = facts[currentIndex];
                factEl.style.opacity = '0.9';
            }, 300);
        }
    }, 5000);
}

// Stop fun facts rotation
function stopFunFacts() {
    if (funFactInterval) {
        clearInterval(funFactInterval);
        funFactInterval = null;
    }
}

// Star Game Functions
function startStarGame() {
    state.starGameScore = 0;
    updateStarScore();

    // Spawn stars every 800ms
    state.starGameInterval = setInterval(spawnStar, 800);
}

function stopStarGame() {
    if (state.starGameInterval) {
        clearInterval(state.starGameInterval);
        state.starGameInterval = null;
    }
    // Clear game area
    const gameArea = document.getElementById('star-game-area');
    if (gameArea) {
        gameArea.innerHTML = '';
    }
}

function spawnStar() {
    const gameArea = document.getElementById('star-game-area');
    if (!gameArea) return;

    const star = document.createElement('span');
    star.className = 'game-star';

    // Random star emoji
    const stars = ['⭐', '🌟', '✨', '💫'];
    star.textContent = stars[Math.floor(Math.random() * stars.length)];

    // Random horizontal position
    const maxX = gameArea.offsetWidth - 40;
    const randomX = Math.floor(Math.random() * maxX);
    star.style.left = randomX + 'px';

    // Random fall duration (2-4 seconds)
    const duration = 2 + Math.random() * 2;
    star.style.animationDuration = duration + 's';

    // Tap handler
    star.addEventListener('click', (e) => catchStar(e, star));
    star.addEventListener('touchstart', (e) => {
        e.preventDefault();
        catchStar(e, star);
    }, { passive: false });

    gameArea.appendChild(star);

    // Remove star after animation
    setTimeout(() => {
        if (star.parentNode) {
            star.remove();
        }
    }, duration * 1000);
}

function catchStar(event, star) {
    if (star.classList.contains('caught')) return;

    star.classList.add('caught');
    state.starGameScore++;
    updateStarScore();

    // Create burst effect
    createStarBurst(star);

    // Remove star after catch animation
    setTimeout(() => star.remove(), 300);
}

function createStarBurst(star) {
    const gameArea = document.getElementById('star-game-area');
    if (!gameArea) return;

    const rect = star.getBoundingClientRect();
    const areaRect = gameArea.getBoundingClientRect();
    const x = rect.left - areaRect.left + rect.width / 2;
    const y = rect.top - areaRect.top + rect.height / 2;

    const particles = ['✨', '⭐', '💫'];
    for (let i = 0; i < 5; i++) {
        const particle = document.createElement('span');
        particle.className = 'star-burst';
        particle.textContent = particles[Math.floor(Math.random() * particles.length)];
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';

        // Random direction
        const angle = (Math.PI * 2 / 5) * i;
        const distance = 30 + Math.random() * 20;
        particle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
        particle.style.setProperty('--ty', Math.sin(angle) * distance + 'px');

        gameArea.appendChild(particle);
        setTimeout(() => particle.remove(), 500);
    }
}

function updateStarScore() {
    const scoreEl = document.getElementById('star-score');
    if (scoreEl) {
        scoreEl.textContent = `⭐ ${state.starGameScore}`;
    }
}

// Update step UI
function updateStepUI(stepNumber, status) {
    const step = document.getElementById(`step-${stepNumber}`);
    if (!step) return;

    step.classList.remove('pending', 'active', 'completed');
    step.classList.add(status);

    const icon = step.querySelector('.step-icon');
    if (icon) {
        if (status === 'completed') {
            icon.textContent = '✓';
        } else if (status === 'active') {
            icon.textContent = '⏳';
        } else {
            icon.textContent = '○';
        }
    }
}

// Reset steps for new generation
function resetStepsUI() {
    updateStepUI(1, 'active');
    updateStepUI(2, 'pending');
}

// Generate story
async function generateStory() {
    if (state.keywords.length === 0) return;

    showPage('generating');
    resetStepsUI();
    updateGeneratingUI(0, '');
    startStarGame();

    try {
        // Step 1: Writing story (active)
        updateStepUI(1, 'active');
        updateGeneratingUI(10, '');

        // Parse child names
        const childNames = state.childNames.split(',')
            .map(n => n.trim())
            .filter(n => n.length > 0);

        // Call API (this does both story + audio generation)
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
                child_names: childNames.length > 0 ? childNames : null,
                gender: state.gender,
                age: state.age
            })
        });

        if (!response.ok) {
            throw new Error('API error');
        }

        // Step 1 complete, Step 2 starting (API does both, but we show progress)
        updateStepUI(1, 'completed');
        updateStepUI(2, 'active');
        updateGeneratingUI(70, '');

        const story = await response.json();
        state.currentStory = story;

        // Both steps complete
        updateStepUI(2, 'completed');
        updateGeneratingUI(100, '');
        await sleep(500);

        stopStarGame();
        // Show player
        showPlayer();

    } catch (error) {
        console.error('Error generating story:', error);
        stopStarGame();
        showToast(t('errorMessage'), 'error');
        showPage('home');
    }
}

// Update generating UI
function updateGeneratingUI(progress, text) {
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
        progressFill.style.width = `${progress}%`;
    }
}

// Cancel generation
function cancelGeneration() {
    stopStarGame();
    showPage('home');
}

// Show player page
function showPlayer() {
    showPage('player');

    document.getElementById('story-title').textContent = state.currentStory.title;

    // Split text into sentences for karaoke effect
    initStorySentences(state.currentStory.text);

    // Reset text visibility
    state.textVisible = true;
    updateTextToggleUI();

    // Start playing audio
    const audioUrl = `${CONFIG.API_URL}${state.currentStory.audio_url}`;
    Android.playAudio(audioUrl);
}

// Initialize story sentences for karaoke effect
function initStorySentences(text) {
    // Split by sentence-ending punctuation, keeping the punctuation
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    state.storySentences = sentences.map(s => s.trim()).filter(s => s.length > 0);
    state.currentSentenceIndex = 0;

    // Render sentences as spans
    const container = document.getElementById('story-text');
    container.innerHTML = state.storySentences.map((sentence, index) =>
        `<span class="story-sentence" data-index="${index}">${sentence} </span>`
    ).join('');

    // Highlight first sentence
    updateSentenceHighlight();
}

// Update sentence highlight based on audio position
function updateSentenceHighlight() {
    document.querySelectorAll('.story-sentence').forEach((el, index) => {
        el.classList.remove('active', 'past');
        if (index < state.currentSentenceIndex) {
            el.classList.add('past');
        } else if (index === state.currentSentenceIndex) {
            el.classList.add('active');
            // Auto-scroll to active sentence
            scrollToActiveSentence(el);
        }
    });
}

// Scroll to keep active sentence visible
function scrollToActiveSentence(element) {
    const container = document.getElementById('story-text-container');
    if (!container || !element) return;

    const containerRect = container.getBoundingClientRect();
    const elementRect = element.getBoundingClientRect();

    // Check if element is outside visible area
    if (elementRect.top < containerRect.top || elementRect.bottom > containerRect.bottom) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Calculate current sentence based on audio position
function calculateCurrentSentence(position, duration) {
    if (duration <= 0 || state.storySentences.length === 0) return;

    // Estimate: each sentence takes roughly equal time
    const progress = position / duration;
    const estimatedIndex = Math.floor(progress * state.storySentences.length);
    const newIndex = Math.min(estimatedIndex, state.storySentences.length - 1);

    if (newIndex !== state.currentSentenceIndex) {
        state.currentSentenceIndex = newIndex;
        updateSentenceHighlight();
    }
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
    // Update sentence highlight for karaoke effect
    calculateCurrentSentence(position, duration);
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
    state.textVisible = !state.textVisible;
    updateTextToggleUI();
}

// Update text toggle button and container visibility
function updateTextToggleUI() {
    const container = document.getElementById('story-text-container');
    const btn = document.getElementById('text-toggle-btn');

    if (state.textVisible) {
        container.classList.remove('collapsed');
        btn.textContent = t('hideText');
    } else {
        container.classList.add('collapsed');
        btn.textContent = t('showText');
    }
}

// Save story
function saveStory() {
    if (!state.currentStory) return;

    // Check if story already exists (by story_id)
    const exists = state.savedStories.some(s => s.story_id === state.currentStory.story_id);
    if (exists) {
        showToast(t('alreadySaved'), 'info');
        return;
    }

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

// Share story - show options modal
function shareStory() {
    if (!state.currentStory) return;
    showShareModal();
}

// Show share modal with options
function showShareModal() {
    const modal = document.getElementById('modal-share');
    if (modal) {
        modal.classList.add('active');
    }
}

// Hide share modal
function hideShareModal() {
    const modal = document.getElementById('modal-share');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Share story as text
function shareAsText() {
    hideShareModal();
    if (!state.currentStory) return;
    const text = `${state.currentStory.title}\n\n${state.currentStory.text}`;
    Android.shareText(text);
}

// Share story as audio
function shareAsAudio() {
    hideShareModal();
    if (!state.currentStory) return;
    const audioUrl = `${CONFIG.API_URL}${state.currentStory.audio_url}`;
    Android.shareAudio(audioUrl, state.currentStory.title);
    showToast(t('preparingShare'), 'info');
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

// Toggle language with flag
function toggleLanguage() {
    const newLang = state.lang === 'fr' ? 'en' : 'fr';
    selectLanguage(newLang);
    updateLangButton();
}

// Update language toggle button flag
function updateLangButton() {
    const btn = document.getElementById('lang-toggle-btn');
    if (btn) {
        // Show flag of OTHER language (to switch to)
        btn.textContent = state.lang === 'fr' ? '🇬🇧' : '🇫🇷';
    }
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

    const btn = document.getElementById('preview-btn');

    // If already playing, stop it
    if (state.previewAudio) {
        state.previewAudio.pause();
        state.previewAudio = null;
        state.isPreviewPlaying = false;
        if (btn) btn.classList.remove('playing');
        return;
    }

    // Prevent double-click during loading
    if (state.isPreviewPlaying) return;
    state.isPreviewPlaying = true;
    if (btn) btn.classList.add('loading');

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
            state.previewAudio = new Audio(url);

            state.previewAudio.onended = () => {
                state.previewAudio = null;
                state.isPreviewPlaying = false;
                if (btn) {
                    btn.classList.remove('playing');
                    btn.classList.remove('loading');
                }
            };

            state.previewAudio.onerror = () => {
                state.previewAudio = null;
                state.isPreviewPlaying = false;
                if (btn) {
                    btn.classList.remove('playing');
                    btn.classList.remove('loading');
                }
            };

            if (btn) {
                btn.classList.remove('loading');
                btn.classList.add('playing');
            }
            state.previewAudio.play();
        } else {
            state.isPreviewPlaying = false;
            if (btn) btn.classList.remove('loading');
        }
    } catch (error) {
        console.error('Error previewing voice:', error);
        state.isPreviewPlaying = false;
        if (btn) btn.classList.remove('loading');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
