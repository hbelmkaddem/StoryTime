# StoryTime App — Spécification Technique Complète pour Claude Code

## 🎯 OBJECTIF

Créer une application mobile Android "StoryTime" qui génère des histoires audio personnalisées pour enfants. L'app enregistre la voix des enfants, extrait leurs idées, génère une histoire avec l'IA, puis la lit avec une voix naturelle.

Le projet a **2 parties** :
1. **Backend API** (Python FastAPI) déployé sur un VPS Hostinger
2. **Application mobile Android** (React Native / Expo)

---

## PARTIE 1 : BACKEND API (Python FastAPI)

### 1.1 Hébergement

- **VPS** : Hostinger — `srv1046609.hstgr.cloud`
- Le backend sera déployé avec Docker sur ce VPS
- Port exposé : `8000` (FastAPI) + `5050` (Edge TTS)

### 1.2 Architecture du backend

```
/storytime-backend/
├── docker-compose.yml          # Orchestre les 2 services
├── app/
│   ├── main.py                 # FastAPI app principale
│   ├── routers/
│   │   ├── story.py            # Endpoint génération d'histoire
│   │   ├── tts.py              # Endpoint text-to-speech
│   │   └── voices.py           # Endpoint liste des voix
│   ├── services/
│   │   ├── gemini_service.py   # Client API Gemini
│   │   ├── tts_service.py      # Client Edge TTS
│   │   └── prompt_service.py   # Gestion des prompts FR/EN
│   ├── models/
│   │   └── schemas.py          # Pydantic models
│   ├── config.py               # Configuration / env vars
│   └── prompts/
│       ├── story_fr.txt        # Prompt français
│       └── story_en.txt        # Prompt anglais
├── requirements.txt
├── Dockerfile
└── .env
```

### 1.3 Docker Compose

Le backend utilise 2 containers :
1. **storytime-api** : FastAPI (notre code)
2. **edge-tts-service** : openai-edge-tts (Docker image `travisvn/openai-edge-tts`)

```yaml
# docker-compose.yml
version: '3.8'
services:
  edge-tts:
    image: travisvn/openai-edge-tts:latest
    ports:
      - "5050:5050"
    environment:
      - PORT=5050
    restart: always

  storytime-api:
    build: .
    ports:
      - "8000:8000"
    env_file:
      - .env
    depends_on:
      - edge-tts
    restart: always
```

### 1.4 Variables d'environnement (.env)

```
GEMINI_API_KEY=<clé API Google AI Studio>
EDGE_TTS_URL=http://edge-tts:5050
DEFAULT_STORY_DURATION=5
MAX_STORY_DURATION=15
API_SECRET_KEY=<clé secrète pour authentifier l'app mobile>
```

### 1.5 Endpoints API

#### `GET /api/voices?lang={fr|en}`
Retourne la liste des voix disponibles pour la langue choisie.

**Réponse :**
```json
{
  "voices": [
    {
      "id": "fr-FR-DeniseNeural",
      "name": "La Fée",
      "gender": "female",
      "description": "Voix douce et chaleureuse",
      "preview_text": "Il était une fois, dans un royaume enchanté..."
    },
    {
      "id": "fr-FR-HenriNeural",
      "name": "Le Sage",
      "gender": "male",
      "description": "Voix grave et rassurante",
      "preview_text": "Il était une fois, dans un royaume enchanté..."
    },
    {
      "id": "fr-FR-EloiseNeural",
      "name": "La Petite",
      "gender": "female",
      "description": "Voix jeune et enjouée",
      "preview_text": "Il était une fois, dans un royaume enchanté..."
    }
  ]
}
```

Voix **françaises** à proposer :
- `fr-FR-DeniseNeural` → "La Fée" (femme, douce)
- `fr-FR-HenriNeural` → "Le Sage" (homme, chaleureux)
- `fr-FR-EloiseNeural` → "La Petite" (jeune femme, enjouée)
- `fr-FR-RemyMultilingualNeural` → "Le Conteur" (homme, narrateur)
- `fr-FR-VivienneMultilingualNeural` → "Grand-Mère" (femme, chaleureuse)

