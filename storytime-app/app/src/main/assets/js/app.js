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
    duration: 7,
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
    starGameMissed: 0,
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
        catchStars: "Attrape les étoiles !",
        classicStories: "Histoires classiques",
        classicStoriesSubtitle: "Sans connexion internet",
        noAudioAvailable: "Audio non disponible",
        createAIStory: "Créer avec l'IA",
        createAIStorySubtitle: "Histoire personnalisée"
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
        catchStars: "Catch the stars!",
        classicStories: "Classic Stories",
        classicStoriesSubtitle: "No internet needed",
        noAudioAvailable: "Audio not available",
        createAIStory: "Create with AI",
        createAIStorySubtitle: "Personalized story"
    }
};

// Standard stories (pre-defined, no AI needed)
const standardStories = {
    fr: [
        {
            id: 'std-fr-1',
            title: 'Le Petit Chaperon Rouge',
            text: `Il était une fois une petite fille que tout le monde aimait bien, surtout sa grand-mère. Elle lui avait donné un petit chaperon rouge, qui lui allait si bien que partout on l'appelait le Petit Chaperon Rouge.

Un jour, sa mère lui dit : "Va voir comment se porte ta grand-mère, car on m'a dit qu'elle était malade. Porte-lui une galette et ce petit pot de beurre."

Le Petit Chaperon Rouge partit aussitôt. Sa grand-mère habitait dans une autre village, au-delà de la forêt. En traversant le bois, elle rencontra le loup qui eut bien envie de la manger. Mais il n'osa pas à cause des bûcherons qui travaillaient dans la forêt.

"Où vas-tu ?" lui demanda le loup. "Je vais voir ma grand-mère et lui porter une galette avec un petit pot de beurre," répondit le Petit Chaperon Rouge.

Le loup se mit à courir de toutes ses forces par le chemin le plus court, tandis que la petite fille suivait le chemin le plus long, s'amusant à cueillir des fleurs.

Le loup arriva le premier à la maison de la grand-mère. Il frappa à la porte. "Qui est là ?" "C'est votre petite-fille," dit le loup en contrefaisant sa voix. La grand-mère lui cria : "Tire la chevillette, la bobinette cherra."

Le loup tira la chevillette et la porte s'ouvrit. Il se jeta sur la pauvre femme et la dévora. Puis il ferma la porte et alla se coucher dans le lit de la grand-mère, en attendant le Petit Chaperon Rouge.

Quelque temps après, la petite fille frappa à la porte. "Qui est là ?" Le Petit Chaperon Rouge eut peur en entendant la grosse voix du loup, mais croyant que sa grand-mère était enrhumée, elle répondit : "C'est votre petite-fille."

Le loup lui cria : "Tire la chevillette, la bobinette cherra." Le Petit Chaperon Rouge tira la chevillette et la porte s'ouvrit.

En la voyant entrer, le loup lui dit : "Pose la galette et le petit pot de beurre sur la table et viens te coucher près de moi."

Le Petit Chaperon Rouge se coucha près du loup. Elle fut bien étonnée de voir comment sa grand-mère était faite.

"Grand-mère, que vous avez de grands bras !" "C'est pour mieux t'embrasser, mon enfant." "Grand-mère, que vous avez de grandes jambes !" "C'est pour mieux courir, mon enfant." "Grand-mère, que vous avez de grandes oreilles !" "C'est pour mieux écouter, mon enfant." "Grand-mère, que vous avez de grands yeux !" "C'est pour mieux voir, mon enfant." "Grand-mère, que vous avez de grandes dents !" "C'est pour mieux te manger !"

À ces mots, le méchant loup se jeta sur le Petit Chaperon Rouge. Mais un chasseur qui passait par là entendit les cris. Il entra dans la maison et délivra la petite fille et sa grand-mère.

Et depuis ce jour, le Petit Chaperon Rouge n'alla plus jamais seule dans la forêt.`,
            duration_seconds: 240,
            category: 'classic',
            icon: '🐺'
        },
        {
            id: 'std-fr-2',
            title: 'Les Trois Petits Cochons',
            text: `Il était une fois trois petits cochons qui vivaient avec leur maman dans une petite maison. Un jour, leur maman leur dit qu'ils étaient assez grands pour partir vivre leur propre vie.

Le premier petit cochon, qui était le plus paresseux, construisit sa maison en paille. "Ce sera vite fait !" dit-il. Et en effet, en une journée, sa maison était terminée.

Le deuxième petit cochon, un peu moins paresseux, construisit sa maison en bois. "Ce sera solide et rapide," pensa-t-il. En deux jours, sa maison était prête.

Le troisième petit cochon, le plus travailleur, décida de construire sa maison en briques. "Ce sera long, mais ma maison sera très solide," dit-il. Il travailla pendant plusieurs semaines.

Un jour, le grand méchant loup arriva dans le quartier. Il avait très faim et les trois petits cochons lui semblaient délicieux.

Il s'approcha de la maison de paille du premier petit cochon. "Petit cochon, petit cochon, laisse-moi entrer !" "Non, non, par le poil de mon menton !" répondit le cochon.

"Alors je vais souffler, et ta maison s'envolera !" Le loup souffla très fort, et la maison de paille s'envola. Le premier petit cochon courut se réfugier chez son frère.

Le loup arriva devant la maison de bois. "Petits cochons, petits cochons, laissez-moi entrer !" "Non, non, par le poil de nos mentons !"

"Alors je vais souffler, et votre maison s'écroulera !" Le loup souffla de toutes ses forces, et la maison de bois s'écroula. Les deux petits cochons coururent chez leur frère.

Le loup arriva enfin devant la maison de briques. "Petits cochons, petits cochons, laissez-moi entrer !" "Non, non, par le poil de nos mentons !"

Le loup souffla, souffla encore, mais la maison de briques ne bougea pas d'un centimètre. Furieux, le loup décida de passer par la cheminée.

Mais le troisième petit cochon, très malin, avait allumé un grand feu dans la cheminée. Le loup tomba dans le feu et s'enfuit en hurlant, pour ne plus jamais revenir.

Les trois petits cochons vécurent heureux ensemble dans la solide maison de briques.`,
            duration_seconds: 210,
            category: 'classic',
            icon: '🐷'
        },
        {
            id: 'std-fr-3',
            title: 'Boucle d\'Or et les Trois Ours',
            text: `Il était une fois trois ours qui vivaient dans une jolie maison au milieu de la forêt : Papa Ours, Maman Ours et Bébé Ours.

Un matin, Maman Ours prépara de la bouillie pour le petit-déjeuner. Mais la bouillie était trop chaude ! Les trois ours décidèrent d'aller se promener dans la forêt en attendant qu'elle refroidisse.

Pendant ce temps, une petite fille aux boucles dorées, appelée Boucle d'Or, se promenait dans la forêt. Elle découvrit la maison des trois ours et, comme elle était très curieuse, elle entra.

Dans la cuisine, elle vit les trois bols de bouillie. Elle goûta d'abord celui de Papa Ours. "Aïe ! C'est trop chaud !" Puis celui de Maman Ours. "Beurk ! C'est trop froid !" Enfin celui de Bébé Ours. "Mmmm ! C'est parfait !" Et elle mangea toute la bouillie.

Dans le salon, elle vit trois chaises. Elle s'assit sur celle de Papa Ours. "Oh ! C'est trop dur !" Puis sur celle de Maman Ours. "Oh ! C'est trop mou !" Enfin sur celle de Bébé Ours. "Ah ! C'est parfait !" Mais crac ! La chaise se cassa !

Boucle d'Or monta dans la chambre et vit trois lits. Elle s'allongea sur celui de Papa Ours. "C'est trop dur !" Puis sur celui de Maman Ours. "C'est trop mou !" Enfin sur celui de Bébé Ours. "C'est parfait !" Et elle s'endormit.

Les trois ours rentrèrent de leur promenade. Papa Ours regarda son bol : "Quelqu'un a goûté ma bouillie !" Maman Ours regarda le sien : "Quelqu'un a goûté ma bouillie aussi !" Bébé Ours pleura : "Quelqu'un a mangé toute ma bouillie !"

Dans le salon, Papa Ours gronda : "Quelqu'un s'est assis sur ma chaise !" Maman Ours s'étonna : "Quelqu'un s'est assis sur ma chaise aussi !" Bébé Ours sanglota : "Quelqu'un a cassé ma chaise !"

Dans la chambre, Papa Ours grogna : "Quelqu'un s'est couché dans mon lit !" Maman Ours s'exclama : "Quelqu'un s'est couché dans mon lit aussi !" Bébé Ours cria : "Quelqu'un dort encore dans mon lit !"

Boucle d'Or se réveilla en sursaut. En voyant les trois ours, elle eut si peur qu'elle sauta par la fenêtre et courut chez elle aussi vite que possible.

Et depuis ce jour, elle ne rentra plus jamais dans une maison sans y être invitée.`,
            duration_seconds: 230,
            category: 'classic',
            icon: '🐻'
        }
    ],
    en: [
        {
            id: 'std-en-1',
            title: 'Little Red Riding Hood',
            text: `Once upon a time, there was a little girl who was loved by everyone, especially her grandmother. She had given her a red velvet hood, which suited her so well that everyone called her Little Red Riding Hood.

One day, her mother said to her: "Go see how your grandmother is doing, for I've heard she's been ill. Take her this cake and this little pot of butter."

Little Red Riding Hood set off at once. Her grandmother lived in another village, beyond the forest. As she walked through the woods, she met the wolf, who wanted very much to eat her. But he didn't dare, because of the woodcutters working nearby.

"Where are you going?" asked the wolf. "I'm going to see my grandmother and bring her a cake and a little pot of butter," replied Little Red Riding Hood.

The wolf ran as fast as he could by the shorter path, while the little girl took the longer path, stopping to pick flowers.

The wolf arrived first at the grandmother's house. He knocked on the door. "Who's there?" "It's your granddaughter," said the wolf, disguising his voice. The grandmother called out: "Pull the string and the latch will open."

The wolf pulled the string and the door opened. He threw himself on the poor woman and devoured her. Then he closed the door and got into the grandmother's bed, waiting for Little Red Riding Hood.

Some time later, the little girl knocked on the door. "Who's there?" Little Red Riding Hood was frightened by the wolf's deep voice, but thinking her grandmother had a cold, she replied: "It's your granddaughter."

The wolf called out: "Pull the string and the latch will open." Little Red Riding Hood pulled the string and the door opened.

Seeing her enter, the wolf said: "Put the cake and butter on the table and come lie down beside me."

Little Red Riding Hood lay down beside the wolf. She was very surprised to see what her grandmother looked like.

"Grandmother, what big arms you have!" "All the better to hug you, my dear." "Grandmother, what big legs you have!" "All the better to run, my dear." "Grandmother, what big ears you have!" "All the better to hear you, my dear." "Grandmother, what big eyes you have!" "All the better to see you, my dear." "Grandmother, what big teeth you have!" "All the better to eat you!"

With these words, the wicked wolf threw himself on Little Red Riding Hood. But a hunter passing by heard the screams. He entered the house and saved the little girl and her grandmother.

And from that day on, Little Red Riding Hood never walked alone in the forest again.`,
            duration_seconds: 240,
            category: 'classic',
            icon: '🐺'
        },
        {
            id: 'std-en-2',
            title: 'The Three Little Pigs',
            text: `Once upon a time, there were three little pigs who lived with their mother in a small house. One day, their mother told them they were old enough to go out and build their own homes.

The first little pig, who was the laziest, built his house of straw. "That will be quick!" he said. And indeed, in just one day, his house was finished.

The second little pig, a little less lazy, built his house of wood. "That will be sturdy and fast," he thought. In two days, his house was ready.

The third little pig, the hardest worker, decided to build his house of bricks. "It will take a long time, but my house will be very strong," he said. He worked for several weeks.

One day, the big bad wolf arrived in the neighborhood. He was very hungry, and the three little pigs looked delicious to him.

He approached the first pig's straw house. "Little pig, little pig, let me in!" "No, no, by the hair of my chinny chin chin!" replied the pig.

"Then I'll huff and I'll puff and I'll blow your house down!" The wolf huffed and puffed, and the straw house blew away. The first little pig ran to his brother's house.

The wolf arrived at the wooden house. "Little pigs, little pigs, let me in!" "No, no, by the hair of our chinny chin chins!"

"Then I'll huff and I'll puff and I'll blow your house down!" The wolf huffed and puffed with all his might, and the wooden house fell down. The two little pigs ran to their brother's house.

The wolf finally arrived at the brick house. "Little pigs, little pigs, let me in!" "No, no, by the hair of our chinny chin chins!"

The wolf huffed and puffed, huffed and puffed again, but the brick house didn't move an inch. Furious, the wolf decided to climb down the chimney.

But the third little pig, very clever, had lit a big fire in the fireplace. The wolf fell into the fire and ran away howling, never to return.

The three little pigs lived happily together in the strong brick house.`,
            duration_seconds: 210,
            category: 'classic',
            icon: '🐷'
        },
        {
            id: 'std-en-3',
            title: 'Goldilocks and the Three Bears',
            text: `Once upon a time, three bears lived in a lovely house in the middle of the forest: Father Bear, Mother Bear, and Baby Bear.

One morning, Mother Bear made porridge for breakfast. But the porridge was too hot! The three bears decided to take a walk in the forest while it cooled down.

Meanwhile, a little girl with golden curls, called Goldilocks, was walking in the forest. She discovered the three bears' house and, being very curious, she went inside.

In the kitchen, she saw three bowls of porridge. She tasted Father Bear's first. "Ouch! It's too hot!" Then Mother Bear's. "Yuck! It's too cold!" Finally Baby Bear's. "Mmm! It's just right!" And she ate all the porridge.

In the living room, she saw three chairs. She sat in Father Bear's chair. "Oh! It's too hard!" Then in Mother Bear's chair. "Oh! It's too soft!" Finally in Baby Bear's chair. "Ah! It's just right!" But crack! The chair broke!

Goldilocks went upstairs to the bedroom and saw three beds. She lay down on Father Bear's bed. "It's too hard!" Then on Mother Bear's bed. "It's too soft!" Finally on Baby Bear's bed. "It's just right!" And she fell asleep.

The three bears came home from their walk. Father Bear looked at his bowl: "Someone's been eating my porridge!" Mother Bear looked at hers: "Someone's been eating my porridge too!" Baby Bear cried: "Someone's eaten all my porridge!"

In the living room, Father Bear growled: "Someone's been sitting in my chair!" Mother Bear exclaimed: "Someone's been sitting in my chair too!" Baby Bear sobbed: "Someone's broken my chair!"

In the bedroom, Father Bear grumbled: "Someone's been sleeping in my bed!" Mother Bear cried: "Someone's been sleeping in my bed too!" Baby Bear shouted: "Someone's still sleeping in my bed!"

Goldilocks woke up with a start. When she saw the three bears, she was so frightened that she jumped out the window and ran home as fast as she could.

And from that day on, she never entered a house without being invited.`,
            duration_seconds: 230,
            category: 'classic',
            icon: '🐻'
        }
    ]
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

// Scroll to AI creation section
function scrollToCreate() {
    const section = document.getElementById('ai-creation-section');
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
            { id: 'en-US-JennyNeural', name: 'The Fairy', description: 'Warm and gentle voice', character: 'fairy', image: 'images/characters/fairy.svg' },
            { id: 'en-US-GuyNeural', name: 'The Wizard', description: 'Deep narrator voice', character: 'wizard', image: 'images/characters/wizard.svg' },
            { id: 'en-US-AnaNeural', name: 'The Little One', description: 'Young and cheerful voice', character: 'child', image: 'images/characters/child.svg' },
            { id: 'en-US-AriaNeural', name: 'The Princess', description: 'Elegant and dreamy voice', character: 'princess', image: 'images/characters/princess.svg' },
            { id: 'en-US-ChristopherNeural', name: 'The Knight', description: 'Brave and adventurous voice', character: 'knight', image: 'images/characters/knight.svg' },
            { id: 'en-US-MichelleNeural', name: 'The Grandma', description: 'Warm and comforting voice', character: 'grandma', image: 'images/characters/grandma.svg' }
        ];
    }
    return [
        { id: 'fr-FR-DeniseNeural', name: 'La Fée', description: 'Voix douce et chaleureuse', character: 'fairy', image: 'images/characters/fairy.svg' },
        { id: 'fr-FR-HenriNeural', name: 'Le Sage', description: 'Voix grave et rassurante', character: 'wizard', image: 'images/characters/wizard.svg' },
        { id: 'fr-FR-EloiseNeural', name: 'La Petite', description: 'Voix jeune et enjouée', character: 'child', image: 'images/characters/child.svg' },
        { id: 'fr-FR-BrigitteNeural', name: 'La Princesse', description: 'Voix élégante et rêveuse', character: 'princess', image: 'images/characters/princess.svg' },
        { id: 'fr-FR-AlainNeural', name: 'Le Chevalier', description: 'Voix brave et aventureuse', character: 'knight', image: 'images/characters/knight.svg' },
        { id: 'fr-FR-JacquelineNeural', name: 'Mamie', description: 'Voix chaude et réconfortante', character: 'grandma', image: 'images/characters/grandma.svg' }
    ];
}

