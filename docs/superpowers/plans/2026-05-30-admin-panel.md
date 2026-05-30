# Panneau Admin — Gestion des mécaniciens

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Permettre à l'admin (jeaneveillard@gmail.com) de créer et révoquer des comptes mécaniciens depuis un onglet Admin, en désactivant la self-registration publique.

**Architecture:** Backend Express ajoute `adminAuth.js` middleware + `/api/admin/users` routes. Frontend ajoute section admin visible seulement pour l'admin email. Self-registration désactivée côté UI et backend.

**Tech Stack:** Node.js, Express, better-sqlite3/sqlite, bcryptjs, JWT, Vanilla JS.

---

## Fichiers

| Fichier | Action |
|---------|--------|
| `backend/middleware/adminAuth.js` | Créer |
| `backend/routes/admin.js` | Créer |
| `backend/routes/auth.js` | Modifier — désactiver register |
| `backend/server.js` | Modifier — monter routes admin |
| `backend/.env` | Modifier — ajouter ADMIN_EMAIL |
| `auth.js` | Modifier — isAdmin() + ADMIN_EMAIL |
| `index.html` | Modifier — admin nav + section + simplifier overlay |
| `app.js` | Modifier — logique admin + masquer register |
| `style.css` | Modifier — styles panneau admin |

---

## Task 1 : Backend — middleware adminAuth + routes admin + désactiver register

**Fichiers :**
- Créer : `backend/middleware/adminAuth.js`
- Créer : `backend/routes/admin.js`
- Modifier : `backend/server.js`
- Modifier : `backend/routes/auth.js`
- Modifier : `backend/.env`

- [ ] **Étape 1 : Ajouter `ADMIN_EMAIL` dans `backend/.env`**

Ouvrir `backend/.env` et ajouter la ligne :
```
ADMIN_EMAIL=jeaneveillard@gmail.com
```

- [ ] **Étape 2 : Créer `backend/middleware/adminAuth.js`**

```javascript
function requireAdmin(req, res, next) {
    if (!process.env.ADMIN_EMAIL) {
        return res.status(500).json({ error: 'ADMIN_EMAIL non configuré sur le serveur' });
    }
    if (req.user?.email !== process.env.ADMIN_EMAIL) {
        return res.status(403).json({ error: 'Accès réservé à l\'administrateur' });
    }
    next();
}

module.exports = { requireAdmin };
```

- [ ] **Étape 3 : Créer `backend/routes/admin.js`**

```javascript
const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db');
const { requireAdmin } = require('../middleware/adminAuth');

const router = express.Router();

function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: errors.array()[0].msg });
    next();
}

// GET /api/admin/users — liste tous les comptes sauf admin
router.get('/users', requireAdmin, async (req, res) => {
    try {
        const db = await getDb();
        const users = await db.all(
            'SELECT id, email, created_at FROM users WHERE email != ? ORDER BY created_at DESC',
            [process.env.ADMIN_EMAIL]
        );
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST /api/admin/users — créer un compte mécanicien
router.post('/users',
    requireAdmin,
    body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Mot de passe minimum 8 caractères'),
    validate,
    async (req, res) => {
        try {
            const { email, password } = req.body;
            const db = await getDb();
            const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
            if (existing) return res.status(409).json({ error: 'Email déjà utilisé' });
            const hash = await bcrypt.hash(password, 12);
            const result = await db.run(
                'INSERT INTO users (email, password_hash) VALUES (?, ?)',
                [email, hash]
            );
            const user = await db.get(
                'SELECT id, email, created_at FROM users WHERE id = ?',
                [result.lastID]
            );
            res.status(201).json(user);
        } catch (err) {
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
);

// DELETE /api/admin/users/:id — révoquer un compte
router.delete('/users/:id', requireAdmin, async (req, res) => {
    try {
        const db = await getDb();
        const user = await db.get('SELECT id, email FROM users WHERE id = ?', [req.params.id]);
        if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
        if (user.email === process.env.ADMIN_EMAIL) {
            return res.status(400).json({ error: 'Impossible de révoquer le compte administrateur' });
        }
        await db.run('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'Compte révoqué avec succès' });
    } catch (err) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
```

