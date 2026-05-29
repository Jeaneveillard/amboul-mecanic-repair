# Amboul Mecanic Repair — Design Spec
Date: 2026-05-28

## Résumé

Refonte complète du projet Amboul Mecanic Repair en 3 couches :
1. **Documentation & config Claude Code** : CLAUDE.md, README.md, agents, skills
2. **App** : nouvelles fonctionnalités + redesign UI + refactoring

---

## 1. Architecture des fichiers

```
Amboul Mecanic repair/
├── index.html                    ← refonte UI (nav header, OBD2, historique, impression)
├── app.js                        ← refactoring + nouvelles fonctionnalités
├── style.css                     ← polish CSS + styles OBD2/historique/print
├── CLAUDE.md                     ← instructions projet pour Claude
├── README.md                     ← documentation utilisateur
│
└── .claude/
    ├── settings.local.json       ← permissions étendues
    ├── agents/
    │   ├── diagnosticien.md      ← agent expert mécanique auto
    │   ├── obd2-expert.md        ← agent spécialisé codes OBD2
    │   └── ui-designer.md        ← agent UI/UX pour applis sombres
    └── skills/
        ├── amboul-mecanic/
        │   └── SKILL.md          ← workflow complet pour ce projet
        ├── export-rapport/
        │   └── SKILL.md          ← génération rapports PDF/print
        └── api-debug/
            └── SKILL.md          ← debug appels API multi-providers
```

---

## 2. CLAUDE.md

Le fichier à la racine du projet. Contient :
- Contexte : app de diagnostic auto IA pour mécaniciens, single-page HTML/CSS/JS vanilla
- Providers supportés : Gemini, Claude, DeepSeek, Grok (clés dans localStorage)
- Conventions : pas de frameworks, pas de build tools, fonctions ES6+, CSS variables
- Prompt système : ne jamais modifier sans tester le rendu markdown
- Agents disponibles : diagnosticien, obd2-expert, ui-designer
- Skills disponibles : amboul-mecanic, export-rapport, api-debug

---

## 3. Agents Claude Code

### `diagnosticien.md`
- Rôle : expert mécanique auto, connaît symptômes/causes/réparations
- Déclenché automatiquement quand la tâche concerne : prompt système, ajout de véhicules, test de diagnostic, formulation de questions mécaniques
- Adopte le ton : technique, pédagogique, bref

### `obd2-expert.md`
- Rôle : encyclopédie des codes OBD2 (P/U/B/C), sévérité, causes, pièces
- Déclenché quand : travail sur la base de données OBD2, ajout de codes, descriptions
- Fournit : code, description, causes probables, gravité (1=info, 2=attention, 3=critique)

### `ui-designer.md`
- Rôle : expert UI/UX pour interfaces sombres, design systems techniques
- Déclenché quand : modification CSS, nouveau composant visuel, questions d'ergonomie
- Respecte : la palette existante (--primary-color: #3b82f6, --accent-color: #10b981), le glass-morphism

---

## 4. Skills

### `amboul-mecanic/SKILL.md`
Workflow pour ajouter/modifier des fonctionnalités dans ce projet :
1. Lire `index.html`, `app.js`, `style.css` pour le contexte actuel
2. Vérifier les providers API impactés
3. Écrire le code en vanilla JS/CSS, pas de dépendances
4. Tester mentalement le rendu markdown du résultat
5. Valider que localStorage est cohérent

### `export-rapport/SKILL.md`
Workflow pour générer un rapport imprimable :
1. Récupérer les données du diagnostic en cours (make, model, year, symptom, result)
2. Créer un layout print-friendly (fond blanc, texte noir, logo, date)
3. Injecter via une div cachée `#printZone`
4. Déclencher `window.print()`
5. Nettoyer après impression

### `api-debug/SKILL.md`
Workflow quand une API retourne une erreur :
1. Identifier le provider (gemini/claude/deepseek/grok)
2. Loguer la requête complète (headers + body)
3. Vérifier le modèle utilisé (custom vs default)
4. Tester avec `curl` ou dans la console navigateur
5. Proposer le fix (modèle invalide, CORS, clé expirée, quota)

---

## 5. App — Fonctionnalités

### 5.1 Navigation (layout C)
- Le header existant conserve son style glass-morphism
- 3 liens de navigation ajoutés dans le header : **Diagnostic** | **Base OBD2** | **Historique**
- L'onglet actif est mis en évidence avec `border-bottom: 2px solid var(--primary-color)` et couleur active
- Les 3 sections sont dans le DOM, CSS `display:none/block` contrôle la visibilité
- Pas de router, pas de hash, juste des boutons qui basculent les sections

### 5.2 Base OBD2 intégrée
- ~150 codes couvrant : P0xxx (moteur/transmission), P1xxx (constructeur), U0xxx (réseau), B0xxx (carrosserie)
- Objet JS : `{ code, description, causes: [], gravite: 1|2|3, categorie }`
- Interface : champ de recherche filtrant en temps réel par code ou mot-clé
- Badge de gravité coloré : vert (info), orange (attention), rouge (critique)
- Cliquer sur un code le copie dans le champ de symptômes du formulaire de diagnostic

### 5.3 Historique local
- Les 10 derniers diagnostics sauvegardés dans `localStorage` sous la clé `amboul_history`
- Chaque entrée : `{ id, date, make, model, year, symptom, result, provider }`
- Interface : liste de cartes avec date, véhicule, extrait du symptôme, provider utilisé
- Boutons : "Recharger" (repopule le formulaire) et "Supprimer"
- Bouton "Effacer tout" en bas

### 5.4 Export / Impression
- Bouton "🖨️ Imprimer" apparaît sur le panneau résultat une fois le diagnostic généré
- CSS `@media print` : fond blanc, texte noir, header simplifié avec logo + date, masque les boutons
- Le rapport imprimé affiche : nom du garage, véhicule, date, symptômes, diagnostic complet

### 5.5 Marques nord-américaines ajoutées
- Chevrolet, Ford, Dodge, Jeep, RAM, GMC, Chrysler, Buick, Cadillac, Lincoln avec leurs modèles principaux

### 5.6 Qualité du code
- Validation des champs avant soumission (message d'erreur inline, pas d'alert)
- Gestion d'erreur enrichie : message selon le type d'erreur (réseau, API key, quota, modèle)
- Sauvegarde automatique dans l'historique après chaque diagnostic réussi
- Constantes extraites en haut du fichier (modèles par défaut, nb max historique)

---

## 6. Contraintes

- Zero dépendances nouvelles (sauf `marked.js` déjà présent)
- Les clés API restent dans `localStorage`, jamais en dur
- Compatible avec les 4 providers existants sans casser le code actuel
- L'app reste un seul fichier HTML + JS + CSS (pas de module bundler)
