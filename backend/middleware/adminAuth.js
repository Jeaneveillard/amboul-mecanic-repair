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
