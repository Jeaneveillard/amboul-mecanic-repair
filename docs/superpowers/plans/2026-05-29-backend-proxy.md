# Backend Proxy — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer un backend Node.js + Express sur Railway qui proxy toutes les requêtes IA, sécurise les clés API côté serveur, et gère l'authentification JWT des utilisateurs.

**Architecture:** Express app dans `backend/`, SQLite pour les comptes utilisateurs, JWT 24h. Le frontend délègue via `api.js` et `auth.js`. Fallback Pollinations direct si pas de backend configuré.

**Tech Stack:** Node.js 20+, Express 4, better-sqlite3, bcryptjs, jsonwebtoken, express-validator, express-rate-limit, cors, dotenv.

---

## Fichiers créés / modifiés

| Fichier | Action |
|---------|--------|
| `backend/package.json` | Créer |
| `backend/server.js` | Créer |
| `backend/db.js` | Créer |
| `backend/middleware/auth.js` | Créer |
| `backend/routes/auth.js` | Créer |
| `backend/routes/diagnose.js` | Créer |
| `backend/.env.example` | Créer |
| `backend/railway.json` | Créer |
| `auth.js` | Créer (frontend) |
| `api.js` | Créer (frontend) |
| `index.html` | Modifier — overlay login + modal simplifié |
| `style.css` | Modifier — styles overlay |
| `app.js` | Modifier — déléguer à api.js |

---

## Task 1 : Backend — package.json + dépendances

**Fichiers :**
- Créer : `backend/package.json`

- [ ] **Étape 1 : Créer `backend/package.json`**

```json
{
  "name": "amboul-mecanic-backend",
  "version": "1.0.0",
  "description": "Proxy backend sécurisé pour Amboul Mecanic Repair",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "node --watch server.js"
  },
  "engines": { "node": ">=20" },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "better-sqlite3": "^9.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.19.2",
    "express-rate-limit": "^7.2.0",
    "express-validator": "^7.0.1",
    "jsonwebtoken": "^9.0.2"
  }
}
```

- [ ] **Étape 2 : Installer les dépendances**

```bash
cd backend
npm install
```

Résultat attendu : dossier `backend/node_modules/` créé, pas d'erreur.

- [ ] **Étape 3 : Créer `backend/.gitignore`**

```
node_modules/
.env
*.db
```

- [ ] **Étape 4 : Commit**

```bash
git add backend/package.json backend/package-lock.json backend/.gitignore
git commit -m "feat(backend): init package.json + dependencies"
```

---

## Task 2 : Backend — db.js (SQLite + migration)

**Fichiers :**
- Créer : `backend/db.js`

- [ ] **Étape 1 : Créer `backend/db.js`**

```javascript
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, 'amboul.db');
const db = new Database(dbPath);

// Activation WAL pour de meilleures performances concurrent
db.pragma('journal_mode = WAL');

// Migration automatique au démarrage
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id            INTEGER PRIMARY KEY AUTOINCREMENT,
        email         TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

module.exports = db;
```

- [ ] **Étape 2 : Vérifier en Node.js**

```bash
cd backend
node -e "const db = require('./db'); console.log(db.prepare('SELECT name FROM sqlite_master WHERE type=\"table\"').all())"
```

Résultat attendu : `[ { name: 'users' } ]`

- [ ] **Étape 3 : Commit**

```bash
git add backend/db.js
git commit -m "feat(backend): SQLite db with users table"
```

---

## Task 3 : Backend — middleware/auth.js (JWT)

**Fichiers :**
- Créer : `backend/middleware/auth.js`

- [ ] **Étape 1 : Créer `backend/middleware/auth.js`**

```javascript
const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token manquant' });
    }
    const token = header.slice(7);
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    } catch {
        res.status(401).json({ error: 'Token invalide ou expiré' });
    }
}

module.exports = { requireAuth };
```

- [ ] **Étape 2 : Tester la fonction avec un token valide et invalide**

```bash
cd backend
node -e "
const jwt = require('jsonwebtoken');
process.env.JWT_SECRET = 'test-secret';
const { requireAuth } = require('./middleware/auth');

// Token valide
const token = jwt.sign({ id: 1, email: 'test@test.com' }, 'test-secret', { expiresIn: '1h' });
let called = false;
const req = { headers: { authorization: 'Bearer ' + token } };
const res = { status: () => res, json: (d) => console.log('valid token result:', d) };
const next = () => { called = true; console.log('next() called — token valid ✓'); };
requireAuth(req, res, next);

// Token invalide
const req2 = { headers: { authorization: 'Bearer invalid' } };
const res2 = { status: (c) => { console.log('status:', c); return res2; }, json: (d) => console.log('invalid token result:', d, '✓') };
requireAuth(req2, res2, () => {});
"
```