- [ ] **Étape 4 : Monter les routes admin dans `backend/server.js`**

Après les imports existants, ajouter :
```javascript
const adminRoutes = require('./routes/admin');
const { requireAuth } = require('./middleware/auth');
```

Après la ligne `app.use('/api/auth', authRoutes);`, ajouter :
```javascript
app.use('/api/admin', requireAuth, adminRoutes);
```

- [ ] **Étape 5 : Désactiver la self-registration dans `backend/routes/auth.js`**

Commenter ou remplacer la route `router.post('/register', ...)` par :
```javascript
// Self-registration désactivée — les comptes sont créés par l'admin via /api/admin/users
router.post('/register', (req, res) => {
    res.status(403).json({ error: 'L\'inscription publique est désactivée. Contactez l\'administrateur.' });
});
```

- [ ] **Étape 6 : Redémarrer et tester avec curl**

```bash
# Redémarrer le backend
cd "C:/Users/jeane/Desktop/Amboul/Amboul Mecanic repair/backend"
taskkill /F /IM node.exe
npm start

# Login admin pour obtenir un token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"jeaneveillard@gmail.com\",\"password\":\"MON_MDP\"}"
# → copier le token

# Créer un compte mécanicien
curl -X POST http://localhost:3000/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d "{\"email\":\"meca1@garage.com\",\"password\":\"meca12345\"}"
# → {"id":2,"email":"meca1@garage.com","created_at":"..."}

# Lister les comptes
curl http://localhost:3000/api/admin/users \
  -H "Authorization: Bearer TOKEN"
# → [{"id":2,"email":"meca1@garage.com","created_at":"..."}]

# Révoquer
curl -X DELETE http://localhost:3000/api/admin/users/2 \
  -H "Authorization: Bearer TOKEN"
# → {"message":"Compte révoqué avec succès"}

# Test self-register désactivé
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"hack@test.com\",\"password\":\"password1\"}"
# → {"error":"L'inscription publique est désactivée..."}
```

- [ ] **Étape 7 : Commit**

```bash
cd "C:/Users/jeane/Desktop/Amboul/Amboul Mecanic repair"
git add backend/middleware/adminAuth.js backend/routes/admin.js backend/routes/auth.js backend/server.js backend/.env
git commit -m "feat(admin): backend admin routes + disable self-registration"
```

---

## Task 2 : Frontend — auth.js + isAdmin()

**Fichiers :**
- Modifier : `auth.js`

- [ ] **Étape 1 : Ajouter ADMIN_EMAIL et isAdmin() dans `auth.js`**

En haut du fichier, après les constantes existantes, ajouter :
```javascript
// Email de l'administrateur (doit correspondre à ADMIN_EMAIL dans backend/.env)
const ADMIN_EMAIL = 'jeaneveillard@gmail.com';

function isAdmin() {
    return getUser() === ADMIN_EMAIL;
}
```

- [ ] **Étape 2 : Commit**

```bash
git add auth.js
git commit -m "feat(admin): isAdmin() in auth.js"
```

---

## Task 3 : Frontend — index.html (onglet Admin + section admin + overlay simplifié)

**Fichiers :**
- Modifier : `index.html`

- [ ] **Étape 1 : Ajouter le bouton Admin dans le header**

Dans le `<nav class="header-nav">`, après le bouton historique, ajouter :
```html
                <button type="button" class="nav-btn hidden" data-section="admin" id="adminNavBtn">👑 Admin</button>
```

- [ ] **Étape 2 : Ajouter la section Admin après la section Historique**

