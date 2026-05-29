const express = require('express');
const { body, validationResult } = require('express-validator');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

const SYSTEM_PROMPT = `Tu incarnes le rôle suivant : Expert métier, Coach pédagogique, Analyste critique, Assistant créatif.
Contexte d'utilisation : Pour aider les mécaniciens qui ne sont pas trop habiles en code de véhicule à faire des réparations.
Objectif : Repérer le problème, décrire l'anomalie, porter une analyse du problème et donner un résultat avec diagnostic pour réparer le véhicule.
Présente ta réponse au format : Tableau, Paragraphes, Plan numéroté, Liste à puces.
Contraintes impératives : Aller directement dans le problème, donne un diagnostic précis sans trop de gros mots techniques. Soyez bref.
Coûts des pièces : Toujours inclure une estimation du coût des pièces en dollars canadiens ($ CAD). Indique une fourchette réaliste basée sur les prix du marché canadien.
Schéma de localisation : Fournis un schéma ASCII simple montrant où se trouve la pièce défectueuse sur le véhicule.
Outils de démontage/remontage : Fournis deux listes séparées : DÉMONTAGE et REMONTAGE avec tailles de clés précises et couples de serrage.
Public visé : Au mécanicien réparateur de véhicule.
Adopte un ton Technique, Détaillé, Concis, Pédagogique.`;

const VALID_PROVIDERS = ['pollinations', 'gemini', 'claude', 'deepseek', 'grok'];

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

        const { make, model, year, symptom, provider } = req.body;
        const userPrompt = `Véhicule: ${make} ${model} (Année: ${year})\nSymptômes/Codes: ${symptom}\nVeuillez analyser et fournir un diagnostic selon vos instructions systémiques.`;

        try {
            let result = '';

            if (provider === 'pollinations') {
                const resp = await fetch('https://text.pollinations.ai/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: [
                            { role: 'system', content: SYSTEM_PROMPT },
                            { role: 'user', content: userPrompt }
                        ],
                        model: 'openai-large',
                        private: true,
                        seed: -1
                    })
                });
                if (!resp.ok) throw new Error(`Pollinations: ${resp.statusText}`);
                result = await resp.text();

            } else if (provider === 'gemini') {
                const key = process.env.GEMINI_API_KEY;
                if (!key) return res.status(503).json({ error: 'Gemini non configuré sur le serveur' });
                const resp = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            system_instruction: { parts: { text: SYSTEM_PROMPT } },
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
                        model: 'deepseek-v3',
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
            res.status(500).json({ error: isKnown ? error.message : 'Erreur serveur lors du diagnostic' });
        }
    }
);

module.exports = router;