Résultat attendu :
```
next() called — token valid ✓
status: 401
invalid token result: { error: 'Token invalide ou expiré' } ✓
```

- [ ] **Étape 3 : Commit**

```bash
git add backend/middleware/auth.js
git commit -m "feat(backend): JWT auth middleware"
```

---

## Task 4 : Backend — routes/auth.js (register + login)

**Fichiers :**
- Créer : `backend/routes/auth.js`

- [ ] **Étape 1 : Créer `backend/routes/auth.js`**

```javascript
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../db');

const router = express.Router();

function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
}

// POST /api/auth/register
router.post('/register',
    body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Mot de passe minimum 8 caractères'),
    validate,
    async (req, res) => {
        const { email, password } = req.body;
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existing) {
            return res.status(409).json({ error: 'Email déjà utilisé' });
        }
        const hash = await bcrypt.hash(password, 12);
        const result = db.prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)').run(email, hash);
        const token = jwt.sign(
            { id: result.lastInsertRowid, email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.status(201).json({ token, email });
    }
);

// POST /api/auth/login
router.post('/login',
    body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
    body('password').notEmpty().withMessage('Mot de passe requis'),
    validate,
    async (req, res) => {
        const { email, password } = req.body;
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return res.status(401).json({ error: 'Identifiants incorrects' });
        }
        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Identifiants incorrects' });
        }
        const token = jwt.sign(
            { id: user.id, email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        res.json({ token, email });
    }
);

module.exports = router;
```

- [ ] **Étape 2 : Commit**

```bash
git add backend/routes/auth.js
git commit -m "feat(backend): register + login routes"
```

---

## Task 5 : Backend — routes/diagnose.js (proxy IA)

**Fichiers :**
- Créer : `backend/routes/diagnose.js`

- [ ] **Étape 1 : Créer `backend/routes/diagnose.js`**