Voix **anglaises** à proposer :
- `en-US-JennyNeural` → "The Fairy" (female, warm)
- `en-US-GuyNeural` → "The Wizard" (male, narrator)
- `en-US-AnaNeural` → "The Little One" (young female)
- `en-GB-SoniaNeural` → "The Queen" (british, elegant)
- `en-US-BrandonNeural` → "The Knight" (male, strong)

#### `POST /api/voices/preview`
Génère un court aperçu audio d'une voix.

**Requête :**
```json
{
  "voice_id": "fr-FR-DeniseNeural",
  "text": "Il était une fois, dans un royaume enchanté...",
  "lang": "fr"
}
```

**Réponse :** Fichier audio MP3 (stream)

#### `POST /api/story/generate`
Endpoint principal. Génère l'histoire + l'audio. C'est un processus en 2 étapes :
1. Envoyer les mots-clés à Gemini → recevoir le texte de l'histoire
2. Envoyer le texte à Edge TTS → recevoir l'audio MP3

**Requête :**
```json
{
  "keywords": "dragon, princesse, château, forêt magique",
  "lang": "fr",
  "voice_id": "fr-FR-DeniseNeural",
  "duration_minutes": 5,
  "child_names": ["Lina", "Adam"]
}
```

**Réponse (streaming ou JSON) :**
```json
{
  "story_id": "uuid-xxxx",
  "title": "Le Dragon de la Forêt Enchantée",
  "text": "Il était une fois, dans une forêt magique...",
  "audio_url": "/api/story/audio/uuid-xxxx.mp3",
  "duration_seconds": 312
}
```

#### `GET /api/story/audio/{story_id}.mp3`
Retourne le fichier audio MP3 de l'histoire générée.

### 1.6 Service Gemini (gemini_service.py)

Utiliser l'API Gemini 2.0 Flash via le endpoint REST :
- **URL** : `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`
- **Auth** : Clé API en paramètre `?key={GEMINI_API_KEY}`
- **Méthode** : POST

```python
import httpx

async def generate_story(keywords: str, lang: str, duration_minutes: int, child_names: list[str]) -> dict:
    prompt = build_prompt(keywords, lang, duration_minutes, child_names)
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}",
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "temperature": 0.8,
                    "maxOutputTokens": 8192
                }
            },
            timeout=60.0
        )
    
    data = response.json()
    text = data["candidates"][0]["content"]["parts"][0]["text"]
    return parse_story_response(text)
```

### 1.7 Prompts de génération d'histoire

#### Prompt Français (`prompts/story_fr.txt`)

```
Tu es un conteur d'histoires professionnel pour enfants. Tu dois créer une histoire captivante, magique et adaptée aux enfants.

CONSIGNES STRICTES :
- L'histoire doit durer environ {duration} minutes à la lecture (environ {word_count} mots)
- Intègre naturellement ces éléments donnés par les enfants : {keywords}
- Si des prénoms d'enfants sont fournis ({child_names}), fais-en les héros de l'histoire
- L'histoire doit avoir un début, un milieu avec une aventure/un défi, et une fin heureuse
- Utilise un langage simple mais riche, adapté aux enfants de 3 à 10 ans
- Ajoute des descriptions vivantes (couleurs, sons, odeurs) pour stimuler l'imagination
- Inclus des moments de suspense doux et des moments drôles
- L'histoire doit transmettre une valeur positive (courage, amitié, partage, etc.)
- N'utilise PAS de violence, de peur excessive ou de thèmes inappropriés
- Écris en français correct et naturel

FORMAT DE RÉPONSE (respecte ce format exactement) :
TITRE: [titre de l'histoire]
---
[texte complet de l'histoire]
```