// Update voices grid
function updateVoicesUI() {
    const grid = document.getElementById('voice-grid');
    if (!grid) return;

    grid.innerHTML = state.voices.map(voice =>
        `<div class="voice-avatar ${state.selectedVoice === voice.id ? 'active' : ''}"
             data-voice-id="${voice.id}"
             data-character="${voice.character || 'default'}"
             onclick="selectVoice('${voice.id}')">
            <img class="voice-avatar-img" src="${voice.image || 'images/characters/fairy.svg'}" alt="${voice.name}">
            <span class="voice-avatar-name">${voice.name}</span>
        </div>`
    ).join('');
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
        // Show detailed error for debugging
        showToast('Speech Error: ' + error, 'error');
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
    state.starGameMissed = 0;
    updateStarScore();

    // Spawn stars every 700ms
    state.starGameInterval = setInterval(spawnStar, 700);
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

    // Random fall duration (2.5-4 seconds)
    const duration = 2.5 + Math.random() * 1.5;
    star.style.animationDuration = duration + 's';

    // Tap handler
    star.addEventListener('click', (e) => catchStar(e, star));
    star.addEventListener('touchstart', (e) => {
        e.preventDefault();
        catchStar(e, star);
    }, { passive: false });

    gameArea.appendChild(star);

    // Remove star after animation (missed if not caught)
    setTimeout(() => {
        if (star.parentNode && !star.classList.contains('caught')) {
            state.starGameMissed++;
            updateStarScore();
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
    const caughtEl = document.getElementById('stars-caught');
    const missedEl = document.getElementById('stars-missed');
    if (caughtEl) {
        caughtEl.textContent = state.starGameScore;
    }
    if (missedEl) {
        missedEl.textContent = state.starGameMissed;
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

        // Call API with timeout (3 minutes)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 180000);

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
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorText = await response.text().catch(() => 'Unknown error');
            throw new Error(`API ${response.status}: ${errorText.substring(0, 50)}`);
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
        // Show detailed error for debugging
        let errorMsg = error.message || error.toString();
        if (error.name === 'AbortError') {
            errorMsg = 'Timeout: Server took too long (>3min)';
        } else if (errorMsg.includes('Failed to fetch') || errorMsg.includes('NetworkError')) {
            errorMsg = 'Network error: Check your connection';
        }
        showToast('Error: ' + errorMsg.substring(0, 100), 'error');
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

    // Show audio controls for AI-generated stories
    const audioPlayer = document.querySelector('.audio-player');
    if (audioPlayer) {
        audioPlayer.style.display = 'block';
    }

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
    // Show detailed error message for debugging on phone
    showToast('Audio Error: ' + error, 'error');
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
            showToast('Preview error: ' + response.status, 'error');
        }
    } catch (error) {
        console.error('Error previewing voice:', error);
        state.isPreviewPlaying = false;
        if (btn) btn.classList.remove('loading');
        showToast('Preview: ' + (error.message || 'Network error'), 'error');
    }
}

// Standard Stories Functions
function showStandardStories() {
    const modal = document.getElementById('modal-standard-stories');
    const list = document.getElementById('standard-stories-list');

    if (!modal || !list) return;

    const stories = standardStories[state.lang] || standardStories.en;

    list.innerHTML = stories.map(story => `
        <div class="standard-story-card" onclick="playStandardStory('${story.id}')">
            <span class="standard-story-icon">${story.icon}</span>
            <div class="standard-story-info">
                <div class="standard-story-title">${story.title}</div>
                <div class="standard-story-duration">${Math.round(story.duration_seconds / 60)} min</div>
            </div>
            <span class="standard-story-play">▶</span>
        </div>
    `).join('');

    modal.classList.add('active');
}

function hideStandardStories() {
    const modal = document.getElementById('modal-standard-stories');
    if (modal) {
        modal.classList.remove('active');
    }
}

function playStandardStory(storyId) {
    const stories = standardStories[state.lang] || standardStories.en;
    const story = stories.find(s => s.id === storyId);

    if (!story) return;

    hideStandardStories();

    // Set as current story (without audio_url for now)
    state.currentStory = {
        story_id: story.id,
        title: story.title,
        text: story.text,
        duration_seconds: story.duration_seconds,
        audio_url: null, // No audio for standard stories yet
        isStandard: true
    };

    // Show player in text-only mode
    showPlayerForStandardStory();
}

function showPlayerForStandardStory() {
    showPage('player');

    document.getElementById('story-title').textContent = state.currentStory.title;

    // Initialize sentences for reading
    initStorySentences(state.currentStory.text);

    // Show text by default
    state.textVisible = true;
    updateTextToggleUI();

    // Hide audio controls for standard stories (no audio)
    const audioPlayer = document.querySelector('.audio-player');
    if (audioPlayer) {
        audioPlayer.style.display = state.currentStory.isStandard ? 'none' : 'block';
    }

    // Show info that audio is not available
    if (state.currentStory.isStandard) {
        showToast(t('noAudioAvailable'), 'info');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', init);
