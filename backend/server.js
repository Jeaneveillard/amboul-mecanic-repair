require('dotenv').config();
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

const authRoutes = require('./routes/auth');
const diagnoseRoutes = require('./routes/diagnose');
const adminRoutes = require('./routes/admin');
const { requireAuth } = require('./middleware/auth');

const app = express();

// CORS — headers manuels (le plus fiable sur Railway)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
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

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth/setup', setupLimit);
app.use('/api/auth', authRoutes);
app.use('/api/admin', requireAuth, adminRoutes);
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
