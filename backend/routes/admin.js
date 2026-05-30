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
        console.error('Admin list error:', err);
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
            console.error('Admin create error:', err);
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
        console.error('Admin revoke error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