```javascript
const express = require('express');
const { body, validationResult } = require('express-validator');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const SYSTEM_PROMPT = `Tu incarnes le rôle suivant : Expert métier, Coach pédagogique, Analyste critique, Assistant créatif.
Contexte d'utilisation : Pour aider les mécaniciens qui ne sont pas trop habiles en code de véhicule à faire des réparations.
Objectif : Repérer le problème, décrire l'anomalie, porter une analyse du problème et donner un résultat avec diagnostic pour réparer le véhicule.
Présente ta réponse au format : Tableau, Paragraphes, Plan numéroté, Liste à puces.
Contraintes impératives : Aller directement dans le problème, donne un diagnostic précis sans trop de gros mots techniques. Soyez bref.
Coûts des pièces : Toujours inclure une estimation du coût des pièces en dollars canadiens ($ CAD). Indique une fourchette réaliste basée sur les prix du marché canadien.
Schéma de localisation : Fournis un schéma ASCII simple montrant où se trouve la pièce défectueuse sur le véhicule.
Outils de démontage/remontage : Fournis deux listes séparées : DÉMONTAGE et REMONTAGE avec tailles de clés précises et couples de serrage.
Public visé : Au mécanicien réparateur de véhicule.
Adopte un ton Technique, Détaillé, Concis, Pédagogique.`;

const VALID_PROVIDERS = ['pollinations', 'gemini', 'claude', 'deepseek', 'grok'];

router.post('/',
    requireAuth,
    body('make').trim().notEmpty().isLength({ max: 100 }).withMessage('Marque requise'),
    body('model').trim().notEmpty().isLength({ max: 100 }).withMessage('Modèle requis'),
    body('year').trim().notEmpty().withMessage('Année requise'),
    body('symptom').trim().notEmpty().isLength({ max: 2000 }).withMessage('Symptôme requis'),
    body('provider').isIn(VALID_PROVIDERS).withMessage('Fournisseur invalide'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const { make, model, year, symptom, provider } = req.body;
        const userPrompt = `Véhicule: ${make} ${model} (Année: ${year})\nSymptômes/Codes: ${symptom}\nVeuillez analyser et fournir un diagnostic selon vos instructions systémiques.`;

        try {
            let result = '';

            if (provider === 'pollinations') {
                const resp = await fetch('https://text.pollinations.ai/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: [
                            { role: 'system', content: SYSTEM_PROMPT },
                            { role: 'user', content: userPrompt }
                        ],
                        model: 'openai-large',
                        private: true,
                        seed: -1
                    })
                });
                if (!resp.ok) throw new Error(`Pollinations: ${resp.statusText}`);
                result = await resp.text();

            } else if (provider === 'gemini') {
                const key = process.env.GEMINI_API_KEY;
                if (!key) return res.status(503).json({ error: 'Gemini non configuré sur le serveur' });
                const resp = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            system_instruction: { parts: { text: SYSTEM_PROMPT } },
                            contents: [{ parts: [{ text: userPrompt }] }]
                        })
                    }
                );
                if (!resp.ok) { const e = await resp.json(); throw new Error(e.error?.message || resp.statusText); }
                const data = await resp.json();
                if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
                    throw new Error('Réponse Gemini vide ou bloquée par le filtre de sécurité');
                }
                result = data.candidates[0].content.parts[0].text;

            } else if (provider === 'claude') {
                const key = process.env.CLAUDE_API_KEY;
                if (!key) return res.status(503).json({ error: 'Claude non configuré sur le serveur' });
                const resp = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': key,
                        'anthropic-version': '2023-06-01'
                    },
                    body: JSON.stringify({
                        model: 'claude-haiku-4-5-20251001',
                        max_tokens: 2048,
                        system: SYSTEM_PROMPT,
                        messages: [{ role: 'user', content: userPrompt }]
                    })
                });
                if (!resp.ok) { const e = await resp.json(); throw new Error(e.error?.message || resp.statusText); }
                const data = await resp.json();
                result = data.content[0].text;

            } else if (provider === 'deepseek') {
                const key = process.env.DEEPSEEK_API_KEY;
                if (!key) return res.status(503).json({ error: 'DeepSeek non configuré sur le serveur' });
                const resp = await fetch('https://api.deepseek.com/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
                    body: JSON.stringify({
                        model: 'deepseek-v3',
                        messages: [
                            { role: 'system', content: SYSTEM_PROMPT },
                            { role: 'user', content: userPrompt }
                        ]
                    })
                });
                if (!resp.ok) { const e = await resp.json(); throw new Error(e.error?.message || resp.statusText); }
                const data = await resp.json();
                result = data.choices[0].message.content;

            } else if (provider === 'grok') {
                const key = process.env.GROK_API_KEY;
                if (!key) return res.status(503).json({ error: 'Grok non configuré sur le serveur' });
                const resp = await fetch('https://api.x.ai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
                    body: JSON.stringify({
                        model: 'grok-3-mini',
                        messages: [
                            { role: 'system', content: SYSTEM_PROMPT },
                            { role: 'user', content: userPrompt }
                        ]
                    })
                });
                if (!resp.ok) { const e = await resp.json(); throw new Error(e.error?.message || resp.statusText); }
                const data = await resp.json();
                result = data.choices[0].message.content;
            }

            res.json({ result });
        } catch (error) {
            console.error('Diagnose error:', error.message);
            res.status(500).json({ error: error.message });
        }
    }
);

module.exports = router;
```

- [ ] **Étape 2 : Commit**

```bash
git add backend/routes/diagnose.js
git commit -m "feat(backend): AI proxy route with all providers"
```

---

## Task 6 : Backend — server.js (Express app)

**Fichiers :**
- Créer : `backend/server.js`
- Créer : `backend/.env.example`
- Créer : `backend/railway.json`

- [ ] **Étape 1 : Créer `backend/server.js`**

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const diagnoseRoutes = require('./routes/diagnose');

const app = express();

// CORS — accepte FRONTEND_URL + null (file:// local)
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'null'
].filter(Boolean);