#### Prompt Anglais (`prompts/story_en.txt`)

```
You are a professional children's storyteller. You must create a captivating, magical story suitable for children.

STRICT GUIDELINES:
- The story must last approximately {duration} minutes when read aloud (approximately {word_count} words)
- Naturally incorporate these elements given by the children: {keywords}
- If children's names are provided ({child_names}), make them the heroes of the story
- The story must have a beginning, a middle with an adventure/challenge, and a happy ending
- Use simple but rich language, suitable for children aged 3 to 10
- Add vivid descriptions (colors, sounds, smells) to stimulate imagination
- Include gentle suspense moments and funny moments
- The story should convey a positive value (courage, friendship, sharing, etc.)
- Do NOT use violence, excessive fear, or inappropriate themes
- Write in natural, correct English

RESPONSE FORMAT (follow this format exactly):
TITLE: [story title]
---
[full story text]
```

**Calcul du nombre de mots :**
- Vitesse de lecture moyenne TTS : ~150 mots/minute
- 5 minutes → ~750 mots
- 10 minutes → ~1500 mots
- 15 minutes → ~2250 mots

### 1.8 Service TTS (tts_service.py)

Appel vers le container Edge TTS local :

```python
import httpx

async def generate_audio(text: str, voice_id: str, speed: float = 0.9) -> bytes:
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{EDGE_TTS_URL}/v1/audio/speech",
            json={
                "input": text,
                "voice": voice_id,
                "speed": speed,
                "response_format": "mp3"
            },
            timeout=120.0
        )
    return response.content
```

**Note :** `speed=0.9` pour un débit légèrement plus lent, idéal pour le storytelling enfants.

### 1.9 Dépendances Python (requirements.txt)

```
fastapi==0.115.0
uvicorn==0.30.0
httpx==0.27.0
python-dotenv==1.0.0
pydantic==2.9.0
aiofiles==24.1.0
python-multipart==0.0.9
uuid6==2024.7.10
```

### 1.10 Sécurité

- Ajouter un header `X-API-Key` sur tous les endpoints, vérifié côté backend
- Rate limiting : max 10 requêtes/minute par IP (utiliser slowapi)
- Les fichiers audio générés sont stockés temporairement dans `/tmp/stories/` et supprimés après 1 heure

---

## PARTIE 2 : APPLICATION MOBILE (React Native / Expo)

### 2.1 Stack technique

- **Framework** : React Native avec Expo (SDK 52+)
- **Navigation** : expo-router (file-based routing)
- **UI** : React Native Paper ou NativeBase
- **Audio recording** : expo-av
- **Audio playback** : expo-av
- **Speech-to-text** : @react-native-voice/voice (pour enregistrer et transcrire la voix des enfants)
- **State** : React Context ou Zustand
- **Storage local** : AsyncStorage (pour sauvegarder langue, histoires favorites)
- **Build** : EAS Build pour générer l'APK/AAB Play Store

### 2.2 Structure du projet

```
/storytime-app/
├── app/
│   ├── _layout.tsx              # Layout racine
│   ├── index.tsx                # Écran choix de langue (splash)
│   ├── home.tsx                 # Page d'accueil principale
│   ├── generating.tsx           # Écran de génération (loading)
│   ├── player.tsx               # Écran lecteur audio
│   └── library.tsx              # Bibliothèque d'histoires sauvegardées
├── components/
│   ├── RecordButton.tsx         # Gros bouton micro
│   ├── VoiceSelector.tsx        # Menu déroulant voix
│   ├── DurationSlider.tsx       # Sélecteur durée
│   ├── KeywordChips.tsx         # Affichage mots-clés détectés
│   ├── AudioPlayer.tsx          # Contrôles lecteur audio
│   └── StoryCard.tsx            # Carte histoire (bibliothèque)
├── services/
│   ├── api.ts                   # Client API backend
│   └── storage.ts               # AsyncStorage helpers
├── contexts/
│   └── AppContext.tsx            # État global (langue, etc.)
├── constants/
│   ├── colors.ts                # Palette de couleurs
│   ├── voices.ts                # Mapping voix/personnages
│   └── translations.ts          # Textes FR/EN
├── assets/
│   ├── images/                  # Illustrations
│   └── animations/              # Lottie animations (optionnel)
├── app.json
├── package.json
└── eas.json
```