Après la section `#section-historique`, ajouter :
```html
        <!-- Section: Admin -->
        <section id="section-admin" class="app-section hidden">
            <div class="section-content glass-panel admin-panel">
                <h2>👑 Gestion des mécaniciens</h2>

                <div class="admin-create-section">
                    <h3>Créer un compte</h3>
                    <div id="adminCreateError" class="error-inline hidden"></div>
                    <div id="adminCreateSuccess" class="success-inline hidden"></div>
                    <div class="form-group">
                        <label for="adminNewEmail">Email du mécanicien</label>
                        <input type="email" id="adminNewEmail" placeholder="mecanicien@garage.com">
                    </div>
                    <div class="form-group">
                        <label for="adminNewPassword">Mot de passe à lui donner</label>
                        <input type="text" id="adminNewPassword" placeholder="Minimum 8 caractères">
                    </div>
                    <button type="button" id="adminCreateBtn" class="btn primary-btn">+ Créer le compte</button>
                </div>

                <div class="admin-users-section">
                    <h3 id="adminUsersTitle">Comptes actifs</h3>
                    <div id="adminUsersContainer" class="admin-users-list"></div>
                </div>
            </div>
        </section>
```

**Note :** Le mot de passe est un `type="text"` pour que l'admin puisse le voir et le copier-coller pour le donner au mécanicien.

- [ ] **Étape 3 : Simplifier l'overlay de connexion — supprimer le toggle register**

Dans le `<div id="authOverlay">`, supprimer complètement le bloc :
```html
            <div class="auth-footer">
                <span id="authToggleText">Pas encore de compte ?</span>
                <button type="button" class="auth-toggle-btn" id="authToggleBtn">Créer un compte</button>
            </div>
```

L'overlay garde seulement : Logo + Subtitle + Formulaire + Mode gratuit.

- [ ] **Étape 4 : Commit**

```bash
git add index.html
git commit -m "feat(admin): admin section + nav tab + simplified login overlay"
```

---

## Task 4 : Frontend — app.js (logique admin + nettoyage register)

**Fichiers :**
- Modifier : `app.js`

- [ ] **Étape 1 : Supprimer la logique du toggle register**

Supprimer les références à `authToggleBtn`, `authToggleText`, et le code du listener :
```javascript
// SUPPRIMER ces lignes :
const authToggleBtn  = document.getElementById('authToggleBtn');
const authToggleText = document.getElementById('authToggleText');
let authMode = 'login';
authToggleBtn?.addEventListener('click', () => { ... });
```

Et dans le `authForm.addEventListener('submit', ...)`, remplacer :
```javascript
authMode === 'login' ? await login(email, password) : await register(email, password);
```
Par simplement :
```javascript
await login(email, password);
```

- [ ] **Étape 2 : Afficher le bouton Admin si admin**

Dans la section `// ===== Initialisation Auth =====`, après le `if (!isLoggedIn() && getBackendUrl())`, ajouter :
```javascript
    // Afficher l'onglet Admin si connecté en tant qu'admin
    if (isAdmin() && getBackendUrl()) {
        document.getElementById('adminNavBtn')?.classList.remove('hidden');
    }
```

Et dans `authForm.addEventListener('submit', ...)`, après `hideAuthOverlay()`, ajouter :
```javascript
            if (isAdmin() && getBackendUrl()) {
                document.getElementById('adminNavBtn')?.classList.remove('hidden');
            }
```

- [ ] **Étape 3 : Charger les utilisateurs quand la section admin est affichée**

Dans la fonction `showSection(sectionId)`, ajouter à la fin :
```javascript
        if (sectionId === 'admin' && isAdmin()) {
            loadAdminUsers();
        }
```

- [ ] **Étape 4 : Ajouter la logique admin en bas de app.js (avant le dernier `}`)**

Ajouter juste avant le dernier `});` fermant le `DOMContentLoaded` :

