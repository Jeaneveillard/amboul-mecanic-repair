# Panneau Admin — Gestion des mécaniciens

Date: 2026-05-30

## Objectif

Permettre à l'admin (jeaneveillard@gmail.com) de créer et révoquer les comptes mécaniciens. La self-registration publique est désactivée — seul l'admin crée les comptes.

---

## Architecture

```
Frontend                          Backend
─────────────────────────────     ─────────────────────────────────────
Onglet 👑 Admin (admin only)  →  GET    /api/admin/users     (liste)
Formulaire créer compte       →  POST   /api/admin/users     (créer)
Bouton Révoquer               →  DELETE /api/admin/users/:id (révoquer)

Identification admin : JWT email === process.env.ADMIN_EMAIL
```

---

## Changements backend

### Variable d'environnement
```env
ADMIN_EMAIL=jeaneveillard@gmail.com
```

### Middleware admin (`backend/middleware/adminAuth.js`)
```javascript
function requireAdmin(req, res, next) {
    if (req.user?.email !== process.env.ADMIN_EMAIL) {
        return res.status(403).json({ error: 'Accès réservé à l\'administrateur' });
    }
    next();
}
```

Appliqué après `requireAuth` sur toutes les routes `/api/admin/*`.

### Nouvelles routes (`backend/routes/admin.js`)

**GET /api/admin/users** — liste tous les comptes (sauf admin)
- Réponse : `[{ id, email, created_at }]`

**POST /api/admin/users** — créer un compte mécanicien
- Corps : `{ email, password }`
- Validation : email format + unique, password >= 8 chars
- Réponse 201 : `{ id, email, created_at }`
- Erreurs : 400 (validation), 409 (email existant)

**DELETE /api/admin/users/:id** — révoquer un compte
- Garde : ne peut pas supprimer son propre compte (ADMIN_EMAIL)
- Réponse 200 : `{ message: 'Compte révoqué' }`
- Erreurs : 400 (tentative self-delete), 404 (user introuvable)

### `backend/server.js`
Ajouter :
```javascript
const adminRoutes = require('./routes/admin');
app.use('/api/admin', requireAuth, adminRoutes);
```

---

## Changements frontend

### Écran de connexion — supprimer self-registration

Dans `index.html`, masquer le bouton "Créer un compte" :
- Supprimer `authToggleBtn` (le bouton "Créer un compte")
- Supprimer `authToggleText` ("Pas encore de compte ?")
- Supprimer le mode `register` de `app.js`
- L'overlay ne montre plus que : Email + Mot de passe + Se connecter + Mode gratuit

### Onglet Admin dans le header

Après connexion, si `getUser() === ADMIN_EMAIL` (vérifié côté frontend depuis localStorage) :
```html
<button type="button" class="nav-btn" data-section="admin" id="adminNavBtn">👑 Admin</button>
```
Caché par défaut (`hidden`), affiché si admin.

### Section Admin (`#section-admin`)

```html
<section id="section-admin" class="app-section hidden">
    <div class="section-content glass-panel">
        <h2>👑 Gestion des mécaniciens</h2>
        <!-- Formulaire création -->
        <div class="admin-create-form">
            <h3>Créer un compte</h3>
            <div id="adminCreateError" class="error-inline hidden"></div>
            <div id="adminCreateSuccess" class="success-inline hidden"></div>
            <input type="email" id="adminEmail" placeholder="mecanicien@garage.com">
            <input type="password" id="adminPassword" placeholder="Mot de passe (min. 8 caractères)">
            <button type="button" id="adminCreateBtn" class="btn primary-btn">+ Créer le compte</button>
        </div>
        <!-- Liste des comptes -->
        <div class="admin-users-list" id="adminUsersList">
            <h3>Comptes actifs</h3>
            <div id="adminUsersContainer"></div>
        </div>
    </div>
</section>
```

### `app.js` — logique admin

```javascript
async function loadAdminPanel() {
    const resp = await fetch(`${getBackendUrl()}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const users = await resp.json();
    // Render user list with revoke buttons
}

async function adminCreateUser(email, password) {
    const resp = await fetch(`${getBackendUrl()}/api/admin/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify({ email, password })
    });
    return resp.json();
}

async function adminRevokeUser(id) {
    const resp = await fetch(`${getBackendUrl()}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return resp.json();
}
```

### Détection admin côté frontend

Après login/au chargement :
```javascript
function isAdmin() {
    return getUser() === (/* ADMIN_EMAIL stocké dans auth.js ou constante */);
}
```

**Note :** L'email admin est visible en localStorage côté client — c'est acceptable puisque la vraie protection est côté serveur (le middleware `requireAdmin` vérifie le JWT).

---

## Fichiers modifiés/créés

| Fichier | Action |
|---------|--------|
| `backend/.env` | Ajouter `ADMIN_EMAIL=jeaneveillard@gmail.com` |
| `backend/middleware/adminAuth.js` | Créer — middleware vérification admin |
| `backend/routes/admin.js` | Créer — GET/POST/DELETE /api/admin/users |
| `backend/server.js` | Modifier — ajouter routes admin |
| `index.html` | Modifier — onglet Admin + section admin + simplifier overlay login |
| `app.js` | Modifier — logique admin + masquer register + affichage conditionnel onglet |
| `style.css` | Modifier — styles panneau admin |
| `auth.js` | Modifier — constante ADMIN_EMAIL + fonction isAdmin() |

---

## Contraintes

- L'admin ne peut pas supprimer son propre compte
- La clé `ADMIN_EMAIL` doit être dans `backend/.env` (Railway variables en prod)
- Le JWT des mécaniciens révoqués expire naturellement en 24h (pas d'invalidation immédiate — acceptable pour un garage)
- La self-registration est désactivée côté UI uniquement — un appel direct à `POST /api/auth/register` resterait possible. Pour une sécurité totale, désactiver aussi la route `/api/auth/register` côté backend.