### 2.3 Écran 1 : Choix de langue (`index.tsx`)

**Description :**
- Écran plein, fond coloré avec dégradé doux (bleu/violet)
- Logo de l'app "StoryTime" au centre en haut (texte stylisé ou image)
- Sous-titre : "Magical Stories for Little Dreamers" / "Des histoires magiques pour petits rêveurs"
- Deux gros boutons ronds au centre :
  - 🇫🇷 **Français** 
  - 🇬🇧 **English**
- Animation douce à l'apparition (fade in)
- Le choix est sauvegardé dans AsyncStorage
- Redirige vers `home.tsx` après sélection

**Comportement :**
- Si une langue est déjà sauvegardée, skip cet écran et aller directement à home
- La langue peut être changée plus tard dans les paramètres

### 2.4 Écran 2 : Page d'accueil (`home.tsx`)

**Description :**
C'est l'écran principal. Design ludique, coloré, adapté aux enfants.

**Layout de haut en bas :**

1. **Header** (en haut)
   - Titre : "Raconte-moi une histoire !" / "Tell me a story!"
   - Petit bouton paramètres (⚙️) en haut à droite (change de langue)
   - Petit bouton bibliothèque (📚) en haut à gauche

2. **Zone d'enregistrement** (centre, prend ~40% de l'écran)
   - **Gros bouton rond micro** (diamètre ~150dp)
     - État initial : icône micro, couleur primaire, texte "Appuie et parle !" / "Press and speak!"
     - État enregistrement : animation d'onde sonore (cercles concentriques qui pulsent), couleur rouge, texte "J'écoute..." / "Listening..."
     - État terminé : icône check vert
   - **Comportement** : 
     - Appui = commence l'enregistrement vocal
     - Appui de nouveau = stop
     - La voix est transcrite en temps réel en texte via speech-to-text
     - Le texte transcrit s'affiche en dessous dans des "chips" (tags)
   - **Zone chips/mots-clés** (sous le bouton)
     - Affiche les mots-clés extraits comme des tags colorés
     - Chaque chip a un bouton ✕ pour le supprimer
     - Bouton "+" pour ajouter manuellement un mot-clé via le clavier
     - Bouton "🔄 Ré-enregistrer" pour effacer et recommencer

3. **Champ "Prénoms des enfants"** (optionnel)
   - Input texte simple : "Prénoms des héros (optionnel)" / "Heroes' names (optional)"
   - Placeholder : "Lina, Adam..."

4. **Sélecteur de voix** (menu déroulant stylisé)
   - Label : "Qui raconte l'histoire ?" / "Who tells the story?"
   - Dropdown avec les voix disponibles
   - Chaque option affiche : emoji + nom + description courte
   - Exemple : "🧚 La Fée — Voix douce et chaleureuse"
   - Bouton play (▶) à côté de chaque voix pour écouter un aperçu (appel à `/api/voices/preview`)

5. **Sélecteur de durée**
   - Label : "Durée de l'histoire" / "Story duration"
   - 3 boutons radio stylisés : "5 min ⭐" | "10 min ⭐⭐" | "15 min ⭐⭐⭐"
   - Par défaut : 5 min

6. **Bouton "Générer l'histoire"** (en bas, pleine largeur)
   - Gros bouton : "✨ Créer mon histoire !" / "✨ Create my story!"
   - Désactivé si aucun mot-clé n'est enregistré
   - Au clic : navigation vers `generating.tsx`

