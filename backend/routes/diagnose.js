const express = require('express');
const { body, validationResult } = require('express-validator');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const SYSTEM_PROMPT = `Tu incarnes le rôle suivant : Expert métier, Coach pédagogique, Analyste critique, Assistant créatif.
Contexte d'utilisation : Pour aider les mécaniciens qui ne sont pas trop habiles en code de véhicule à faire des réparations. Tu couvres les véhicules thermiques (essence, diesel), hybrides (PHEV, HEV) ET 100% électriques (BEV) comme Tesla, Nissan Leaf, Chevrolet Bolt, BMW i4, etc. Pour les VE, tu connais les systèmes spécifiques : batterie haute tension, BMS, onduleur, moteur électrique, chargeur OBC, convertisseur DC/DC, frein régénératif, pompe à chaleur.
Objectif : Repérer le problème, décrire l'anomalie, porter une analyse du problème et donner un résultat avec diagnostic pour réparer le véhicule.
Présente ta réponse au format : Tableau, Paragraphes, Plan numéroté, Liste à puces.
Contraintes impératives : Aller directement dans le problème, donne un diagnostic précis sans trop de gros mots techniques. Soyez bref.
Coûts des pièces : Toujours inclure une estimation du coût des pièces en dollars canadiens ($ CAD). Indique une fourchette réaliste basée sur les prix du marché canadien.
Schéma de localisation : Fournis un schéma ASCII simple montrant où se trouve la pièce défectueuse sur le véhicule.
Outils de démontage/remontage : Fournis deux listes séparées : DÉMONTAGE et REMONTAGE avec tailles de clés précises et couples de serrage.
Public visé : Au mécanicien réparateur de véhicule.
Adopte un ton Technique, Détaillé, Concis, Pédagogique.`;

const VALID_PROVIDERS = ['pollinations', 'gemini', 'claude', 'deepseek', 'grok'];

// Instruction explicite pour chaque langue — sans elle, Pollinations répond
// parfois en anglais même pour une requête en français.
const LANG_INSTRUCTIONS = {
    fr: 'Réponds UNIQUEMENT en français.',
    en: 'Respond ONLY in English.',
    es: 'Responde ÚNICAMENTE en español.',
    ht: 'Reponn SÈLMAN ann kreyòl ayisyen.'
};

function buildUserPrompt({ make, model, year, symptom, lang }) {
    const langInstruction = LANG_INSTRUCTIONS[lang] || '';
    return `Véhicule: ${make} ${model} (Année: ${year})\nSymptômes/Codes: ${symptom}\nVeuillez analyser et fournir un diagnostic selon vos instructions systémiques.${langInstruction ? '\n' + langInstruction : ''}`;
}

// Pollinations — API actuelle (gen.pollinations.ai, clé obligatoire).
// L'ancien hôte text.pollinations.ai a supprimé son accès sans clé : il répond
// 402 à tout le monde. Clé gratuite : https://enter.pollinations.ai/keys
const MODE_GRATUIT_INDISPO = 'Le mode gratuit est momentanément indisponible (fournisseur non configuré). Connectez-vous avec un compte pour lancer un diagnostic.';
const MODE_GRATUIT_ERREUR = 'Le service de diagnostic gratuit est momentanément indisponible. Réessayez dans quelques minutes ou connectez-vous avec un compte.';

// Erreur porteuse d'un code HTTP : un souci de fournisseur ne doit pas donner un 500.
function providerError(status, message) {
    const err = new Error(message);
    err.status = status;
    return err;
}

// Appel HTTP d'un fournisseur : renvoie le JSON, transforme toute panne en erreur
// typée 502. Le détail complet reste dans les logs serveur, jamais chez le client.
async function providerFetch(label, url, options) {
    let resp;
    try {
        resp = await fetch(url, options);
    } catch (netErr) {
        console.error(`[${label}] réseau:`, netErr.message);
        throw providerError(502, `${label} est injoignable. Réessayez dans quelques minutes.`);
    }
    if (!resp.ok) {
        const detail = await resp.text().catch(() => resp.statusText);
        console.error(`[${label}] ${resp.status}: ${detail.substring(0, 300)}`);
        throw providerError(502, `${label} a refusé la requête (quota, crédits ou compte). Choisissez un autre fournisseur dans les paramètres IA.`);
    }
    const data = await resp.json().catch(() => null);
    if (!data) {
        console.error(`[${label}] réponse illisible`);
        throw providerError(502, `Réponse illisible de ${label}. Réessayez.`);
    }
    return data;
}

function requireKey(label, envName) {
    const key = process.env[envName];
    if (!key) throw providerError(503, `${label} non configuré sur le serveur`);
    return key;
}

function requireText(label, text) {
    if (!text) {
        console.error(`[${label}] réponse vide ou filtrée`);
        throw providerError(502, `${label} a renvoyé une réponse vide ou bloquée. Reformulez le symptôme.`);
    }
    return text;
}

// --- Pollinations (gen.pollinations.ai) ---------------------------------
// L'ancien hôte text.pollinations.ai a supprimé son accès sans clé : il répond
// 402 à tout le monde. Clé gratuite : https://enter.pollinations.ai/keys
async function callPollinations(userPrompt) {
    const key = requireKey('Pollinations', 'POLLINATIONS_API_KEY');
    const data = await providerFetch('Pollinations', 'https://gen.pollinations.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({
            model: 'openai-fast',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userPrompt }
            ]
        })
    });
    return requireText('Pollinations', data?.choices?.[0]?.message?.content);
}