```javascript
    // ===== Panneau Admin =====
    const adminCreateBtn       = document.getElementById('adminCreateBtn');
    const adminNewEmail        = document.getElementById('adminNewEmail');
    const adminNewPassword     = document.getElementById('adminNewPassword');
    const adminCreateError     = document.getElementById('adminCreateError');
    const adminCreateSuccess   = document.getElementById('adminCreateSuccess');
    const adminUsersContainer  = document.getElementById('adminUsersContainer');
    const adminUsersTitle      = document.getElementById('adminUsersTitle');

    async function loadAdminUsers() {
        if (!adminUsersContainer) return;
        try {
            const resp = await fetch(`${getBackendUrl()}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            if (!resp.ok) {
                adminUsersContainer.innerHTML = '<p class="admin-empty">Erreur de chargement.</p>';
                return;
            }
            const users = await resp.json();
            if (adminUsersTitle) adminUsersTitle.textContent = `Comptes actifs (${users.length})`;
            if (users.length === 0) {
                adminUsersContainer.innerHTML = '<p class="admin-empty">Aucun mécanicien enregistré.</p>';
                return;
            }
            adminUsersContainer.innerHTML = users.map(u => `
                <div class="admin-user-row">
                    <div class="admin-user-info">
                        <span class="admin-user-email">📧 ${escHtml(u.email)}</span>
                        <span class="admin-user-date">Créé le ${new Date(u.created_at).toLocaleDateString('fr-CA')}</span>
                    </div>
                    <button type="button" class="btn danger-btn admin-revoke-btn"
                        onclick="adminRevoke(${u.id}, '${escHtml(u.email)}')">
                        Révoquer
                    </button>
                </div>
            `).join('');
        } catch (err) {
            adminUsersContainer.innerHTML = '<p class="admin-empty">Erreur réseau.</p>';
        }
    }

    window.adminRevoke = async function(id, email) {
        if (!confirm(`Révoquer l'accès de ${email} ?\n\nCette action est irréversible.`)) return;
        const resp = await fetch(`${getBackendUrl()}/api/admin/users/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${getToken()}` }
        });
        const data = await resp.json();
        if (resp.ok) {
            await loadAdminUsers();
        } else {
            alert(data.error || 'Erreur lors de la révocation');
        }
    };

    adminCreateBtn?.addEventListener('click', async () => {
        if (!adminCreateError || !adminCreateSuccess) return;
        adminCreateError.classList.add('hidden');
        adminCreateSuccess.classList.add('hidden');

        const email    = adminNewEmail?.value.trim() || '';
        const password = adminNewPassword?.value || '';

        if (!email || !password) {
            adminCreateError.textContent = 'Email et mot de passe requis.';
            adminCreateError.classList.remove('hidden');
            return;
        }

        adminCreateBtn.disabled = true;
        const origText = adminCreateBtn.textContent;
        adminCreateBtn.textContent = '...';

        const resp = await fetch(`${getBackendUrl()}/api/admin/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ email, password })
        });
        const data = await resp.json();
        adminCreateBtn.disabled = false;
        adminCreateBtn.textContent = origText;

        if (resp.ok) {
            if (adminNewEmail)    adminNewEmail.value    = '';
            if (adminNewPassword) adminNewPassword.value = '';
            adminCreateSuccess.textContent = `✅ Compte créé pour ${escHtml(data.email)} — mot de passe : ${escHtml(password)}`;
            adminCreateSuccess.classList.remove('hidden');
            await loadAdminUsers();
        } else {
            adminCreateError.textContent = data.error || 'Erreur lors de la création du compte.';
            adminCreateError.classList.remove('hidden');
        }
    });
```

**Note :** Le mot de passe est affiché dans le message de succès pour que l'admin puisse le copier et le donner au mécanicien.

- [ ] **Étape 5 : Vérifier dans le navigateur**

1. Ouvrir `index.html` → l'overlay de connexion n'a plus le bouton "Créer un compte" ✓
2. Se connecter avec `jeaneveillard@gmail.com` → l'onglet "👑 Admin" apparaît ✓
3. Cliquer Admin → formulaire de création visible ✓
4. Créer un compte mécanicien → le compte apparaît dans la liste ✓
5. Révoquer → la liste se met à jour ✓
6. Se connecter avec un autre email → pas d'onglet Admin ✓

- [ ] **Étape 6 : Commit**

```bash
git add app.js
git commit -m "feat(admin): admin panel logic in app.js + remove self-registration"
```

---

## Task 5 : Frontend — style.css (styles panneau admin)

**Fichiers :**
- Modifier : `style.css`

- [ ] **Étape 1 : Ajouter les styles admin avant `/* ===== IMPRESSION =====`**

```css
/* ===== PANNEAU ADMIN ===== */
.admin-panel {
    max-width: 700px;
    margin: 0 auto;
}

.admin-panel h2 {
    margin-bottom: 2rem;
}

.admin-create-section {
    background: rgba(0,0,0,0.15);
    border: 1px solid var(--glass-border);
    border-radius: 10px;
    padding: 1.5rem;
    margin-bottom: 2rem;
}

.admin-create-section h3 {
    font-size: 1rem;
    margin-bottom: 1rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.75rem;
}

.admin-users-section h3 {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-muted);
    margin-bottom: 1rem;
}

.admin-users-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.admin-user-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(0,0,0,0.15);
    border: 1px solid var(--glass-border);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    gap: 1rem;
}

.admin-user-info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    flex: 1;
    min-width: 0;
}

.admin-user-email {
    font-weight: 600;
    font-size: 0.9rem;
    color: var(--text-main);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.admin-user-date {
    font-size: 0.72rem;
    color: var(--text-muted);
}

.admin-revoke-btn {
    width: auto;
    padding: 0.4rem 0.85rem;
    font-size: 0.8rem;
    flex-shrink: 0;
}

.admin-empty {
    color: var(--text-muted);
    text-align: center;
    padding: 2rem;
    font-size: 0.875rem;
}

.success-inline {
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.3);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    color: var(--accent-color);
    font-size: 0.875rem;
    margin-bottom: 1rem;
    word-break: break-all;
}

@media (max-width: 768px) {
    .admin-user-row {
        flex-direction: column;
        align-items: flex-start;
    }
    .admin-revoke-btn {
        width: 100%;
        text-align: center;
    }
}
```

- [ ] **Étape 2 : Commit + push**

```bash
git add style.css
git commit -m "feat(admin): admin panel CSS styles"
git push
```

---

## Auto-revue

**Spec coverage :**
- ✅ Admin identifié par email (`ADMIN_EMAIL`) → Task 1 + Task 2
- ✅ Onglet Admin visible seulement pour l'admin → Task 3 + Task 4
- ✅ Formulaire créer compte → Task 3 (HTML) + Task 4 (JS) + Task 1 (backend POST)
- ✅ Liste des mécaniciens → Task 4 (`loadAdminUsers`) + Task 1 (backend GET)
- ✅ Révoquer un compte → Task 4 (`adminRevoke`) + Task 1 (backend DELETE)
- ✅ Impossible révoquer son propre compte → Task 1 backend (garde email)
- ✅ Self-registration désactivée UI → Task 3 (supprimer toggle HTML) + Task 4 (supprimer mode register)
- ✅ Self-registration désactivée backend → Task 1 (route register retourne 403)
- ✅ Mot de passe visible pour copier → Task 3 (`type="text"`) + Task 4 (affiché dans succès)
- ✅ Styles mobile admin → Task 5

**Type consistency :**
- `loadAdminUsers()` définie Task 4, appelée dans `showSection()` Task 4 ✓
- `window.adminRevoke(id, email)` définie Task 4, appelée inline onclick Task 4 ✓
- `escHtml()` déjà définie dans app.js ✓
- `getBackendUrl()`, `getToken()`, `isAdmin()` dans auth.js Tasks 2 ✓