### 2.5 Écran 3 : Génération en cours (`generating.tsx`)

**Description :**
Écran d'attente pendant que le backend génère l'histoire et l'audio.

**Layout :**
- Fond avec animation douce (étoiles scintillantes ou livre qui s'ouvre)
- Message central qui change selon l'étape :
  1. "🔮 Lecture de vos idées..." / "🔮 Reading your ideas..." (2 secondes)
  2. "📖 Écriture de l'histoire..." / "📖 Writing the story..." (pendant l'appel Gemini)
  3. "🎙️ Préparation de la narration..." / "🎙️ Preparing the narration..." (pendant l'appel TTS)
- Barre de progression douce (pas exacte, juste indicative)
- Bouton "Annuler" discret en bas

**Comportement :**
- Appel POST `/api/story/generate` avec tous les paramètres
- Gestion d'erreur : si erreur, afficher un message sympathique et bouton "Réessayer"
- Temps estimé : 15-45 secondes
- À la fin, navigation automatique vers `player.tsx`

### 2.6 Écran 4 : Lecteur d'histoire (`player.tsx`)

**Description :**
Écran de lecture de l'histoire générée. Design chaleureux et immersif.

**Layout :**
1. **Titre de l'histoire** en haut (gros texte stylisé)
2. **Illustration** (optionnel, placeholder coloré pour V1)
3. **Texte de l'histoire** qui défile dans une zone scrollable
   - Le texte peut être masqué/affiché avec un toggle "Voir le texte" / "Show text"
4. **Contrôles audio** (en bas, style lecteur musique)
   - Barre de progression avec durée écoulée / durée totale
   - Boutons : ⏪ (-15s) | ▶️ Play/Pause | ⏩ (+15s)
   - Contrôle de vitesse (0.75x, 1x, 1.25x)
5. **Actions** (sous les contrôles)
   - 💾 "Sauvegarder" / "Save" → sauvegarde titre + texte + audio en local
   - 🔄 "Nouvelle histoire" / "New story" → retour à home
   - 📤 "Partager" / "Share" → partager le fichier audio

**Comportement :**
- L'audio commence à jouer automatiquement
- Utiliser expo-av pour la lecture audio (depuis l'URL du backend)
- Si l'utilisateur quitte l'app, la lecture continue en background (si possible)

### 2.7 Écran 5 : Bibliothèque (`library.tsx`)

**Description :**
Liste des histoires sauvegardées localement.

**Layout :**
- Liste de cartes (StoryCard), chacune affichant :
  - Titre de l'histoire
  - Date de création
  - Durée
  - Voix utilisée
  - Bouton ▶️ pour réécouter
  - Bouton 🗑️ pour supprimer
- Message si vide : "Pas encore d'histoires ! Crée ta première ✨" / "No stories yet! Create your first ✨"

### 2.8 Client API (`services/api.ts`)

```typescript
const API_BASE_URL = "https://srv1046609.hstgr.cloud:8000/api";
const API_KEY = "votre_cle_secrete";

const headers = {
  "Content-Type": "application/json",
  "X-API-Key": API_KEY,
};

export const api = {
  // Récupérer les voix disponibles
  getVoices: async (lang: "fr" | "en") => {
    const res = await fetch(`${API_BASE_URL}/voices?lang=${lang}`, { headers });
    return res.json();
  },

  // Aperçu d'une voix
  previewVoice: async (voiceId: string, text: string) => {
    const res = await fetch(`${API_BASE_URL}/voices/preview`, {
      method: "POST",
      headers,
      body: JSON.stringify({ voice_id: voiceId, text }),
    });
    return res.blob(); // audio blob
  },

  // Générer une histoire complète
  generateStory: async (params: {
    keywords: string;
    lang: "fr" | "en";
    voice_id: string;
    duration_minutes: number;
    child_names?: string[];
  }) => {
    const res = await fetch(`${API_BASE_URL}/story/generate`, {
      method: "POST",
      headers,
      body: JSON.stringify(params),
    });
    return res.json();
  },

  // URL audio d'une histoire
  getAudioUrl: (storyId: string) => {
    return `${API_BASE_URL}/story/audio/${storyId}.mp3`;
  },
};
```

### 2.9 Palette de couleurs

```typescript
export const colors = {
  // Thème principal - ludique et chaleureux
  primary: "#6C63FF",       // Violet doux
  secondary: "#FF6584",     // Rose corail
  accent: "#43E97B",        // Vert menthe
  background: "#F8F9FE",    // Gris très clair bleuté
  surface: "#FFFFFF",       // Blanc
  text: "#2D3436",          // Noir doux
  textLight: "#636E72",     // Gris
  recording: "#FF4757",     // Rouge vif (enregistrement)
  success: "#2ED573",       // Vert succès
  warning: "#FFA502",       // Orange
  gradientStart: "#6C63FF", // Dégradé violet
  gradientEnd: "#A855F7",   // Dégradé violet clair
};
```

### 2.10 Traductions (`constants/translations.ts`)

```typescript
export const translations = {
  fr: {
    appName: "StoryTime",
    chooseLanguage: "Choisis ta langue",
    tellMeStory: "Raconte-moi une histoire !",
    pressAndSpeak: "Appuie et parle !",
    listening: "J'écoute...",
    whoTells: "Qui raconte l'histoire ?",
    storyDuration: "Durée de l'histoire",
    heroNames: "Prénoms des héros (optionnel)",
    heroNamesPlaceholder: "Lina, Adam...",
    createStory: "✨ Créer mon histoire !",
    readingIdeas: "🔮 Lecture de vos idées...",
    writingStory: "📖 Écriture de l'histoire...",
    preparingNarration: "🎙️ Préparation de la narration...",
    cancel: "Annuler",
    save: "💾 Sauvegarder",
    newStory: "🔄 Nouvelle histoire",
    share: "📤 Partager",
    showText: "Voir le texte",
    hideText: "Masquer le texte",
    library: "Ma bibliothèque",
    noStories: "Pas encore d'histoires ! Crée ta première ✨",
    reRecord: "🔄 Ré-enregistrer",
    addKeyword: "Ajouter un mot",
    minutes: "min",
    retry: "Réessayer",
    errorMessage: "Oups ! Quelque chose s'est mal passé. Réessaie !",
    settings: "Paramètres",
    changeLanguage: "Changer de langue",
  },
  en: {
    appName: "StoryTime",
    chooseLanguage: "Choose your language",
    tellMeStory: "Tell me a story!",
    pressAndSpeak: "Press and speak!",
    listening: "Listening...",
    whoTells: "Who tells the story?",
    storyDuration: "Story duration",
    heroNames: "Heroes' names (optional)",
    heroNamesPlaceholder: "Lina, Adam...",
    createStory: "✨ Create my story!",
    readingIdeas: "🔮 Reading your ideas...",
    writingStory: "📖 Writing the story...",
    preparingNarration: "🎙️ Preparing the narration...",
    cancel: "Cancel",
    save: "💾 Save",
    newStory: "🔄 New story",
    share: "📤 Share",
    showText: "Show text",
    hideText: "Hide text",
    library: "My library",
    noStories: "No stories yet! Create your first ✨",
    reRecord: "🔄 Re-record",
    addKeyword: "Add a word",
    minutes: "min",
    retry: "Retry",
    errorMessage: "Oops! Something went wrong. Try again!",
    settings: "Settings",
    changeLanguage: "Change language",
  },
};
```

---

## PARTIE 3 : DÉPLOIEMENT

### 3.1 Backend — Déployer sur le VPS

```bash
# Sur le VPS srv1046609.hstgr.cloud
git clone <repo> /opt/storytime-backend
cd /opt/storytime-backend

# Créer le .env avec la clé Gemini
nano .env

# Lancer avec Docker Compose
docker compose up -d

# Vérifier que ça tourne
curl http://localhost:8000/api/voices?lang=fr
curl http://localhost:5050/v1/audio/speech -X POST -H "Content-Type: application/json" -d '{"input":"Test","voice":"fr-FR-DeniseNeural"}' --output test.mp3
```

### 3.2 HTTPS / Reverse Proxy

Configurer Nginx comme reverse proxy avec un certificat SSL Let's Encrypt pour exposer l'API en HTTPS :

```nginx
server {
    listen 443 ssl;
    server_name srv1046609.hstgr.cloud;

    ssl_certificate /etc/letsencrypt/live/srv1046609.hstgr.cloud/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/srv1046609.hstgr.cloud/privkey.pem;

    # API FastAPI
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 50M;
        proxy_read_timeout 120s;
    }
}
```

### 3.3 App Mobile — Build pour Play Store

```bash
# Installer Expo
npx create-expo-app storytime-app
cd storytime-app

# Configurer EAS Build
npx eas-cli build:configure

# Build APK pour test
npx eas-cli build --platform android --profile preview

# Build AAB pour Play Store
npx eas-cli build --platform android --profile production
```

---

## PARTIE 4 : INSTRUCTIONS DE DÉVELOPPEMENT

### 4.1 Ordre de développement recommandé

1. **Backend d'abord :**
   - Mettre en place le docker-compose avec edge-tts
   - Créer l'endpoint `/api/voices`
   - Créer l'endpoint `/api/voices/preview` 
   - Créer l'endpoint `/api/story/generate` avec les prompts
   - Tester avec curl

2. **App mobile ensuite :**
   - Écran choix de langue
   - Écran d'accueil avec bouton micro (UI seulement)
   - Intégrer speech-to-text
   - Connecter à l'API backend
   - Écran de génération
   - Écran lecteur audio
   - Bibliothèque
   - Polish UI / animations

### 4.2 Points d'attention

- **Speech-to-text sur mobile** : utiliser `@react-native-voice/voice` qui utilise les APIs natives Android (gratuit, offline possible). NE PAS utiliser une API cloud pour le STT.
- **Gestion d'erreur** : toujours avoir un fallback sympathique pour les enfants. Pas de messages d'erreur techniques.
- **Performance audio** : les histoires de 5 min font ~1-2 MB en MP3. Prévoir un cache local.
- **Timeout** : la génération peut prendre 30-60 secondes. Mettre un timeout de 120 secondes côté client.
- **Pas d'auth utilisateur** : pour le MVP, pas de système de compte. Juste une clé API partagée entre l'app et le backend.

### 4.3 Pour tester rapidement

Le backend peut être testé indépendamment avec curl :

```bash
# Tester les voix
curl https://srv1046609.hstgr.cloud/api/voices?lang=fr

# Tester la génération d'histoire
curl -X POST https://srv1046609.hstgr.cloud/api/story/generate \
  -H "Content-Type: application/json" \
  -H "X-API-Key: votre_cle" \
  -d '{
    "keywords": "dragon, princesse, forêt magique",
    "lang": "fr",
    "voice_id": "fr-FR-DeniseNeural",
    "duration_minutes": 5,
    "child_names": ["Lina", "Adam"]
  }'
```

---

## RÉSUMÉ TECHNIQUE

| Composant | Technologie | Coût |
|-----------|-------------|------|
| App mobile | React Native / Expo | Gratuit |
| Backend API | Python FastAPI | Gratuit (sur VPS existant) |
| Text-to-Speech | Edge TTS (via Docker) | Gratuit |
| Génération d'histoire | Gemini 2.0 Flash API | Gratuit (tier gratuit) |
| Speech-to-Text | Android natif (@react-native-voice) | Gratuit |
| Hébergement backend | VPS Hostinger (existant) | Déjà payé |
| **TOTAL** | | **$0/mois** |