app.use(cors({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
        cb(new Error('CORS non autorisé pour cette origine'));
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50kb' }));

// Rate limiting global (60 req/min par IP)
app.use(rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Trop de requêtes, réessayez dans une minute.' }
}));

// Rate limiting strict pour les diagnostics (20/min)
const diagnoseLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Limite de 20 diagnostics/minute atteinte.' }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/diagnose', diagnoseLimit, diagnoseRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Route introuvable' }));

// Erreurs non gérées
app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).json({ error: 'Erreur serveur interne' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Amboul backend démarré sur le port ${PORT}`);
    if (!process.env.JWT_SECRET) console.warn('⚠️  JWT_SECRET non défini !');
});
```

- [ ] **Étape 2 : Créer `backend/.env.example`**

```env
# === OBLIGATOIRES ===
PORT=3000
JWT_SECRET=remplacez_par_une_chaine_aleatoire_longue_et_secrete

# URL du frontend (ex: https://jeaneveillard.github.io ou null pour file://)
FRONTEND_URL=https://jeaneveillard.github.io

# Chemin SQLite (optionnel, défaut: ./amboul.db)
# DB_PATH=./amboul.db

# === CLÉS API IA (au moins une recommandée) ===
GEMINI_API_KEY=
CLAUDE_API_KEY=
DEEPSEEK_API_KEY=
GROK_API_KEY=
```

- [ ] **Étape 3 : Créer `backend/railway.json`**

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "healthcheckPath": "/api/health",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

- [ ] **Étape 4 : Tester le serveur localement**

Créer un fichier `backend/.env` (NE PAS committer) :
```env
PORT=3001
JWT_SECRET=dev-secret-local-test
FRONTEND_URL=null
```

Démarrer :
```bash
cd backend
npm start
```

Résultat attendu : `✅ Amboul backend démarré sur le port 3001`

- [ ] **Étape 5 : Tester les routes avec curl**

```bash
# Health check
curl http://localhost:3001/api/health
# Attendu: {"status":"ok","timestamp":"..."}

# Inscription
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"motdepasse123"}'
# Attendu: {"token":"eyJ...","email":"test@test.com"}

# Connexion
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"motdepasse123"}'
# Attendu: {"token":"eyJ...","email":"test@test.com"}

# Diagnostic sans token — doit échouer
curl -X POST http://localhost:3001/api/diagnose \
  -H "Content-Type: application/json" \
  -d '{"make":"Toyota","model":"Corolla","year":"2018","symptom":"P0171","provider":"pollinations"}'
# Attendu: {"error":"Token manquant"}
```

- [ ] **Étape 6 : Commit**

```bash
git add backend/server.js backend/.env.example backend/railway.json
git commit -m "feat(backend): Express server with CORS + rate limiting"
```

---

## Task 7 : Frontend — auth.js + api.js

**Fichiers :**
- Créer : `auth.js` (à la racine du projet, à côté d'app.js)
- Créer : `api.js`

- [ ] **Étape 1 : Créer `auth.js`**

```javascript
// ===== Constantes localStorage =====
const AUTH_TOKEN_KEY = 'amboul_jwt';
const AUTH_USER_KEY  = 'amboul_user';
const BACKEND_URL_KEY = 'amboul_backend_url';

// ===== Getters =====
function getToken()      { return localStorage.getItem(AUTH_TOKEN_KEY); }
function getUser()       { return localStorage.getItem(AUTH_USER_KEY); }
function getBackendUrl() { return localStorage.getItem(BACKEND_URL_KEY) || ''; }
function isLoggedIn()    { return !!getToken(); }

// ===== Sauvegarde après login/register =====
function saveAuth(token, email) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, email);
}

// ===== Déconnexion =====
function logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
    showAuthOverlay();
}

// ===== Inscription =====
async function register(email, password) {
    const backendUrl = getBackendUrl();
    if (!backendUrl) throw new Error('URL backend non configurée dans ⚙️ Paramètres');
    const resp = await fetch(`${backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Erreur inscription');
    saveAuth(data.token, data.email);
    return data;
}

// ===== Connexion =====
async function login(email, password) {
    const backendUrl = getBackendUrl();
    if (!backendUrl) throw new Error('URL backend non configurée dans ⚙️ Paramètres');
    const resp = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await resp.json();
    if (!resp.ok) throw new Error(data.error || 'Erreur connexion');
    saveAuth(data.token, data.email);
    return data;
}

// ===== Overlay UI helpers =====
function showAuthOverlay() {
    const el = document.getElementById('authOverlay');
    if (el) el.classList.remove('hidden');
}

function hideAuthOverlay() {
    const el = document.getElementById('authOverlay');
    if (el) el.classList.add('hidden');
}
```

- [ ] **Étape 2 : Créer `api.js`**

```javascript
// Utilise getBackendUrl(), getToken(), logout() de auth.js (chargé avant dans index.html)

// SYSTEM_PROMPT vient de app.js — accessible car même page

async function callDiagnose({ make, model, year, symptom, provider }) {
    const backendUrl = getBackendUrl();

    // Sans backend → Pollinations direct (mode sans compte)
    if (!backendUrl) {
        return callPollinationsDirect({ make, model, year, symptom });
    }

    const resp = await fetch(`${backendUrl}/api/diagnose`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ make, model, year, symptom, provider })
    });

    if (resp.status === 401) {
        logout(); // efface le JWT et affiche l'overlay de connexion
        throw new Error('Session expirée. Reconnectez-vous.');
    }

    if (!resp.ok) {
        const e = await resp.json().catch(() => ({}));
        throw new Error(e.error || `Erreur serveur (${resp.status})`);
    }

    const data = await resp.json();
    return data.result;
}

