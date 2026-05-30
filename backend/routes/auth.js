const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { getDb } = require('../db');

const router = express.Router();

function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array()[0].msg });
    }
    next();
}

// POST /api/auth/register
// Self-registration désactivée — comptes créés par l'admin via /api/admin/users
router.post('/register', (req, res) => {
    res.status(403).json({ error: 'L\'inscription publique est désactivée. Contactez l\'administrateur.' });
});

// POST /api/auth/login
router.post('/login',
    body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
    body('password').notEmpty().withMessage('Mot de passe requis'),
    validate,
    async (req, res) => {
        try {
            const { email, password } = req.body;
            const db = await getDb();
            const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
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
        } catch (err) {
            console.error('Login error:', err);
            res.status(500).json({ error: 'Erreur serveur' });
        }
    }
);

module.exports = router;
