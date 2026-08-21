# Amboul Mecanic Repair — Instructions Claude

## Contexte du projet
App de diagnostic automobile IA pour mécaniciens (utilisée sur téléphone/tablette en garage). Le mécanicien entre marque/modèle/année/symptômes, l'IA retourne un diagnostic structuré en markdown. Frontend single-page HTML/CSS/JS vanilla + backend Node.js/Express (proxy IA + comptes utilisateurs).

## Stack
### Frontend (racine)
- HTML5 + CSS3 (CSS custom properties, glass-morphism, `backdrop-filter`)
- ES6+ vanilla JavaScript, pas de modules ES — fichiers chargés dans l'ordre : `i18n.js`, `auth.js`, `api.js`, `app.js`
- marked.js + DOMPurify via CDN pour le rendu markdown sécurisé
- localStorage pour la persistance (historique, settings, JWT)
- i18n 4 langues : fr, en, es, ht (Kreyòl) — objet `TRANSLATIONS` dans `i18n.js`

### Backend (`backend/`)
- Node.js ≥ 20, Express 4, PostgreSQL (Neon.tech) via `pg`
- Auth JWT (24h) + bcryptjs, comptes créés par l'admin uniquement (inscription publique désactivée)
- Déployé sur Render.com : `https://amboul-mecanic-repair.onrender.com`
- Rate limiting : 60 req/min global, 20/min diagnostics, 3/min setup
- Compte admin auto-créé au démarrage (`ADMIN_EMAIL` + `ADMIN_INITIAL_PASSWORD` dans `.env`)
- Reset mot de passe admin : `backend/reset-password.js` (la route `/api/auth/setup` refuse si l'admin existe déjà)

## Providers IA (appelés par le backend, clés dans `backend/.env`)
- **Pollinations** (défaut) : `openai-fast` via `https://gen.pollinations.ai/v1/chat/completions`, en-tête `Authorization: Bearer POLLINATIONS_API_KEY`. Le mode « sans compte » passe par la route publique `/api/diagnose/free` (appels navigateur directs bloqués par Turnstile). L’accès anonyme de l’ancien hôte `text.pollinations.ai` a été supprimé (402) : la clé est obligatoire, mais gratuite via https://enter.pollinations.ai/keys
- **Gemini** : `gemini-2.5-flash`
- **Claude** : `claude-haiku-4-5-20251001`
- **DeepSeek** : `deepseek-chat`
- **Grok** : `grok-3-mini`

Les clés API ne sont JAMAIS dans le frontend — uniquement dans `backend/.env`.

## Clés localStorage (frontend)
- `amboul_jwt`, `amboul_user`, `amboul_backend_url`, `amboul_last_activity`
- `amboul_history` (max 10 entrées, JSON array), `amboul_col_widths`
- `ai_provider`, `custom_model`, `amboul_lang`
- sessionStorage : `amboul_free_mode` (mode sans compte)

## Conventions
- Pas de `alert()` sauf pour confirmation — utiliser des messages inline
- Le prompt système (`SYSTEM_PROMPT` dans `backend/routes/diagnose.js` uniquement) ne doit jamais changer sans tester le rendu markdown résultant
- Les marques/modèles sont dans l'objet `carData` en haut de `app.js` (thermiques + hybrides + électriques)
- Navigation entre sections : CSS `display:none/block` via la fonction `showSection(id)`
- Tout HTML injecté avec des données dynamiques passe par `escHtml()` ou DOMPurify
- Priorité tactile/responsive : l'app est utilisée sur mobile/tablette (nav mobile en bas, zones tactiles ≥ 44px)
- `isAdmin()` frontend = affichage uniquement ; la vraie protection est `requireAdmin` côté backend

## Agents disponibles
- `diagnosticien` — questions mécaniques, prompt système, véhicules
- `obd2-expert` — codes OBD2, base de données, descriptions
- `ui-designer` — CSS, composants visuels, palette glass-morphism

## Skills disponibles
- `/skill amboul-mecanic` — workflow ajout fonctionnalité
- `/skill export-rapport` — génération rapport print
- `/skill api-debug` — debug appels API

## Palette de couleurs
- `--primary-color: #3b82f6` (bleu)
- `--accent-color: #10b981` (vert — aussi utilisé pour les pièces VE)
- `--bg-color: #0f1115` (fond)
- `--glass-bg: rgba(25, 28, 35, 0.6)`
- `--error-color: #ef4444` (rouge)
- `--warning-color: #f59e0b` (orange)
