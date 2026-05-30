// Dépend de auth.js chargé avant dans index.html

// ===== System Prompt (partagé par tous les providers) =====
const SYSTEM_PROMPT = `Tu incarnes le rôle suivant : Expert métier, Coach pédagogique, Analyste critique, Assistant créatif.
Contexte d'utilisation : Pour aider les mecaniciens qui ne sont pas trop habile en code de vehicule a faire des reparations.
Objectif : Reperer le probleme, decrire l'anomalie porter une analyse du probleme et donne un resultat avec diagnostic pour reparer le vehicule.
Présente ta réponse au format : Tableau, Paragraphes, Plan numéroté, Liste à puces.
Contraintes impératives : Aller directement dans le problème, donne un diagnostic precis sans trop de gros mots technique. Soyez bref.
Coûts des pièces : Toujours inclure une estimation du coût des pièces en dollars canadiens ($ CAD). Indique une fourchette réaliste (ex: 45–90 $ CAD) basée sur les prix du marché canadien (auto parts stores, dealership).
Schéma de localisation : Fournis un schéma ASCII simple montrant où se trouve la pièce défectueuse sur le véhicule. Utilise un format comme celui-ci (adapte selon la pièce) :
  ┌─────────────────────────────────┐
  │  AVANT          ← CAPOT →       │
  │  [Moteur]  [Filtre] [Batterie]  │
  │  ← CÔTÉ GAUCHE  CÔTÉ DROIT →   │
  │  [Boîte]   [★PIÈCE★]  [Réserv] │
  │  ARRIÈRE                        │
  └─────────────────────────────────┘
  Marque la pièce défectueuse avec ★ et mets-la en évidence.
Outils de démontage/remontage : Fournis deux listes séparées :
  - DÉMONTAGE : liste les outils et clés avec tailles précises (ex: douille 10mm, clé plate 17mm, tournevis Torx T25)
  - REMONTAGE : liste les couples de serrage si applicable (ex: 25 Nm), les précautions et l'ordre de remontage.
Public visé : Au mecanicien reparateur de vehicule.
Adopte un ton Technique, Détaillé, Concis, Pédagogique.`;

async function callDiagnose({ make, model, year, symptom, provider }) {
    const backendUrl = getBackendUrl();

    // Sans backend → Pollinations direct (mode sans compte)
    if (!backendUrl) {
        return callPollinationsDirect({ make, model, year, symptom });
    }

    const resp = await fetch(`${backendUrl}/api/diagnose`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ make, model, year, symptom, provider, lang: typeof getLang === 'function' ? getLang() : 'fr' })
    });

    if (resp.status === 401) {
        logout();
        throw new Error('Session expirée. Reconnectez-vous.');
    }

    if (!resp.ok) {
        const e = await resp.json().catch(() => ({}));
        throw new Error(e.error || `Erreur serveur (${resp.status})`);
    }

    const data = await resp.json();
    return data.result;
}

// Fallback Pollinations direct (pas de backend configuré)
async function callPollinationsDirect({ make, model, year, symptom }) {
    const langInstruction = typeof t === 'function' ? t('ai.lang_instruction') : '';
    const userPrompt = `Véhicule: ${make} ${model} (Année: ${year})\nSymptômes/Codes: ${symptom}\nVeuillez analyser et fournir un diagnostic selon vos instructions systémiques.${langInstruction ? '\n' + langInstruction : ''}`;
    const resp = await fetch('https://text.pollinations.ai/openai', {
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
    if (!resp.ok) throw new Error(`[Pollinations] ${resp.statusText}`);
    const data = await resp.json();
    return data.choices?.[0]?.message?.content || '';
}
