// ===== RÉINITIALISATION MOT DE PASSE =====
// 1. Modifie la ligne ci-dessous avec ton nouveau mot de passe
// 2. Lance dans le terminal : node reset-password.js
// 3. Supprime ce fichier après usage

const NOUVEAU_MDP = 'bouloboulo';
const EMAIL = 'jeaneveillard@gmail.com';

// ==========================================
const bcrypt = require('bcryptjs');
const { getDb } = require('./db');

(async () => {
    if (NOUVEAU_MDP === 'CHANGE_MOI') {
        console.log('❌ Modifie d\'abord NOUVEAU_MDP dans ce fichier !');
        process.exit(1);
    }
    if (NOUVEAU_MDP.length < 8) {
        console.log('❌ Le mot de passe doit faire au moins 8 caractères.');
        process.exit(1);
    }

    const db = await getDb();
    const hash = await bcrypt.hash(NOUVEAU_MDP, 12);

    const result = await db.run(
        'UPDATE users SET password_hash = ? WHERE email = ?',
        [hash, EMAIL]
    );

    if (result.changes > 0) {
        console.log('✅ Mot de passe mis à jour pour :', EMAIL);
        console.log('   Connecte-toi maintenant avec :', NOUVEAU_MDP);
    } else {
        await db.run(
            'INSERT INTO users (email, password_hash) VALUES (?, ?)',
            [EMAIL, hash]
        );
        console.log('✅ Compte créé pour :', EMAIL);
        console.log('   Connecte-toi maintenant avec :', NOUVEAU_MDP);
    }

    process.exit(0);
})();
