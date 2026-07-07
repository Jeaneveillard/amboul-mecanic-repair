// ===== Constantes localStorage =====
const AUTH_TOKEN_KEY    = 'amboul_jwt';
const AUTH_USER_KEY     = 'amboul_user';
const BACKEND_URL_KEY   = 'amboul_backend_url';
const LAST_ACTIVITY_KEY = 'amboul_last_activity';

// Délai d'inactivité avant déconnexion automatique (30 minutes)
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

function updateLastActivity() {
    localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
}

function isIdleExpired() {
    if (!isLoggedIn()) return false;
    const last = parseInt(localStorage.getItem(LAST_ACTIVITY_KEY) || '0');
    if (!last) return false;
    return Date.now() - last > IDLE_TIMEOUT_MS;
}

// Email de l'administrateur (correspond à ADMIN_EMAIL dans backend/.env)
const ADMIN_EMAIL = 'jeaneveillard@gmail.com';

function isAdmin() {
    return getUser() === ADMIN_EMAIL;
}

// ===== Getters =====
function getToken()      { return localStorage.getItem(AUTH_TOKEN_KEY); }
function getUser()       { return localStorage.getItem(AUTH_USER_KEY); }
function getBackendUrl() { return localStorage.getItem(BACKEND_URL_KEY) || 'https://amboul-mecanic-repair.onrender.com'; }
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
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    sessionStorage.removeItem('amboul_free_mode');
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