// Fallback Pollinations direct (pas de backend)
async function callPollinationsDirect({ make, model, year, symptom }) {
    const userPrompt = `Véhicule: ${make} ${model} (Année: ${year})\nSymptômes/Codes: ${symptom}\nVeuillez analyser et fournir un diagnostic selon vos instructions systémiques.`;
    const resp = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            messages: [
                { role: 'system', content: typeof SYSTEM_PROMPT !== 'undefined' ? SYSTEM_PROMPT : '' },
                { role: 'user', content: userPrompt }
            ],
            model: 'openai-large',
            private: true,
            seed: -1
        })
    });
    if (!resp.ok) throw new Error(`[Pollinations] ${resp.statusText}`);
    return resp.text();
}
```

- [ ] **Étape 3 : Commit**

```bash
git add auth.js api.js
git commit -m "feat(frontend): auth.js + api.js backend client"
```

---

## Task 8 : Frontend — index.html (overlay login + modal simplifié)

**Fichiers :**
- Modifier : `index.html`

- [ ] **Étape 1 : Ajouter l'overlay de connexion dans index.html**

Ajouter juste après `<body>` (avant `.app-container`) :

```html
<!-- Overlay de connexion / inscription -->
<div id="authOverlay" class="auth-overlay hidden">
    <div class="auth-card glass-panel">
        <div class="auth-logo">
            <span>🔧</span>
            <h1>Amboul <span class="highlight">Mecanic</span></h1>
        </div>

        <p class="auth-subtitle" id="authSubtitle">Connectez-vous pour accéder à l'outil de diagnostic.</p>
        <div id="authError" class="error-inline hidden"></div>

        <form id="authForm">
            <div class="form-group">
                <label for="authEmail">Email</label>
                <input type="email" id="authEmail" placeholder="mecanicien@garage.com" required>
            </div>
            <div class="form-group">
                <label for="authPassword">Mot de passe</label>
                <input type="password" id="authPassword" placeholder="Minimum 8 caractères" required>
            </div>
            <button type="submit" class="btn primary-btn" id="authSubmitBtn">
                <span class="btn-text" id="authBtnText">Se connecter</span>
                <div class="loader hidden"></div>
            </button>
        </form>

        <div class="auth-footer">
            <span id="authToggleText">Pas encore de compte ?</span>
            <button type="button" class="auth-toggle-btn" id="authToggleBtn">Créer un compte</button>
        </div>

        <div class="auth-free-mode">
            <span>ou</span>
            <button type="button" class="auth-free-btn" id="authFreeBtn">Continuer sans compte (Pollinations gratuit)</button>
        </div>
    </div>
</div>
```

- [ ] **Étape 2 : Simplifier le modal ⚙️ — remplacer les champs clé API**

Remplacer tout le contenu de `.modal-body` dans le modal `#settingsModal` par :

```html
            <div class="modal-body">
                <div class="form-group">
                    <label>Utilisateur connecté</label>
                    <div id="settingsUserEmail" class="settings-user-email">—</div>
                </div>

                <div class="form-group">
                    <label for="backendUrlInput">URL du Backend</label>
                    <input type="text" id="backendUrlInput" placeholder="https://votre-backend.up.railway.app">
                    <p class="field-hint">Laissez vide pour utiliser Pollinations gratuitement sans compte.</p>
                </div>

                <div class="form-group">
                    <label for="aiProvider">Fournisseur IA préféré</label>
                    <select id="aiProvider">
                        <option value="pollinations">🆓 Mode Gratuit — Sans clé API</option>
                        <option value="gemini">Google Gemini</option>
                        <option value="claude">Anthropic Claude</option>
                        <option value="deepseek">DeepSeek</option>
                        <option value="grok">xAI Grok</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="customModel">Modèle personnalisé (Optionnel)</label>
                    <input type="text" id="customModel" placeholder="Laissez vide pour le défaut">
                    <p class="field-hint">Ex: claude-sonnet-4-6, gemini-2.5-pro, grok-3</p>
                </div>

                <button type="button" id="saveSettingsBtn" class="btn primary-btn">Sauvegarder</button>
                <button type="button" id="logoutBtn" class="btn danger-btn" style="margin-top:0.75rem">
                    Se déconnecter
                </button>
            </div>
```

