// ===== RÉINITIALISATION MOT DE PASSE ADMIN =====
// Usage :  node reset-password.js [email]
//   - [email] : optionnel, défaut = ADMIN_EMAIL du .env
//
// Le mot de passe est demandé en SAISIE MASQUÉE (rien ne s'affiche pendant
// la frappe, comme sudo), tapé deux fois pour confirmation. Il ne passe donc
// PAS par la ligne de commande et ne reste PAS dans l'historique du terminal.
// Il n'est jamais écrit en dur dans ce fichier.

require('dotenv').config({ quiet: true });
const bcrypt = require('bcryptjs');
const readline = require('readline');
const { getDb } = require('./db');

const EMAIL = process.argv[2] || process.env.ADMIN_EMAIL;

// Lit une ligne au clavier sans afficher les caractères tapés.
function promptHidden(query) {
    return new Promise((resolve) => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
        rl.stdoutMuted = true;
        rl.query = query;
        // Réécrit uniquement l'invite à chaque frappe → les caractères saisis
        // ne s'affichent jamais.
        rl._writeToOutput = function (str) {
            if (rl.stdoutMuted) {
                rl.output.write('\x1B[2K\x1B[200D' + rl.query);
            } else {
                rl.output.write(str);
            }
        };
        rl.question(query, (value) => {
            rl.close();
            rl.output.write('\n');
            resolve(value);
        });
    });
}

(async () => {
    if (!EMAIL) {
        console.log('❌ Aucun email fourni et ADMIN_EMAIL absent du .env.');
        console.log('   Usage : node reset-password.js [email]');
        process.exit(1);
    }
    if (!process.env.DATABASE_URL) {
        console.log('❌ DATABASE_URL absent du .env — impossible de se connecter à la base.');
        console.log('   Copiez DATABASE_URL depuis Render (onglet Environment) dans backend/.env.');
        process.exit(1);
    }

    if (!process.stdin.isTTY) {
        console.log('❌ Terminal interactif requis pour la saisie masquée du mot de passe.');
        process.exit(1);
    }

    const mdp1 = await promptHidden(`Nouveau mot de passe pour ${EMAIL} (min 8 car.) : `);
    if (mdp1.length < 8) {
        console.log('❌ Le mot de passe doit faire au moins 8 caractères.');
        process.exit(1);
    }
    const mdp2 = await promptHidden('Confirmez le mot de passe : ');
    if (mdp1 !== mdp2) {
        console.log('❌ Les deux mots de passe ne correspondent pas. Rien n\'a été modifié.');
        process.exit(1);
    }

    const db = await getDb();
    const hash = await bcrypt.hash(mdp1, 12);

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

    console.log('   Reconnectez-vous dans l\'app avec ce nouveau mot de passe.');
    process.exit(0);
})();
