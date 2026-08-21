require('dotenv').config({ quiet: true });
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Validation des variables critiques au démarrage
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
    console.error('❌ JWT_SECRET manquant ou trop court — arrêt du serveur.');
    process.exit(1);
}
if (!process.env.ADMIN_EMAIL) {
    console.error('❌ ADMIN_EMAIL manquant — arrêt du serveur.');
    process.exit(1);
}
if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL manquant — arrêt du serveur.');
    process.exit(1);
}

const authRoutes = require('./routes/auth');
const diagnoseRoutes = require('./routes/diagnose');
const adminRoutes = require('./routes/admin');
const { requireAuth } = require('./middleware/auth');
const { initDb } = require('./db');

const app = express();

// Derrière le proxy Render/Railway : sans ceci, express-rate-limit voit
// l'IP du proxy pour tout le monde (limite partagée entre tous les utilisateurs).
app.set('trust proxy', 1);

// CORS — headers manuels (le plus fiable sur Render/Railway).
// ALLOWED_ORIGINS (liste séparée par virgules, ex: "https://jeaneveillard.github.io")
// restreint l'accès aux origines listées. Non définie → ouvert à tous (*)
// pour ne pas casser un déploiement existant.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim().replace(/\/$/, ''))
    .filter(Boolean);

app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.length === 0) {
        res.header('Access-Control-Allow-Origin', '*');
    } else if (origin && allowedOrigins.includes(origin.replace(/\/$/, ''))) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Vary', 'Origin');
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.status(204).send();
    next();
});

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

// Rate limiting ultra-strict pour la route setup (3/min — anti DoS bcrypt)
const setupLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Trop de tentatives de configuration.' }
});

// Rate limiting strict pour le mode sans compte (5/min — route publique)
const freeLimit = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Limite du mode gratuit atteinte (5/minute). Réessayez dans une minute.' }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth/setup', setupLimit);
app.use('/api/auth', authRoutes);
app.use('/api/admin', requireAuth, adminRoutes);
app.use('/api/diagnose/free', freeLimit);
app.use('/api/diagnose', diagnoseLimit, diagnoseRoutes);

// 404
app.use((req, res) => res.status(404).json({ error: 'Route introuvable' }));

// Erreurs non gérées
app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).json({ error: 'Erreur serveur interne' });
});

const PORT = process.env.PORT || 3000;

// Création automatique du compte admin au démarrage si inexistant
async function seedAdminIfNeeded() {
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_INITIAL_PASSWORD) return;
    if (process.env.ADMIN_INITIAL_PASSWORD.length < 8) {
        console.warn('⚠️ ADMIN_INITIAL_PASSWORD trop court (< 8 chars) — skip création admin');
        return;
    }
    try {
        const { getDb } = require('./db');
        const bcrypt = require('bcryptjs');
        const db = await getDb();
        const existing = await db.get('SELECT id FROM users WHERE email = ?', [process.env.ADMIN_EMAIL]);
        if (!existing) {
            const hash = await bcrypt.hash(process.env.ADMIN_INITIAL_PASSWORD, 12);
            await db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [process.env.ADMIN_EMAIL, hash]);
            console.log('✅ Compte admin créé automatiquement :', process.env.ADMIN_EMAIL);
        }
    } catch (err) {
        console.error('Erreur création admin auto:', err.message);
    }
}

// DB prête AVANT d'accepter des requêtes (évite les 500 au premier déploiement)
initDb()
    .then(seedAdminIfNeeded)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`✅ Amboul backend démarré sur le port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Échec initialisation base de données :', err.message);
        process.exit(1);
    });