- [ ] **Étape 3 : Ajouter les scripts auth.js et api.js avant app.js**

Remplacer la ligne `<script src="app.js">` par :

```html
    <script src="auth.js"></script>
    <script src="api.js"></script>
    <script src="app.js"></script>
```

- [ ] **Étape 4 : Commit**

```bash
git add index.html
git commit -m "feat(frontend): login overlay + simplified settings modal"
```

---

## Task 9 : Frontend — style.css (styles overlay de connexion)

**Fichiers :**
- Modifier : `style.css`

- [ ] **Étape 1 : Ajouter les styles de l'overlay**

Ajouter avant `/* ===== IMPRESSION ===== */` :

```css
/* ===== OVERLAY CONNEXION ===== */
.auth-overlay {
    position: fixed;
    inset: 0;
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-color);
    padding: 1rem;
}

.auth-card {
    width: 100%;
    max-width: 420px;
    padding: 2.5rem 2rem;
    animation: modalFadeIn 0.3s ease-out;
}

.auth-logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.5rem;
}

.auth-logo span {
    font-size: 1.75rem;
}

.auth-logo h1 {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    font-weight: 700;
}

.auth-subtitle {
    color: var(--text-muted);
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
}

.auth-footer {
    margin-top: 1.25rem;
    text-align: center;
    font-size: 0.85rem;
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
}

.auth-toggle-btn {
    background: none;
    border: none;
    color: var(--primary-color);
    cursor: pointer;
    font-size: 0.85rem;
    font-family: var(--font-sans);
    text-decoration: underline;
    padding: 0;
}

.auth-free-mode {
    margin-top: 1rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-muted);
    font-size: 0.8rem;
}

.auth-free-btn {
    background: none;
    border: 1px solid var(--glass-border);
    color: var(--text-muted);
    border-radius: 8px;
    padding: 0.5rem 1rem;
    cursor: pointer;
    font-size: 0.78rem;
    font-family: var(--font-sans);
    transition: var(--transition);
}

.auth-free-btn:hover {
    border-color: var(--accent-color);
    color: var(--accent-color);
}

/* Settings — utilisateur connecté */
.settings-user-email {
    font-weight: 600;
    color: var(--accent-color);
    font-size: 0.9rem;
    padding: 0.5rem 0;
}

/* Bouton déconnexion inline dans modal */
#logoutBtn {
    width: 100%;
}
```

- [ ] **Étape 2 : Commit**

```bash
git add style.css
git commit -m "feat(frontend): login overlay CSS styles"
```

---

## Task 10 : Frontend — app.js (intégration auth + api)

**Fichiers :**
- Modifier : `app.js`

- [ ] **Étape 1 : Initialiser l'overlay au démarrage**

Ajouter au tout début du callback `DOMContentLoaded`, juste après les déclarations DOM (ligne ~22) :

```javascript
    // ===== Initialisation Auth =====
    if (!isLoggedIn() && getBackendUrl()) {
        showAuthOverlay();
    }
    // Si pas de backend configuré → mode direct (Pollinations), pas d'overlay
```

- [ ] **Étape 2 : Brancher l'overlay de connexion**

Ajouter après l'initialisation Auth :

```javascript
    // ===== Logique de l'overlay de connexion =====
    const authOverlay = document.getElementById('authOverlay');
    const authForm = document.getElementById('authForm');
    const authEmail = document.getElementById('authEmail');
    const authPassword = document.getElementById('authPassword');
    const authError = document.getElementById('authError');
    const authBtnText = document.getElementById('authBtnText');
    const authToggleBtn = document.getElementById('authToggleBtn');
    const authToggleText = document.getElementById('authToggleText');
    const authSubmitBtn = document.getElementById('authSubmitBtn');
    const authFreeBtn = document.getElementById('authFreeBtn');

    let authMode = 'login'; // 'login' | 'register'

    authToggleBtn?.addEventListener('click', () => {
        authMode = authMode === 'login' ? 'register' : 'login';
        authBtnText.textContent = authMode === 'login' ? 'Se connecter' : 'Créer un compte';
        authToggleBtn.textContent = authMode === 'login' ? 'Créer un compte' : 'Se connecter';
        authToggleText.textContent = authMode === 'login' ? 'Pas encore de compte ?' : 'Déjà un compte ?';
        authError.classList.add('hidden');
    });

    authFreeBtn?.addEventListener('click', () => {
        hideAuthOverlay();
    });

    authForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        authError.classList.add('hidden');
        const email = authEmail.value.trim();
        const password = authPassword.value;

        const loader = authSubmitBtn.querySelector('.loader');
        authBtnText.classList.add('hidden');
        loader.classList.remove('hidden');
        authSubmitBtn.disabled = true;

        try {
            if (authMode === 'login') {
                await login(email, password);
            } else {
                await register(email, password);
            }
            hideAuthOverlay();
            document.getElementById('settingsUserEmail').textContent = getUser() || '—';
        } catch (err) {
            authError.textContent = err.message;
            authError.classList.remove('hidden');
        } finally {
            authBtnText.classList.remove('hidden');
            loader.classList.add('hidden');
            authSubmitBtn.disabled = false;
        }
    });
```

