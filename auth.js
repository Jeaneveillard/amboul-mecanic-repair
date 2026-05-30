// ===== Constantes localStorage =====
const AUTH_TOKEN_KEY  = 'amboul_jwt';
const AUTH_USER_KEY   = 'amboul_user';
const BACKEND_URL_KEY = 'amboul_backend_url';

// ===== Getters =====
function getToken()      { return localStorage.getItem(AUTH_TOKEN_KEY); }
function getUser()       { return localStorage.getItem(AUTH_USER_KEY); }
function getBackendUrl() { return localStorage.getItem(BACKEND_URL_KEY) || 'https://amboul-mecanic-repair-production.up.railway.app'; }
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