// --- Gemini --------------------------------------------------------------
async function callGemini(userPrompt) {
    const key = requireKey('Gemini', 'GEMINI_API_KEY');
    const data = await providerFetch('Gemini',
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
                contents: [{ parts: [{ text: userPrompt }] }]
            })
        });
    return requireText('Gemini', data?.candidates?.[0]?.content?.parts?.[0]?.text);
}

// --- Claude --------------------------------------------------------------
async function callClaude(userPrompt) {
    const key = requireKey('Claude', 'CLAUDE_API_KEY');
    const data = await providerFetch('Claude', 'https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': key,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 2048,
            system: SYSTEM_PROMPT,
            messages: [{ role: 'user', content: userPrompt }]
        })
    });
    return requireText('Claude', data?.content?.[0]?.text);
}

// --- Fournisseurs au format OpenAI (DeepSeek, Grok) ----------------------
const OPENAI_COMPAT = {
    deepseek: { label: 'DeepSeek', url: 'https://api.deepseek.com/chat/completions', model: 'deepseek-chat', env: 'DEEPSEEK_API_KEY' },
    grok:     { label: 'Grok',     url: 'https://api.x.ai/v1/chat/completions',      model: 'grok-3-mini',   env: 'GROK_API_KEY' }
};

async function callOpenAICompatible(id, userPrompt) {
    const { label, url, model, env } = OPENAI_COMPAT[id];
    const key = requireKey(label, env);
    const data = await providerFetch(label, url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userPrompt }
            ]
        })
    });
    return requireText(label, data?.choices?.[0]?.message?.content);
}

// Un seul point d'entrée par fournisseur, partagé par les deux routes.
const PROVIDER_CALLERS = {
    pollinations: callPollinations,
    gemini: callGemini,
    claude: callClaude,
    deepseek: (p) => callOpenAICompatible('deepseek', p),
    grok: (p) => callOpenAICompatible('grok', p)
};

// Fournisseur alimentant le mode « sans compte » (route publique /api/diagnose/free).
// Bascule par FREE_PROVIDER : « pollinations » (défaut) ou n'importe quelle clé ci-dessus.
const FREE_PROVIDER = (process.env.FREE_PROVIDER || 'pollinations').trim().toLowerCase();

// POST /api/diagnose/free — mode « sans compte », sans auth.
// Le fournisseur est choisi par FREE_PROVIDER. Rate-limité strictement dans
// server.js (5 req/min par IP). Aucune clé API exposée au client.
router.post('/free',
    body('make').trim().notEmpty().isLength({ max: 100 }).withMessage('Marque requise'),
    body('model').trim().notEmpty().isLength({ max: 100 }).withMessage('Modèle requis'),
    body('year').trim().matches(/^\d{4}$/).withMessage('Année invalide (format YYYY requis)'),
    body('symptom').trim().notEmpty().isLength({ max: 2000 }).withMessage('Symptôme requis'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }
        const call = PROVIDER_CALLERS[FREE_PROVIDER];
        if (!call) {
            console.error(`FREE_PROVIDER inconnu : ${FREE_PROVIDER} (attendu : ${Object.keys(PROVIDER_CALLERS).join(' | ')})`);
            return res.status(503).json({ error: MODE_GRATUIT_INDISPO });
        }
        try {
            const result = await call(buildUserPrompt(req.body));
            res.json({ result });
        } catch (error) {
            console.error(`Diagnose free error (${FREE_PROVIDER}) :`, error.message);
            // Messages unifiés : l'utilisateur du mode gratuit n'a pas à savoir
            // quel fournisseur tourne derrière, ni à lire son jargon.
            if (error.status === 503) return res.status(503).json({ error: MODE_GRATUIT_INDISPO });
            if (error.status === 502) return res.status(502).json({ error: MODE_GRATUIT_ERREUR });
            res.status(500).json({ error: 'Erreur serveur lors du diagnostic' });
        }
    }
);

router.post('/',
    requireAuth,
    body('make').trim().notEmpty().isLength({ max: 100 }).withMessage('Marque requise'),
    body('model').trim().notEmpty().isLength({ max: 100 }).withMessage('Modèle requis'),
    body('year').trim().matches(/^\d{4}$/).withMessage('Année invalide (format YYYY requis)'),
    body('symptom').trim().notEmpty().isLength({ max: 2000 }).withMessage('Symptôme requis'),
    body('provider').isIn(VALID_PROVIDERS).withMessage('Fournisseur invalide'),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const { make, model, year, symptom, provider, lang = 'fr' } = req.body;
        const userPrompt = buildUserPrompt({ make, model, year, symptom, lang });

        try {
            const result = await PROVIDER_CALLERS[provider](userPrompt);
            res.json({ result });
        } catch (error) {
            console.error('Diagnose error:', error.message);
            // Ne pas exposer les détails internes (clés API partielles, URLs, etc.)
            const isKnown = error.message.startsWith('[') || error.message.includes('configuré');
            res.status(error.status || 500).json({
                error: (error.status || isKnown) ? error.message : 'Erreur serveur lors du diagnostic'
            });
        }
    }
);

module.exports = router;