- [ ] **Étape 3 : Brancher saveSettings + logoutBtn dans le modal ⚙️**

Remplacer le `saveSettingsBtn.addEventListener('click', ...)` existant par :

```javascript
    saveSettingsBtn.addEventListener('click', () => {
        const backendUrlInput = document.getElementById('backendUrlInput');
        if (backendUrlInput) {
            localStorage.setItem('amboul_backend_url', backendUrlInput.value.trim());
        }
        localStorage.setItem('ai_provider', aiProviderSelect.value);
        localStorage.setItem('custom_model', customModelInput.value.trim());
        closeModal();
        saveSettingsBtn.textContent = '✅ Sauvegardé !';
        setTimeout(() => { saveSettingsBtn.textContent = 'Sauvegarder'; }, 2000);
    });

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        closeModal();
        logout();
    });
```

- [ ] **Étape 4 : Remplir les champs du modal à l'ouverture**

Ajouter dans `const openModal = () => { ... }` après les autres `localStorage.getItem` :

```javascript
        const backendUrlInput = document.getElementById('backendUrlInput');
        if (backendUrlInput) backendUrlInput.value = getBackendUrl();
        const emailDisplay = document.getElementById('settingsUserEmail');
        if (emailDisplay) emailDisplay.textContent = getUser() || '—';
```

- [ ] **Étape 5 : Remplacer le bloc d'appel IA dans form.submit par callDiagnose**

Dans `form.addEventListener('submit', async (e) => { ... })`, remplacer tout le bloc `try { ... } catch { }` (qui appelle directement Gemini/Claude/etc.) par :

```javascript
        try {
            const textResponse = await callDiagnose({ make, model, year, symptom, provider });

            const rawHtml = typeof window.marked !== 'undefined'
                ? window.marked.parse(textResponse)
                : `<pre style="white-space:pre-wrap;font-family:inherit;">${textResponse}</pre>`;
            const parsedHtml = typeof window.DOMPurify !== 'undefined'
                ? window.DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } })
                : rawHtml;

            resultContainer.innerHTML = parsedHtml;
            addSymptomChecks();
            const parts = detectParts(symptom, textResponse);
            diagPanelContent.innerHTML = buildPartsDiagram(parts, make, model, year);

            saveToHistory({ make, model, year, symptom, provider, result: textResponse });
            printBtn.classList.remove('hidden');

        } catch (error) {
            console.error('API Error:', error);
            let userMessage = error.message;
            if (error.message.includes('401') || error.message.toLowerCase().includes('unauthorized')) {
                userMessage = 'Session expirée. Reconnectez-vous.';
            } else if (error.message.includes('429') || error.message.toLowerCase().includes('quota')) {
                userMessage = 'Quota API dépassé. Réessayez dans quelques minutes.';
            } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                userMessage = 'Erreur réseau. Vérifiez votre connexion internet.';
            }
            resultContainer.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon" style="color: var(--error-color)">⚠️</span>
                    <p style="color: var(--error-color); font-weight: 600;">${escHtml(userMessage)}</p>
                    <p style="font-size: 0.8rem; margin-top: 0.5rem; color: var(--text-muted);">Détail : ${escHtml(error.message)}</p>
                </div>
            `;
            printBtn.classList.add('hidden');
        } finally {
            setLoading(false);
        }
