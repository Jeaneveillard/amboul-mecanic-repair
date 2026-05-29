# Backend Proxy — Amboul Mecanic Repair

Date: 2026-05-29

## Objectif

Créer un backend Node.js + Express déployé sur Railway qui sert de proxy sécurisé entre le frontend et les APIs IA. Les clés API quittent le navigateur et sont stockées comme variables d'environnement sur le serveur. Les utilisateurs s'authentifient via JWT.

---

## Architecture

```
frontend (index.html) ──HTTPS──► backend (Railway / localhost)
                                       ├── /api/auth/register
                                       ├── /api/auth/login
                                       └── /api/diagnose ──► Gemini / Claude / DeepSeek / Grok / Pollinations
                                       │
                                  SQLite (users)
                                  .env (API keys)
```

---

## Structure des fichiers

```
backend/
├── server.js                 — point d'entrée Express
├── db.js                     — SQLite init + migration
├── middleware/
│   └── auth.js               — vérification JWT
├── routes/
│   ├── auth.js               — POST /api/auth/register, POST /api/auth/login
│   └── diagnose.js           — POST /api/diagnose
├── .env.example              — template variables d'environnement
├── package.json
└── railway.json              — config déploiement Railway
```

**Fichiers frontend ajoutés :**
```
auth.js     — login(), register(), logout(), getToken(), isLoggedIn()
api.js      — callDiagnose() avec header Authorization
```

**Fichiers frontend modifiés :**
```
index.html  — écran login/register + modal simplifié
app.js      — bloc form.submit délègue à callDiagnose() depuis api.js
style.css   — styles écran de connexion
```

---

## Base de données SQLite

```sql
CREATE TABLE IF NOT EXISTS users (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    email        TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Migration automatique au démarrage du serveur via `db.js`.

---

## Endpoints API

### POST /api/auth/register
**Corps :** `{ email: string, password: string }`
**Validation :** email format valide, password >= 8 chars
**Réponse 201 :** `{ token: string, email: string }`
**Erreurs :** 400 (validation), 409 (email existant)

### POST /api/auth/login
**Corps :** `{ email: string, password: string }`
**Réponse 200 :** `{ token: string, email: string }`
**Erreurs :** 400 (validation), 401 (mauvais identifiants)

### POST /api/diagnose
**Auth :** `Authorization: Bearer <token>`
**Corps :** `{ make, model, year, symptom, provider }`
**Validation :**
- `provider` ∈ `["pollinations","gemini","claude","deepseek","grok"]`
- `make`, `model`, `year`, `symptom` : requis, non vides, max 500 chars

**Réponse 200 :** `{ result: string }` (texte markdown du diagnostic)
**Erreurs :** 400 (validation), 401 (JWT), 503 (clé IA manquante)

### GET /api/health
**Réponse 200 :** `{ status: "ok", timestamp: string }`

---

## Sécurité

| Mesure | Détail |
|--------|--------|
| Hachage mot de passe | bcrypt, salt rounds = 12 |
| JWT | Signé avec `JWT_SECRET`, expiry 24h |
| CORS | Restreint à `FRONTEND_URL`; accepte aussi `null` (origine `file://` locale) |
| Rate limiting | 20 req/min par IP (express-rate-limit) |
| Clés IA | Jamais renvoyées au client |
| Validation | express-validator sur tous les inputs |

---

## Variables d'environnement

```env
# Obligatoires
PORT=3000
JWT_SECRET=<secret_aléatoire_long>
FRONTEND_URL=https://jeaneveillard.github.io  # ou file:// pour local

# Clés IA (au moins une recommandée)
GEMINI_API_KEY=
CLAUDE_API_KEY=
DEEPSEEK_API_KEY=
GROK_API_KEY=

# SQLite path (optionnel, défaut: ./amboul.db)
DB_PATH=./amboul.db
```

---

## Comportement frontend

**Flux de connexion :**
1. App charge → `isLoggedIn()` vérifie le JWT dans localStorage
2. Si non connecté → écran login/register affiché (overlay)
3. Après login → JWT stocké, overlay masqué, app normale

**Écran login/register :**
- Deux modes : Connexion / Créer un compte (toggle)
- Champs : email + mot de passe
- Messages d'erreur inline (email invalide, mot de passe trop court, etc.)

**Modal ⚙️ simplifié :**
- Email de l'utilisateur connecté
- Champ `URL Backend` (défaut vide = Railway, modifiable pour localhost)
- Bouton Déconnexion (efface JWT, réaffiche l'écran de login)

**Fallback :**
- Si `BACKEND_URL` non défini → Pollinations direct (mode sans compte)
- Si JWT expiré (401) → logout automatique + écran login

**api.js (callDiagnose) :**
```javascript
async function callDiagnose({ make, model, year, symptom, provider }) {
    const backendUrl = localStorage.getItem('backend_url') || '';
    if (!backendUrl) {
        // Fallback Pollinations direct
        return callPollinationsDirect({ make, model, year, symptom }); // code Pollinations extrait de app.js
    }
    const response = await fetch(`${backendUrl}/api/diagnose`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ make, model, year, symptom, provider })
    });
    if (response.status === 401) { logout(); throw new Error('Session expirée'); }
    if (!response.ok) { const e = await response.json(); throw new Error(e.error); }
    const data = await response.json();
    return data.result;
}
```

---

## Déploiement Railway

1. `railway login` dans le terminal
2. `cd backend && railway init`
3. Configurer les variables d'environnement dans le dashboard Railway
4. `railway up` ou push GitHub → auto-deploy
5. Récupérer l'URL publique (ex: `https://amboul-backend.up.railway.app`)
6. Configurer `BACKEND_URL` dans le frontend

---

## Dépendances backend

```json
{
  "dependencies": {
    "express": "^4.18",
    "better-sqlite3": "^9.4",
    "bcryptjs": "^2.4",
    "jsonwebtoken": "^9.0",
    "express-validator": "^7.0",
    "express-rate-limit": "^7.0",
    "cors": "^2.8",
    "dotenv": "^16.0"
  }
}
```

---

## Contraintes

- Le backend ne stocke JAMAIS le texte des diagnostics (privacy)
- SQLite convient pour < 1 000 utilisateurs actifs
- Le frontend reste 100% fonctionnel en mode Pollinations sans backend
- La structure `backend/` est un sous-dossier du repo existant
