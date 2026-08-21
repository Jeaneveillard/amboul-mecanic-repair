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
const POLLINATIONS_URL = 'https://gen.pollinations.ai/v1/chat/completions';
const POLLINATIONS_MODEL = 'openai-fast';

// Erreur porteuse d'un code HTTP : un souci de fournisseur ne doit pas donner un 500.
function providerError(status, message) {
    const err = new Error(message);
    err.status = status;
    return err;
}

async function callPollinations(userPrompt) {
    const key = process.env.POLLINATIONS_API_KEY;
    if (!key) {
        throw providerError(503, 'Le mode gratuit est momentanément indisponible (fournisseur non configuré). Connectez-vous avec un compte pour lancer un diagnostic.');
    }

    let resp;
    try {
        resp = await fetch(POLLINATIONS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${key}`
            },
            body: JSON.stringify({
                model: POLLINATIONS_MODEL,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: userPrompt }
                ]
            })
        });
    } catch (netErr) {
        console.error('[Pollinations] réseau:', netErr.message);
        throw providerError(502, 'Le service de diagnostic gratuit est injoignable. Réessayez dans quelques minutes.');
    }

    if (!resp.ok) {
        // Détail complet dans les logs serveur, message neutre pour le client.
        const detail = await resp.text().catch(() => resp.statusText);
        console.error(`[Pollinations] ${resp.status}: ${detail.substring(0, 300)}`);
        throw providerError(502, 'Le service de diagnostic gratuit a refusé la requête. Réessayez plus tard ou connectez-vous avec un compte.');
    }

    const data = await resp.json().catch(() => null);
    const result = data?.choices?.[0]?.message?.content;
    if (!result) {
        console.error('[Pollinations] réponse inattendue:', JSON.stringify(data).substring(0, 300));
        throw providerError(502, 'Le service de diagnostic gratuit a renvoyé une réponse vide. Réessayez.');
    }
    return result;
}

// POST /api/diagnose/free — mode « sans compte » : Pollinations uniquement, sans auth.
// Rate-limité strictement dans server.js. Aucune clé API exposée.
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
        try {
            const result = await callPollinations(buildUserPrompt(req.body));
            res.json({ result });
        } catch (error) {
            console.error('Diagnose free error:', error.message);
            // error.status : souci de fournisseur déjà formulé pour le mécanicien (503/502).
            res.status(error.status || 500).json({
                error: error.status ? error.message : 'Erreur serveur lors du diagnostic'
            });
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
            let result = '';

            if (provider === 'pollinations') {
                result = await callPollinations(userPrompt);

            } else if (provider === 'gemini') {
                const key = process.env.GEMINI_API_KEY;
                if (!key) return res.status(503).json({ error: 'Gemini non configuré sur le serveur' });
                const resp = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
                            contents: [{ parts: [{ text: userPrompt }] }]
                        })
                    }
                );
                if (!resp.ok) { const e = await resp.json(); throw new Error(e.error?.message || resp.statusText); }
                const data = await resp.json();
                if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
                    throw new Error('Réponse Gemini vide ou bloquée par le filtre de sécurité');
                }
                result = data.candidates[0].content.parts[0].text;

            } else if (provider === 'claude') {
                const key = process.env.CLAUDE_API_KEY;
                if (!key) return res.status(503).json({ error: 'Claude non configuré sur le serveur' });
                const resp = await fetch('https://api.anthropic.com/v1/messages', {
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
                if (!resp.ok) { const e = await resp.json(); throw new Error(e.error?.message || resp.statusText); }
                const data = await resp.json();
                result = data.content[0].text;

            } else if (provider === 'deepseek') {
                const key = process.env.DEEPSEEK_API_KEY;
                if (!key) return res.status(503).json({ error: 'DeepSeek non configuré sur le serveur' });
                const resp = await fetch('https://api.deepseek.com/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
                    body: JSON.stringify({
                        model: 'deepseek-chat',
                        messages: [
                            { role: 'system', content: SYSTEM_PROMPT },
                            { role: 'user', content: userPrompt }
                        ]
                    })
                });
                if (!resp.ok) { const e = await resp.json(); throw new Error(e.error?.message || resp.statusText); }
                const data = await resp.json();
                result = data.choices[0].message.content;

            } else if (provider === 'grok') {
                const key = process.env.GROK_API_KEY;
                if (!key) return res.status(503).json({ error: 'Grok non configuré sur le serveur' });
                const resp = await fetch('https://api.x.ai/v1/chat/completions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
                    body: JSON.stringify({
                        model: 'grok-3-mini',
                        messages: [
                            { role: 'system', content: SYSTEM_PROMPT },
                            { role: 'user', content: userPrompt }
                        ]
                    })
                });
                if (!resp.ok) { const e = await resp.json(); throw new Error(e.error?.message || resp.statusText); }
                const data = await resp.json();
                result = data.choices[0].message.content;
            }

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
