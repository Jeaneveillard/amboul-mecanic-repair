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
