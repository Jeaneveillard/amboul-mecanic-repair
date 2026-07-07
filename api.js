// Dépend de auth.js chargé avant dans index.html
// Le prompt système (SYSTEM_PROMPT) vit côté backend : backend/routes/diagnose.js.
// Aucun prompt ni clé API dans le frontend.

async function callDiagnose({ make, model, year, symptom, provider }) {
    const backendUrl = getBackendUrl();

    // Sans backend OU sans compte (mode gratuit) → Pollinations direct.
    // getBackendUrl() retourne toujours une URL par défaut : c'est l'absence
    // de token qui identifie le mode « Continuer sans compte ».
    if (!backendUrl || !isLoggedIn()) {
        return callPollinationsDirect({ make, model, year, symptom });
    }

    const resp = await fetch(`${backendUrl}/api/diagnose`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ make, model, year, symptom, provider, lang: typeof getLang === 'function' ? getLang() : 'fr' })
    });

    if (resp.status === 401) {
        logout();
        throw new Error('Session expirée. Reconnectez-vous.');
    }

    if (!resp.ok) {
        const e = await resp.json().catch(() => ({}));
        throw new Error(e.error || `Erreur serveur (${resp.status})`);
    }

    const data = await resp.json();
    return data.result;
}

// Mode « sans compte » : Pollinations bloque désormais les appels directs
// depuis le navigateur (Cloudflare Turnstile) — on passe par la route
// publique du backend, qui appelle Pollinations côté serveur.
async function callPollinationsDirect({ make, model, year, symptom }) {
    const backendUrl = getBackendUrl();
    if (!backendUrl) throw new Error('URL backend non configurée dans ⚙️ Paramètres');
    const resp = await fetch(`${backendUrl}/api/diagnose/free`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ make, model, year, symptom, lang: typeof getLang === 'function' ? getLang() : 'fr' })
    });
    if (!resp.ok) {
        const e = await resp.json().catch(() => ({}));
        throw new Error(e.error || `[Pollinations] Erreur serveur (${resp.status})`);
    }
    const data = await resp.json();
    return data.result;
}