```

**Note :** Les blocs `if (provider === 'gemini') { ... } else if ...` qui existaient peuvent être supprimés de app.js puisque toute la logique d'appel IA est maintenant dans `api.js` (si backend) ou dans `callPollinationsDirect` (si pas de backend).

- [ ] **Étape 6 : Supprimer le bloc de providers directs dans app.js**

Localiser et supprimer le bloc :
```
if (provider === 'pollinations') { ... }
else if (provider === 'gemini') { ... }
else if (provider === 'deepseek') { ... }
else if (provider === 'grok') { ... }
else if (provider === 'claude') { ... }
```
Ce code est maintenant dans `backend/routes/diagnose.js` et `api.js`.

- [ ] **Étape 7 : Vérifier que l'app fonctionne**

Ouvrir `index.html` dans le navigateur :
- Sans `BACKEND_URL` configuré → l'overlay de connexion N'apparaît pas → mode Pollinations direct
- Configurer une URL backend dans ⚙️ → recharger → l'overlay apparaît
- Se connecter → l'overlay disparaît, l'app est disponible

- [ ] **Étape 8 : Commit**

```bash
git add app.js
git commit -m "feat(frontend): integrate auth + api.js into app.js"
```

---

## Task 11 : Déploiement Railway

- [ ] **Étape 1 : Créer un fichier `.env` local pour tester (ne pas committer)**

```bash
cd backend
cp .env.example .env
# Éditer .env avec un JWT_SECRET réel et au moins une clé API
```

Générer un JWT_SECRET sécurisé :
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

- [ ] **Étape 2 : Tester le backend complet avec curl + token**

```bash
# 1. Démarrer le backend
cd backend && npm start

# 2. Créer un compte
TOKEN=$(curl -s -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"meca@garage.com","password":"mecanic123"}' | node -e "let d='';process.stdin.on('data',c=>d+=c).on('end',()=>console.log(JSON.parse(d).token))")

echo "Token: $TOKEN"

# 3. Faire un diagnostic (Pollinations, pas besoin de clé)
curl -X POST http://localhost:3001/api/diagnose \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"make":"Toyota","model":"Corolla","year":"2018","symptom":"P0171 mélange trop pauvre","provider":"pollinations"}'
# Attendu: {"result":"...texte markdown..."}
```

- [ ] **Étape 3 : Créer le projet Railway**

```bash
# Installer Railway CLI si pas déjà fait
npm install -g @railway/cli

# Login
railway login

# Initialiser depuis le dossier backend
cd backend
railway init
# Choisir "Empty project" + nom "amboul-mecanic-backend"
```

- [ ] **Étape 4 : Configurer les variables d'environnement sur Railway**

Dans le dashboard Railway (https://railway.app) → ton projet → Variables :

```
JWT_SECRET    = <résultat de la commande crypto.randomBytes ci-dessus>
FRONTEND_URL  = null
NODE_ENV      = production
GEMINI_API_KEY = <ta clé si disponible>
# etc.
```

- [ ] **Étape 5 : Déployer**

```bash
cd backend
railway up
```

Résultat attendu : URL publique du type `https://amboul-mecanic-backend.up.railway.app`

- [ ] **Étape 6 : Vérifier le déploiement**

```bash
curl https://amboul-mecanic-backend.up.railway.app/api/health
# Attendu: {"status":"ok","timestamp":"..."}
```

- [ ] **Étape 7 : Configurer le frontend**

Dans `index.html` → ⚙️ Paramètres → URL Backend :
```
https://amboul-mecanic-backend.up.railway.app
```

Sauvegarder → Recharger → L'overlay de connexion apparaît → Créer un compte → Diagnostic fonctionnel.

- [ ] **Étape 8 : Commit final**

```bash
git add backend/
git commit -m "feat: complete backend proxy with Railway deployment"
git push
```

---

## Auto-revue du plan

**Spec coverage :**
- ✅ POST /api/auth/register → Task 4
- ✅ POST /api/auth/login → Task 4
- ✅ POST /api/diagnose → Task 5
- ✅ GET /api/health → Task 6
- ✅ SQLite + migration → Task 2
- ✅ JWT middleware → Task 3
- ✅ bcrypt, salt 12 → Task 4
- ✅ Rate limiting 20/min → Task 6
- ✅ CORS + null origin → Task 6
- ✅ Validation inputs → Tasks 4, 5
- ✅ 503 si clé manquante → Task 5
- ✅ Overlay login/register → Tasks 8, 9, 10
- ✅ Fallback Pollinations sans backend → Tasks 7, 10
- ✅ Modal ⚙️ simplifié → Task 8
- ✅ Logout → Task 10
- ✅ JWT expiré → logout auto → Task 7 (api.js)
- ✅ Railway déploiement → Task 11

**Type consistency :**
- `getBackendUrl()` défini dans `auth.js`, utilisé dans `api.js` et `app.js` ✓
- `getToken()` défini dans `auth.js`, utilisé dans `api.js` ✓
- `logout()` défini dans `auth.js`, utilisé dans `api.js` et `app.js` ✓
- `callDiagnose()` défini dans `api.js`, utilisé dans `app.js` ✓
