// ===== RÉINITIALISATION MOT DE PASSE ADMIN =====
// Usage :  node reset-password.js <nouveau_mot_de_passe> [email]
//   - <nouveau_mot_de_passe> : requis, min 8 caractères
//   - [email]                : optionnel, défaut = ADMIN_EMAIL du .env
//
// Le mot de passe n'est JAMAIS écrit en dur dans ce fichier (il finirait
// dans l'historique git). Il est passé en argument au lancement.

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { getDb } = require('./db');

const NOUVEAU_MDP = process.argv[2];
const EMAIL = process.argv[3] || process.env.ADMIN_EMAIL;

(async () => {
    if (!NOUVEAU_MDP) {
        console.log('❌ Usage : node reset-password.js <nouveau_mot_de_passe> [email]');
        process.exit(1);
    }
    if (NOUVEAU_MDP.length < 8) {
        console.log('❌ Le mot de passe doit faire au moins 8 caractères.');
        process.exit(1);
    }
    if (!EMAIL) {
        console.log('❌ Aucun email fourni et ADMIN_EMAIL absent du .env.');
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
    } else {
        await db.run(
            'INSERT INTO users (email, password_hash) VALUES (?, ?)',
            [EMAIL, hash]
        );
        console.log('✅ Compte créé pour :', EMAIL);
    }

    process.exit(0);
})();
