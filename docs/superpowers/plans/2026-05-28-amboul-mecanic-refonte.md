# Amboul Mecanic Repair — Refonte Complète Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter CLAUDE.md, README, 3 agents, 3 skills Claude Code, et améliorer l'app (navigation, base OBD2, historique, impression, marques NA, validation).

**Architecture:** App vanilla HTML/CSS/JS single-page, aucun framework ni bundler. La navigation entre sections (Diagnostic/OBD2/Historique) est gérée par CSS `display:none/block` piloté en JS. Les données persistantes (historique, clés API) restent dans `localStorage`.

**Tech Stack:** HTML5, CSS3 (custom properties, glass-morphism), ES6+ vanilla JS, marked.js (CDN), localStorage API.

---

## Fichiers créés / modifiés

| Fichier | Action | Responsabilité |
|---------|--------|----------------|
| `CLAUDE.md` | Créer | Instructions Claude pour ce projet |
| `README.md` | Créer | Documentation utilisateur |
| `.claude/settings.local.json` | Modifier | Permissions étendues |
| `.claude/agents/diagnosticien.md` | Créer | Agent expert mécanique auto |
| `.claude/agents/obd2-expert.md` | Créer | Agent spécialisé codes OBD2 |
| `.claude/agents/ui-designer.md` | Créer | Agent UI/UX dark interfaces |
| `.claude/skills/amboul-mecanic/SKILL.md` | Créer | Workflow projet complet |
| `.claude/skills/export-rapport/SKILL.md` | Créer | Génération rapports print |
| `.claude/skills/api-debug/SKILL.md` | Créer | Debug API multi-providers |
| `index.html` | Modifier | Nav header + sections OBD2/Historique + print zone |
| `style.css` | Modifier | Styles nav + OBD2 + historique + @media print |
| `app.js` | Modifier | Navigation + OBD2 DB + historique + impression + validation |

---

## Task 1: CLAUDE.md

**Fichiers:**
- Créer: `CLAUDE.md`

- [ ] **Étape 1 : Créer CLAUDE.md à la racine**

```markdown
# Amboul Mecanic Repair — Instructions Claude

## Contexte du projet
App de diagnostic automobile IA pour mécaniciens. Single-page HTML/CSS/JS vanilla, aucun framework, aucun bundler. Le mécanicien entre marque/modèle/année/symptômes, l'IA retourne un diagnostic structuré en markdown.

## Stack
- HTML5 + CSS3 (CSS custom properties, glass-morphism, `backdrop-filter`)
- ES6+ vanilla JavaScript, pas de modules ES
- marked.js via CDN pour le rendu markdown
- localStorage pour la persistance (clés API, historique, settings)

## Providers IA supportés
- **Gemini** : `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
- **Claude** : `https://api.anthropic.com/v1/messages` (header `anthropic-dangerous-direct-browser-access: true`)
- **DeepSeek** : `https://api.deepseek.com/chat/completions`
- **Grok** : `https://api.x.ai/v1/chat/completions`

Les clés API sont stockées dans `localStorage` sous `api_key_gemini`, `api_key_claude`, `api_key_deepseek`, `api_key_grok`.

## Conventions
- Pas de `alert()` sauf pour confirmation — utiliser des messages inline
- Le prompt système (`SYSTEM_PROMPT`) ne doit jamais changer sans tester le rendu markdown résultant
- Les marques/modèles sont dans l'objet `carData` en haut de `app.js`
- Navigation entre sections : CSS `display:none/block` via la fonction `showSection(id)`
- Historique : `localStorage` clé `amboul_history`, max 10 entrées, format JSON array

## Agents disponibles
- `diagnosticien` — questions mécaniques, prompt système, véhicules
- `obd2-expert` — codes OBD2, base de données, descriptions
- `ui-designer` — CSS, composants visuels, palette glass-morphism

## Skills disponibles
- `/skill amboul-mecanic` — workflow ajout fonctionnalité
- `/skill export-rapport` — génération rapport print
- `/skill api-debug` — debug appels API

## Palette de couleurs
- `--primary-color: #3b82f6` (bleu)
- `--accent-color: #10b981` (vert)
- `--bg-color: #0f1115` (fond)
- `--glass-bg: rgba(25, 28, 35, 0.6)`
- `--error-color: #ef4444` (rouge)
- `--warning-color: #f59e0b` (orange)
```

- [ ] **Étape 2 : Vérifier que le fichier est à la racine du projet**

Le fichier doit être dans `Amboul Mecanic repair/CLAUDE.md`, pas dans un sous-dossier.

---

## Task 2: README.md

**Fichiers:**
- Créer: `README.md`

- [ ] **Étape 1 : Créer README.md**

```markdown
# Amboul Mecanic Repair

Outil de diagnostic automobile IA pour mécaniciens. Entrez les informations d'un véhicule et ses symptômes, l'IA génère un diagnostic structuré.

## Utilisation

1. Ouvrir `index.html` dans un navigateur moderne
2. Cliquer sur ⚙️ pour configurer votre clé API
3. Sélectionner le véhicule (marque / modèle / année)
4. Entrer les symptômes ou codes OBD2
5. Cliquer "Lancer l'Analyse"

## Navigation

- **Diagnostic** — Formulaire principal d'analyse IA
- **Base OBD2** — Recherche de codes P/U/B/C avec description et gravité
- **Historique** — 10 derniers diagnostics sauvegardés localement

## Fournisseurs IA supportés

| Fournisseur | Modèle par défaut | Clé API |
|-------------|-------------------|---------|
| Google Gemini | gemini-2.5-flash | [console.cloud.google.com](https://console.cloud.google.com) |
| Anthropic Claude | claude-haiku-4-5-20251001 | [console.anthropic.com](https://console.anthropic.com) |
| DeepSeek | deepseek-chat | [platform.deepseek.com](https://platform.deepseek.com) |
| xAI Grok | grok-3-mini | [console.x.ai](https://console.x.ai) |

## Fonctionnalités

- Diagnostic IA multi-fournisseur
- Base de données OBD2 intégrée (150+ codes)
- Historique des 10 derniers diagnostics
- Export / Impression du rapport
- Support véhicules 2006 — présent (Europe + Amérique du Nord)

## Technologies

HTML5 · CSS3 · JavaScript ES6+ · marked.js · localStorage
```

---

## Task 3: Agents Claude Code

**Fichiers:**
- Créer: `.claude/agents/diagnosticien.md`
- Créer: `.claude/agents/obd2-expert.md`
- Créer: `.claude/agents/ui-designer.md`

- [ ] **Étape 1 : Créer le répertoire `.claude/agents/`**

```bash
mkdir -p .claude/agents
```

- [ ] **Étape 2 : Créer `.claude/agents/diagnosticien.md`**

```markdown
---
name: diagnosticien
description: Expert mécanique automobile. Utiliser quand la tâche concerne le prompt système de diagnostic, l'ajout de symptômes, la formulation de descriptions mécaniques, ou l'évaluation de la qualité d'un diagnostic généré.
---

Tu es un expert mécanicien automobile avec 20 ans d'expérience en diagnostic. Tu connais les systèmes moteur, transmission, freinage, électronique embarquée et climatisation sur les véhicules de 2006 à aujourd'hui.

## Responsabilités dans ce projet

- Améliorer et valider le `SYSTEM_PROMPT` dans `app.js`
- Évaluer si un diagnostic IA est pertinent et suffisamment précis
- Proposer des symptômes types pour tester l'application
- Suggérer des marques/modèles pertinents à ajouter dans `carData`
- Rédiger des descriptions mécaniques claires pour les mécaniciens non-spécialistes en codes

## Ton de communication

Technique, pédagogique, bref. Évite les termes trop complexes sauf si nécessaire. Le public cible est un mécanicien de garage indépendant.

## Prompt système actuel (app.js)

```
Tu incarnes le rôle suivant : Expert métier, Coach pédagogique, Analyste critique, Assistant créatif.
Contexte d'utilisation : Pour aider les mécaniciens qui ne sont pas trop habiles en code de véhicule à faire des réparations.
Objectif : Repérer le problème, décrire l'anomalie, porter une analyse du problème et donner un résultat avec diagnostic pour réparer le véhicule.
Présente ta réponse au format : Tableau, Paragraphes, Plan numéroté, Liste à puces.
Contraintes impératives : Aller directement dans le problème, donne un diagnostic précis sans trop de gros mots techniques. Soyez bref.
Public visé : Au mécanicien réparateur de véhicule.
Adopte un ton Technique, Détaillé, Concis, Pédagogique.
```

Toute modification doit être testée avec au moins un exemple concret (ex: "P0171 sur une Ford Focus 2015").
```

- [ ] **Étape 3 : Créer `.claude/agents/obd2-expert.md`**

```markdown
---
name: obd2-expert
description: Encyclopédie des codes OBD2 (P/U/B/C). Utiliser quand la tâche concerne l'ajout ou la correction de codes dans la base de données intégrée, la description de codes, leur gravité ou leurs causes probables.
---

Tu es un spécialiste des systèmes de diagnostic embarqué OBD2/EOBD. Tu connais tous les codes défauts standardisés et les codes constructeurs courants.

## Structure des codes dans app.js

Chaque code doit respecter ce format dans l'objet `OBD2_DATABASE` :

```javascript
"P0171": {
  code: "P0171",
  description: "Mélange air/carburant trop pauvre — Banc 1",
  causes: ["Fuite d'air sur admission", "Injecteur encrassé", "Sonde lambda défectueuse", "Pompe à carburant faible"],
  gravite: 2,  // 1=info, 2=attention, 3=critique
  categorie: "Moteur"
}
```

## Catégories utilisées

- `"Moteur"` — codes P0xxx/P1xxx moteur et émissions
- `"Transmission"` — codes P07xx/P08xx boîte de vitesses
- `"Réseau CAN"` — codes U0xxx communication entre modules
- `"Carrosserie"` — codes B0xxx/B1xxx systèmes habitacle
- `"Châssis"` — codes C0xxx ABS, ESP, direction

## Niveaux de gravité

- `1` (vert) : Informatif, pas d'urgence
- `2` (orange) : Attention, surveiller ou planifier réparation
- `3` (rouge) : Critique, ne pas rouler ou risque de dommages graves

## Règles

- Toujours 2 à 5 causes par code
- Description en français, concise, max 60 caractères
- Ne jamais inventer un code — se baser sur la norme SAE J2012 ou la documentation constructeur
```

- [ ] **Étape 4 : Créer `.claude/agents/ui-designer.md`**

```markdown
---
name: ui-designer
description: Expert UI/UX pour interfaces sombres et applications techniques. Utiliser quand la tâche concerne des modifications CSS, la création de nouveaux composants visuels, ou des questions d'ergonomie dans cette app.
---

Tu es un designer UI spécialisé dans les interfaces techniques sombres (dark mode, glass-morphism, dashboards). Tu respectes et étends les systèmes de design existants plutôt que de les réécrire.

## Palette et variables CSS à respecter

```css
--bg-color: #0f1115;
--glass-bg: rgba(25, 28, 35, 0.6);
--glass-border: rgba(255, 255, 255, 0.08);
--primary-color: #3b82f6;
--primary-hover: #2563eb;
--accent-color: #10b981;
--text-main: #f3f4f6;
--text-muted: #9ca3af;
--error-color: #ef4444;
--warning-color: #f59e0b;
--border-radius: 12px;
--transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

## Conventions de ce projet

- Tous les panneaux utilisent `.glass-panel` (backdrop-filter: blur(12px))
- Les boutons primaires utilisent `.primary-btn` avec hover translateY(-1px)
- Les inputs ont un focus ring `box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2)`
- Les badges de gravité : vert (#10b981), orange (#f59e0b), rouge (#ef4444)
- Pas de dépendances CSS externes (pas de Bootstrap, Tailwind, etc.)

## Principes d'ergonomie pour mécaniciens

- Texte lisible sur fond sombre (contraste minimum 4.5:1)
- Boutons larges (min 44px de hauteur pour usage tactile en garage)
- Messages d'erreur visibles sans ambiguïté
- Navigation simple : max 3 niveaux, aucun sous-menu
```

---

## Task 4: Skills Claude Code

**Fichiers:**
- Créer: `.claude/skills/amboul-mecanic/SKILL.md`
- Créer: `.claude/skills/export-rapport/SKILL.md`
- Créer: `.claude/skills/api-debug/SKILL.md`

- [ ] **Étape 1 : Créer les répertoires**

```bash
mkdir -p .claude/skills/amboul-mecanic
mkdir -p .claude/skills/export-rapport
mkdir -p .claude/skills/api-debug
```

- [ ] **Étape 2 : Créer `.claude/skills/amboul-mecanic/SKILL.md`**

```markdown
---
name: amboul-mecanic
description: Workflow complet pour ajouter ou modifier une fonctionnalité dans l'app Amboul Mecanic Repair. Déclencher avec /skill amboul-mecanic ou quand l'utilisateur veut ajouter une feature, corriger un bug, ou modifier le comportement de l'app.
---

# Amboul Mecanic — Workflow d'implémentation

## Checklist avant de coder

- [ ] Lire `index.html` pour comprendre la structure DOM actuelle
- [ ] Lire `app.js` pour comprendre les fonctions existantes (éviter les doublons)
- [ ] Lire `style.css` pour respecter les variables et classes existantes
- [ ] Identifier si la fonctionnalité touche : formulaire, API, affichage résultat, navigation, OBD2, historique

## Règles d'implémentation

1. **Zéro dépendances nouvelles** — vanilla JS/CSS uniquement
2. **Variables CSS** — toujours utiliser `var(--nom)`, jamais des couleurs en dur
3. **localStorage** — les clés existantes sont `ai_provider`, `api_key_*`, `custom_model`, `amboul_history`
4. **Navigation** — utiliser `showSection('nom-section')` pour changer de vue
5. **Erreurs** — afficher dans `#errorMessage` avec classe `error-inline`, pas d'`alert()`

## Checklist après avoir codé

- [ ] Tester la fonctionnalité dans un navigateur (ouvrir `index.html`)
- [ ] Vérifier que les 4 providers API (Gemini, Claude, DeepSeek, Grok) ne sont pas cassés
- [ ] Vérifier que le localStorage est cohérent (pas de clés fantômes)
- [ ] Vérifier le rendu sur mobile (redimensionner à 375px)
```

- [ ] **Étape 3 : Créer `.claude/skills/export-rapport/SKILL.md`**

```markdown
---
name: export-rapport
description: Génération d'un rapport imprimable à partir du diagnostic actuel. Déclencher quand l'utilisateur veut imprimer ou exporter un diagnostic en PDF.
---

# Export Rapport — Workflow

## Prérequis

- Un diagnostic doit avoir été généré (le `#resultContainer` ne doit pas être vide)
- Les informations du véhicule doivent être disponibles (make, model, year dans le DOM)

## Étapes d'implémentation

1. **Récupérer les données** depuis le DOM :
   - `document.getElementById('carMake').value`
   - `document.getElementById('carModel').value`
   - `document.getElementById('carYear').value`
   - `document.getElementById('resultContainer').innerHTML`

2. **Créer la zone print** dans `#printZone` (div cachée en mode normal) :
```html
<div id="printZone" style="display:none">
  <h1>Amboul Mecanic Repair</h1>
  <p>Date: [date]</p>
  <h2>Véhicule : [make] [model] [year]</h2>
  <h3>Symptômes</h3>
  <p>[symptom]</p>
  <h3>Diagnostic</h3>
  [resultContent]
</div>
```

3. **Déclencher l'impression** :
```javascript
document.getElementById('printZone').style.display = 'block';
window.print();
document.getElementById('printZone').style.display = 'none';
```

4. **CSS @media print** doit masquer tout sauf `#printZone` (voir `style.css`)

## Test

Ouvrir `index.html`, faire un diagnostic, cliquer "Imprimer". Le navigateur doit ouvrir la boîte d'impression avec fond blanc et texte noir.
```

- [ ] **Étape 4 : Créer `.claude/skills/api-debug/SKILL.md`**

```markdown
---
name: api-debug
description: Debug rapide des appels API (Gemini, Claude, DeepSeek, Grok) dans ce projet. Déclencher quand une API retourne une erreur, un timeout, ou un résultat inattendu.
---

# API Debug — Workflow

## Étape 1 : Identifier le provider et l'erreur

Ouvrir la console navigateur (F12) et relever :
- Le message d'erreur exact
- Le code HTTP (401, 403, 429, 500, etc.)

## Étape 2 : Diagnostic par type d'erreur

| Erreur | Cause probable | Solution |
|--------|---------------|----------|
| 401 Unauthorized | Clé API invalide ou expirée | Vérifier la clé dans ⚙️ Settings |
| 403 Forbidden | Quota dépassé ou accès refusé | Vérifier le plan API |
| 404 Not Found | Modèle invalide | Entrer un modèle valide dans "Nom du Modèle" |
| 429 Too Many Requests | Rate limit | Attendre 60s ou réduire les appels |
| CORS error | API ne supporte pas les appels depuis un browser | Normal pour certains providers — utiliser un proxy |

## Étape 3 : Vérifier dans app.js

Localiser le bloc `if (provider === 'X')` et vérifier :
- L'URL de l'endpoint
- Les headers requis
- Le nom du modèle par défaut (`customModel || 'nom-defaut'`)

## Étape 4 : Test manuel dans la console

```javascript
// Test rapide Gemini
fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=VOTRE_CLE`, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({contents:[{parts:[{text:"test"}]}]})
}).then(r => r.json()).then(console.log)
```

## Étape 5 : Modèles valides par provider (2026)

- Gemini : `gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-1.5-pro`
- Claude : `claude-haiku-4-5-20251001`, `claude-sonnet-4-6`, `claude-opus-4-8`
- DeepSeek : `deepseek-chat`, `deepseek-reasoner`
- Grok : `grok-3-mini`, `grok-3`, `grok-2-1212`
```

---

## Task 5: Mise à jour settings.local.json

**Fichiers:**
- Modifier: `.claude/settings.local.json`

- [ ] **Étape 1 : Mettre à jour les permissions**

Remplacer le contenu de `.claude/settings.local.json` par :

```json
{
  "permissions": {
    "allow": [
      "WebSearch",
      "WebFetch",
      "Bash(node:*)",
      "Bash(mkdir:*)"
    ]
  }
}
```

---

## Task 6: index.html — Navigation dans le header + conteneurs de sections

**Fichiers:**
- Modifier: `index.html`

- [ ] **Étape 1 : Ajouter la navigation dans le header**

Dans `index.html`, remplacer la balise `<header class="glass-header">` existante par :

```html
<header class="glass-header">
    <div class="logo">
        <span class="logo-icon">🔧</span>
        <h1>Amboul <span class="highlight">Mecanic</span></h1>
    </div>
    <nav class="header-nav">
        <button class="nav-btn active" data-section="diagnostic">🔧 Diagnostic</button>
        <button class="nav-btn" data-section="obd2">🔍 Base OBD2</button>
        <button class="nav-btn" data-section="historique">📋 Historique</button>
    </nav>
    <button id="settingsBtn" class="icon-btn" title="Paramètres IA">⚙️</button>
</header>
```

- [ ] **Étape 2 : Envelopper le `<main>` existant dans une section `#section-diagnostic`**

Remplacer `<main class="main-content">` et son contenu par :

```html
<!-- Section: Diagnostic -->
<section id="section-diagnostic" class="app-section active">
    <main class="main-content">
        <!-- Left Panel: Input -->
        <section class="panel input-panel glass-panel">
            <h2>Nouveau Diagnostic</h2>
            <p class="subtitle">Entrez les informations du véhicule de 2006 à nos jours.</p>
            <div id="formError" class="error-inline hidden"></div>
            <form id="diagnosticForm">
                <div class="form-group row">
                    <div class="col">
                        <label for="carMake">Marque du véhicule</label>
                        <select id="carMake" required>
                            <option value="">Sélectionnez une marque</option>
                        </select>
                    </div>
                    <div class="col">
                        <label for="carModel">Modèle</label>
                        <select id="carModel" required disabled>
                            <option value="">Sélectionnez un modèle</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="carYear">Année</label>
                    <select id="carYear" required>
                        <option value="">Sélectionnez l'année</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="carSymptom">Symptômes ou Codes OBD2</label>
                    <textarea id="carSymptom" rows="4" placeholder="Ex: Code P0171, ou le moteur broute à l'accélération..." required></textarea>
                </div>
                <button type="submit" class="btn primary-btn" id="submitBtn">
                    <span class="btn-text">Lancer l'Analyse</span>
                    <div class="loader hidden"></div>
                </button>
            </form>
        </section>

        <!-- Right Panel: Output -->
        <section class="panel result-panel glass-panel">
            <div class="result-panel-header">
                <h2>Résultat du Diagnostic</h2>
                <button id="printBtn" class="btn secondary-btn hidden">🖨️ Imprimer</button>
            </div>
            <div id="resultContainer" class="result-content empty">
                <div class="empty-state">
                    <span class="empty-icon">🚙</span>
                    <p>En attente des données du véhicule...</p>
                </div>
            </div>
        </section>
    </main>
</section>

<!-- Section: Base OBD2 -->
<section id="section-obd2" class="app-section hidden">
    <div class="section-content glass-panel">
        <h2>Base de Données OBD2</h2>
        <p class="subtitle">Recherchez un code ou un mot-clé. Cliquez sur un code pour l'utiliser dans le diagnostic.</p>
        <div class="obd2-search-bar">
            <input type="text" id="obd2Search" placeholder="Rechercher : P0171, catalyseur, lambda...">
        </div>
        <div id="obd2Results" class="obd2-results"></div>
    </div>
</section>

<!-- Section: Historique -->
<section id="section-historique" class="app-section hidden">
    <div class="section-content glass-panel">
        <div class="historique-header">
            <h2>Historique des Diagnostics</h2>
            <button id="clearHistoryBtn" class="btn danger-btn">🗑️ Effacer tout</button>
        </div>
        <p class="subtitle">Les 10 derniers diagnostics sauvegardés sur cet appareil.</p>
        <div id="historiqueList" class="historique-list"></div>
    </div>
</section>

<!-- Zone d'impression (masquée en mode normal) -->
<div id="printZone" class="print-zone"></div>
```

- [ ] **Étape 3 : Vérifier dans le navigateur**

Ouvrir `index.html`. La page doit s'afficher sans erreur. Les 3 boutons de navigation sont visibles dans le header.

---

## Task 7: style.css — Styles navigation + sections + nouveaux composants

**Fichiers:**
- Modifier: `style.css`

- [ ] **Étape 1 : Ajouter la variable `--warning-color` dans `:root`**

Dans la section `:root`, ajouter après `--error-color`:

```css
--warning-color: #f59e0b;
```

- [ ] **Étape 2 : Ajouter les styles de navigation dans le header**

Ajouter après les styles `.icon-btn:hover` :

```css
/* Navigation header */
.header-nav {
    display: flex;
    gap: 0.25rem;
}

.nav-btn {
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 0.875rem;
    font-family: var(--font-sans);
    font-weight: 500;
    cursor: pointer;
    padding: 0.5rem 0.85rem;
    border-radius: 8px;
    border-bottom: 2px solid transparent;
    transition: var(--transition);
}

.nav-btn:hover {
    color: var(--text-main);
    background: rgba(255, 255, 255, 0.05);
}

.nav-btn.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
    background: rgba(59, 130, 246, 0.08);
}

@media (max-width: 600px) {
    .header-nav {
        display: none;
    }
}
```

- [ ] **Étape 3 : Ajouter les styles des sections**

Ajouter après les styles `.main-content` :

```css
/* Sections */
.app-section {
    flex: 1;
}

.app-section.hidden {
    display: none;
}

.section-content {
    max-width: 900px;
    margin: 0 auto;
}

/* Result panel header */
.result-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

/* Bouton secondaire */
.secondary-btn {
    background: rgba(255, 255, 255, 0.05);
    color: var(--text-muted);
    border: 1px solid var(--glass-border);
    width: auto;
    padding: 0.4rem 0.85rem;
    font-size: 0.8rem;
}

.secondary-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-main);
}

/* Bouton danger */
.danger-btn {
    background: rgba(239, 68, 68, 0.1);
    color: var(--error-color);
    border: 1px solid rgba(239, 68, 68, 0.3);
    width: auto;
    padding: 0.4rem 0.85rem;
    font-size: 0.8rem;
}

.danger-btn:hover {
    background: rgba(239, 68, 68, 0.2);
}

/* Message d'erreur inline */
.error-inline {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.3);
    border-radius: 8px;
    padding: 0.75rem 1rem;
    color: var(--error-color);
    font-size: 0.875rem;
    margin-bottom: 1rem;
}
```

- [ ] **Étape 4 : Ajouter les styles OBD2**

```css
/* OBD2 */
.obd2-search-bar {
    margin-bottom: 1.5rem;
}

.obd2-results {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 0.75rem;
    max-height: 60vh;
    overflow-y: auto;
    padding-right: 0.25rem;
}

.obd2-card {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid var(--glass-border);
    border-radius: 10px;
    padding: 0.875rem;
    cursor: pointer;
    transition: var(--transition);
}

.obd2-card:hover {
    border-color: var(--primary-color);
    background: rgba(59, 130, 246, 0.05);
    transform: translateY(-1px);
}

.obd2-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.4rem;
}

.obd2-code {
    font-weight: 700;
    font-size: 1rem;
    color: var(--primary-color);
    font-family: 'Courier New', monospace;
}

.obd2-badge {
    font-size: 0.7rem;
    padding: 2px 8px;
    border-radius: 20px;
    font-weight: 600;
}

.badge-1 { background: rgba(16, 185, 129, 0.2); color: #10b981; }
.badge-2 { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
.badge-3 { background: rgba(239, 68, 68, 0.2); color: #ef4444; }

.obd2-desc {
    font-size: 0.85rem;
    color: var(--text-main);
    margin-bottom: 0.4rem;
}

.obd2-categorie {
    font-size: 0.75rem;
    color: var(--text-muted);
}

.obd2-empty {
    color: var(--text-muted);
    text-align: center;
    padding: 3rem;
    grid-column: 1 / -1;
}
```

- [ ] **Étape 5 : Ajouter les styles Historique**

```css
/* Historique */
.historique-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.historique-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-height: 65vh;
    overflow-y: auto;
    padding-right: 0.25rem;
}

.historique-card {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid var(--glass-border);
    border-radius: 10px;
    padding: 1rem;
}

.historique-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
}

.historique-vehicule {
    font-weight: 600;
    color: var(--text-main);
    font-size: 0.95rem;
}

.historique-meta {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    font-size: 0.75rem;
    color: var(--text-muted);
}

.historique-provider {
    background: rgba(59, 130, 246, 0.15);
    color: var(--primary-color);
    padding: 1px 7px;
    border-radius: 20px;
    font-size: 0.7rem;
}

.historique-symptom {
    font-size: 0.8rem;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 0.75rem;
}

.historique-actions {
    display: flex;
    gap: 0.5rem;
}

.historique-empty {
    color: var(--text-muted);
    text-align: center;
    padding: 3rem;
}
```

- [ ] **Étape 6 : Ajouter le @media print**

Ajouter à la fin de `style.css` :

```css
/* ===== IMPRESSION ===== */
.print-zone {
    display: none;
}

@media print {
    body * {
        visibility: hidden;
    }

    .print-zone,
    .print-zone * {
        visibility: visible;
    }

    .print-zone {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        background: white;
        color: black;
        padding: 2rem;
        font-family: 'Inter', sans-serif;
        font-size: 12pt;
    }

    .print-zone h1 {
        font-size: 18pt;
        color: #1e40af;
        margin-bottom: 0.25rem;
    }

    .print-zone h2 {
        font-size: 14pt;
        margin-top: 1rem;
        margin-bottom: 0.25rem;
        color: #1e3a5f;
    }

    .print-zone table {
        width: 100%;
        border-collapse: collapse;
        margin: 0.75rem 0;
    }

    .print-zone th, .print-zone td {
        border: 1px solid #ccc;
        padding: 6px 10px;
        font-size: 10pt;
    }

    .print-zone th {
        background: #e8f0fe;
    }
}
```

---

## Task 8: app.js — Logique de navigation

**Fichiers:**
- Modifier: `app.js`

- [ ] **Étape 1 : Ajouter `showSection()` et les listeners de navigation**

En haut du `DOMContentLoaded`, après les déclarations de DOM elements existantes, ajouter :

```javascript
// Navigation
const navBtns = document.querySelectorAll('.nav-btn');
const appSections = document.querySelectorAll('.app-section');

function showSection(sectionId) {
    appSections.forEach(s => s.classList.add('hidden'));
    navBtns.forEach(b => b.classList.remove('active'));

    const target = document.getElementById('section-' + sectionId);
    if (target) target.classList.remove('hidden');

    const btn = document.querySelector(`.nav-btn[data-section="${sectionId}"]`);
    if (btn) btn.classList.add('active');
}

navBtns.forEach(btn => {
    btn.addEventListener('click', () => showSection(btn.dataset.section));
});
```

- [ ] **Étape 2 : Vérifier dans le navigateur**

Ouvrir `index.html`. Cliquer sur "Base OBD2" → la section OBD2 apparaît. Cliquer sur "Historique" → section Historique. Cliquer sur "Diagnostic" → retour au formulaire.

---

## Task 9: app.js — Expansion carData (marques nord-américaines)

**Fichiers:**
- Modifier: `app.js`

- [ ] **Étape 1 : Ajouter les marques NA dans l'objet `carData`**

Dans `app.js`, dans l'objet `carData`, ajouter les entrées suivantes :

```javascript
"Chevrolet": ["Silverado", "Equinox", "Malibu", "Traverse", "Colorado", "Tahoe", "Suburban", "Blazer", "Trax"],
"Ford": ["F-150", "Escape", "Explorer", "Ranger", "Bronco", "Edge", "Mustang", "Transit"],
"Dodge": ["Ram 1500", "Charger", "Challenger", "Durango", "Journey"],
"Jeep": ["Wrangler", "Grand Cherokee", "Cherokee", "Compass", "Gladiator", "Renegade"],
"RAM": ["1500", "2500", "3500", "ProMaster"],
"GMC": ["Sierra 1500", "Terrain", "Acadia", "Canyon", "Yukon", "Envoy"],
"Chrysler": ["300", "Pacifica", "Voyager"],
"Buick": ["Enclave", "Encore", "Envision", "LaCrosse"],
"Cadillac": ["Escalade", "XT5", "XT4", "CT5", "CT4"],
"Lincoln": ["Navigator", "Aviator", "Corsair", "Nautilus"],
```

Note : L'entrée `"Ford"` existante (Ford européen avec Fiesta, Focus...) doit être fusionnée ou renommée. Remplacer l'entrée `"Ford"` existante par la nouvelle liste complète ci-dessus.

- [ ] **Étape 2 : Vérifier dans le navigateur**

Ouvrir le formulaire → dérouler "Marque du véhicule" → les marques nord-américaines doivent apparaître dans la liste triée alphabétiquement.

---

## Task 10: app.js — Base de données OBD2

**Fichiers:**
- Modifier: `app.js`

- [ ] **Étape 1 : Ajouter l'objet `OBD2_DATABASE` après `SYSTEM_PROMPT`**

```javascript
const OBD2_DATABASE = {
    // ===== MOTEUR (P0) =====
    "P0100": { code: "P0100", description: "Débit massique d'air — circuit défaut", causes: ["Débitmètre encrassé ou défectueux", "Connecteur débranché", "Fuite sur conduit admission"], gravite: 2, categorie: "Moteur" },
    "P0101": { code: "P0101", description: "Débit massique d'air — plage hors limite", causes: ["Filtre à air colmaté", "Débitmètre défectueux", "Fuite d'air admission"], gravite: 2, categorie: "Moteur" },
    "P0110": { code: "P0110", description: "Température air admission — circuit défaut", causes: ["Capteur IAT défectueux", "Fil coupé ou court-circuit"], gravite: 1, categorie: "Moteur" },
    "P0116": { code: "P0116", description: "Température liquide refroidissement — plage", causes: ["Thermostat coincé ouvert", "Capteur ECT défectueux", "Fuite de liquide de refroidissement"], gravite: 2, categorie: "Moteur" },
    "P0118": { code: "P0118", description: "Température liquide refroidissement — haute", causes: ["Capteur ECT court-circuité", "Fil endommagé"], gravite: 2, categorie: "Moteur" },
    "P0120": { code: "P0120", description: "Capteur position papillon (TPS) — circuit A", causes: ["TPS usé ou défectueux", "Connecteur corrodé", "Court-circuit sur signal"], gravite: 2, categorie: "Moteur" },
    "P0130": { code: "P0130", description: "Sonde lambda amont (O2) — circuit lent Banc 1", causes: ["Sonde lambda vieillie", "Fuite d'échappement avant sonde", "Empoisonnement au plomb"], gravite: 2, categorie: "Moteur" },
    "P0135": { code: "P0135", description: "Sonde lambda amont — chauffe circuit Banc 1", causes: ["Résistance de chauffe grillée", "Fil d'alimentation coupé"], gravite: 2, categorie: "Moteur" },
    "P0141": { code: "P0141", description: "Sonde lambda aval — chauffe circuit Banc 1", causes: ["Résistance de chauffe grillée", "Connecteur oxydé"], gravite: 1, categorie: "Moteur" },
    "P0150": { code: "P0150", description: "Sonde lambda amont — circuit lent Banc 2", causes: ["Sonde lambda vieillie Banc 2", "Fuite d'échappement avant sonde", "Empoisonnement au plomb"], gravite: 2, categorie: "Moteur" },
    "P0171": { code: "P0171", description: "Mélange trop pauvre — Banc 1", causes: ["Fuite d'air sur admission", "Injecteur encrassé ou défaillant", "Sonde lambda défectueuse", "Pompe à carburant faible", "Régulateur de pression carburant"], gravite: 2, categorie: "Moteur" },
    "P0172": { code: "P0172", description: "Mélange trop riche — Banc 1", causes: ["Injecteur qui fuit", "Pression carburant trop élevée", "Sonde lambda encrassée", "MAP sensor défectueux"], gravite: 2, categorie: "Moteur" },
    "P0174": { code: "P0174", description: "Mélange trop pauvre — Banc 2", causes: ["Fuite d'air côté Banc 2", "Injecteurs Banc 2 encrassés", "Sonde lambda Banc 2 défectueuse"], gravite: 2, categorie: "Moteur" },
    "P0175": { code: "P0175", description: "Mélange trop riche — Banc 2", causes: ["Injecteurs Banc 2 qui fuient", "Pression carburant élevée", "MAP sensor défectueux"], gravite: 2, categorie: "Moteur" },
    "P0200": { code: "P0200", description: "Circuit injecteur — défaut général", causes: ["Injecteur défectueux", "Fil coupé ou court-circuit", "Calculateur défectueux"], gravite: 3, categorie: "Moteur" },
    "P0261": { code: "P0261", description: "Injecteur cylindre 1 — circuit bas", causes: ["Injecteur court-circuité à la masse", "Faisceau abîmé", "Calculateur défectueux"], gravite: 3, categorie: "Moteur" },
    "P0300": { code: "P0300", description: "Ratés d'allumage détectés — multiple cylindres", causes: ["Bougies d'allumage usées", "Bobines d'allumage défectueuses", "Injecteurs encrassés", "Fuite de compression"], gravite: 3, categorie: "Moteur" },
    "P0301": { code: "P0301", description: "Raté d'allumage détecté — cylindre 1", causes: ["Bougie cylindre 1 défectueuse", "Bobine cylindre 1 en panne", "Injecteur cylindre 1 encrassé"], gravite: 3, categorie: "Moteur" },
    "P0302": { code: "P0302", description: "Raté d'allumage détecté — cylindre 2", causes: ["Bougie cylindre 2 défectueuse", "Bobine cylindre 2 en panne", "Compression faible cylindre 2"], gravite: 3, categorie: "Moteur" },
    "P0303": { code: "P0303", description: "Raté d'allumage détecté — cylindre 3", causes: ["Bougie cylindre 3 défectueuse", "Bobine cylindre 3 en panne", "Injecteur cylindre 3"], gravite: 3, categorie: "Moteur" },
    "P0304": { code: "P0304", description: "Raté d'allumage détecté — cylindre 4", causes: ["Bougie cylindre 4 défectueuse", "Bobine cylindre 4 en panne", "Joint de culasse cylindre 4"], gravite: 3, categorie: "Moteur" },
    "P0325": { code: "P0325", description: "Capteur de cliquetis — circuit Banc 1", causes: ["Capteur cliquetis défectueux", "Fil coupé ou desserré", "Problème de compression moteur"], gravite: 2, categorie: "Moteur" },
    "P0335": { code: "P0335", description: "Capteur position vilebrequin (CKP) — circuit A", causes: ["Capteur CKP défectueux", "Roue phonique endommagée", "Connecteur corrodé"], gravite: 3, categorie: "Moteur" },
    "P0340": { code: "P0340", description: "Capteur position arbre à cames (CMP) — circuit A", causes: ["Capteur CMP défectueux", "Déréglage distribution", "Connecteur lâche"], gravite: 3, categorie: "Moteur" },
    "P0400": { code: "P0400", description: "Recirculation des gaz d'échappement (EGR) — débit", causes: ["Vanne EGR encrassée ou bloquée", "Tuyau EGR obstrué", "Capteur différentiel de pression EGR"], gravite: 2, categorie: "Moteur" },
    "P0401": { code: "P0401", description: "EGR — débit insuffisant détecté", causes: ["Vanne EGR collée fermée", "Dépôts de carbone sur vanne EGR", "Solénoïde EGR défectueux"], gravite: 2, categorie: "Moteur" },
    "P0420": { code: "P0420", description: "Catalyseur sous-efficace — Banc 1", causes: ["Catalyseur vieilli ou empoisonné", "Sonde lambda aval HS", "Huile ou liquide de refroidissement brûlé"], gravite: 2, categorie: "Moteur" },
    "P0430": { code: "P0430", description: "Catalyseur sous-efficace — Banc 2", causes: ["Catalyseur Banc 2 défectueux", "Sonde lambda aval Banc 2 HS", "Ratés d'allumage prolongés"], gravite: 2, categorie: "Moteur" },
    "P0440": { code: "P0440", description: "Système évaporation carburant (EVAP) — défaut général", causes: ["Bouchon de réservoir mal fermé", "Canister saturé", "Fuite de vapeurs de carburant"], gravite: 1, categorie: "Moteur" },
    "P0442": { code: "P0442", description: "EVAP — petite fuite détectée", causes: ["Bouchon réservoir fissuré", "Tuyau EVAP pincé ou fissuré", "Purge solénoïde défectueuse"], gravite: 1, categorie: "Moteur" },
    "P0455": { code: "P0455", description: "EVAP — grande fuite détectée", causes: ["Bouchon réservoir absent ou cassé", "Tuyau EVAP déconnecté", "Canister endommagé"], gravite: 2, categorie: "Moteur" },
    "P0480": { code: "P0480", description: "Motoventilateur de refroidissement — circuit", causes: ["Motoventilateur défectueux", "Relais de ventilateur grillé", "Fil coupé"], gravite: 2, categorie: "Moteur" },
    "P0500": { code: "P0500", description: "Capteur vitesse véhicule (VSS) — circuit", causes: ["Capteur VSS défectueux", "Couronne ABS endommagée", "Fil coupé au capteur"], gravite: 2, categorie: "Moteur" },
    "P0505": { code: "P0505", description: "Régulation du ralenti — circuit", causes: ["Vanne IAC encrassée ou défectueuse", "Fuite d'air au ralenti", "Calculateur défectueux"], gravite: 2, categorie: "Moteur" },
    "P0600": { code: "P0600", description: "Communication série — lien défaut", causes: ["Calculateur défectueux", "Problème alimentation calculateur", "Bus CAN perturbé"], gravite: 3, categorie: "Moteur" },

    // ===== TRANSMISSION (P07) =====
    "P0700": { code: "P0700", description: "Contrôle transmission — défaut général (TCM)", causes: ["Défaut détecté par le TCM", "Lire les codes spécifiques transmission", "Problème mécanique boîte"], gravite: 2, categorie: "Transmission" },
    "P0715": { code: "P0715", description: "Capteur vitesse turbine — circuit A", causes: ["Capteur vitesse turbine défectueux", "Fil coupé", "Dépôts métal dans boîte"], gravite: 2, categorie: "Transmission" },
    "P0720": { code: "P0720", description: "Capteur vitesse sortie transmission — circuit", causes: ["Capteur OSS défectueux", "Couronne ABS endommagée", "Connecteur corrodé"], gravite: 2, categorie: "Transmission" },
    "P0730": { code: "P0730", description: "Rapport de transmission incorrect", causes: ["Solénoïde de rapport défectueux", "Huile de boîte dégradée ou basse", "Usure mécanique interne"], gravite: 3, categorie: "Transmission" },
    "P0750": { code: "P0750", description: "Solénoïde de passage rapport A — circuit", causes: ["Solénoïde défectueux", "Fil coupé ou court-circuit", "Valve body encrassée"], gravite: 3, categorie: "Transmission" },

    // ===== ABS / CHASSIS (C0) =====
    "C0031": { code: "C0031", description: "Capteur vitesse roue avant droite — circuit", causes: ["Capteur ABS avant droit défectueux", "Anneau ABS fissuré ou sale", "Fil coupé"], gravite: 3, categorie: "Châssis" },
    "C0034": { code: "C0034", description: "Capteur vitesse roue avant gauche — circuit", causes: ["Capteur ABS avant gauche défectueux", "Anneau ABS encrassé", "Connecteur oxydé"], gravite: 3, categorie: "Châssis" },
    "C0035": { code: "C0035", description: "Capteur vitesse roue arrière droite — circuit", causes: ["Capteur ABS arrière droit défectueux", "Anneau ABS endommagé", "Fil rompu"], gravite: 3, categorie: "Châssis" },
    "C0040": { code: "C0040", description: "Capteur vitesse roue arrière gauche — circuit", causes: ["Capteur ABS arrière gauche défectueux", "Anneau ABS encrassé", "Connecteur corrodé"], gravite: 3, categorie: "Châssis" },

    // ===== RÉSEAU CAN (U0) =====
    "U0001": { code: "U0001", description: "Bus CAN haute vitesse — communication perdue", causes: ["Problème d'alimentation calculateur", "Bus CAN court-circuité", "Calculateur principal défectueux"], gravite: 3, categorie: "Réseau CAN" },
    "U0100": { code: "U0100", description: "Communication perdue avec calculateur moteur (ECM/PCM)", causes: ["Calculateur moteur hors tension", "Fusible ECM grillé", "Bus CAN interrompu"], gravite: 3, categorie: "Réseau CAN" },
    "U0101": { code: "U0101", description: "Communication perdue avec calculateur transmission (TCM)", causes: ["TCM hors tension", "Fusible TCM grillé", "Bus CAN perturbé"], gravite: 3, categorie: "Réseau CAN" },
    "U0121": { code: "U0121", description: "Communication perdue avec module ABS", causes: ["Calculateur ABS défectueux", "Fusible ABS grillé", "Bus CAN interrompu"], gravite: 3, categorie: "Réseau CAN" },
    "U0155": { code: "U0155", description: "Communication perdue avec tableau de bord (cluster)", causes: ["Tableau de bord hors tension", "Fusible grillé", "Bus CAN interrompu"], gravite: 2, categorie: "Réseau CAN" },

    // ===== CARROSSERIE / CLIMATISATION (B0) =====
    "B0070": { code: "B0070", description: "Module airbag conducteur — circuit", causes: ["Airbag conducteur défectueux", "Connecteur spiralé usé", "Module airbag en panne"], gravite: 3, categorie: "Carrosserie" },
    "B0075": { code: "B0075", description: "Module airbag passager — circuit", causes: ["Airbag passager défectueux", "Connecteur sous siège corrodé", "Module airbag en panne"], gravite: 3, categorie: "Carrosserie" },
    "B1000": { code: "B1000", description: "Calculateur de confort — défaut interne", causes: ["Calculateur BSM/BCM défectueux", "Problème d'alimentation", "Mise à jour logicielle requise"], gravite: 2, categorie: "Carrosserie" },
};
```

- [ ] **Étape 2 : Vérifier la syntaxe**

Ouvrir la console navigateur (F12). Taper `Object.keys(OBD2_DATABASE).length` — doit retourner un nombre > 50.

---

## Task 11: app.js — Logique de recherche OBD2

**Fichiers:**
- Modifier: `app.js`

- [ ] **Étape 1 : Ajouter la référence DOM et la fonction de rendu OBD2**

Après les déclarations de variables DOM existantes, ajouter :

```javascript
// OBD2
const obd2SearchInput = document.getElementById('obd2Search');
const obd2ResultsDiv = document.getElementById('obd2Results');

function graviteLabel(g) {
    const labels = { 1: 'Info', 2: 'Attention', 3: 'Critique' };
    return labels[g] || 'Info';
}

function renderOBD2Cards(codes) {
    if (codes.length === 0) {
        obd2ResultsDiv.innerHTML = '<p class="obd2-empty">Aucun code trouvé pour cette recherche.</p>';
        return;
    }
    obd2ResultsDiv.innerHTML = codes.map(entry => `
        <div class="obd2-card" title="Cliquer pour utiliser dans le diagnostic" onclick="useOBD2Code('${entry.code}')">
            <div class="obd2-card-header">
                <span class="obd2-code">${entry.code}</span>
                <span class="obd2-badge badge-${entry.gravite}">${graviteLabel(entry.gravite)}</span>
            </div>
            <p class="obd2-desc">${entry.description}</p>
            <p class="obd2-categorie">${entry.categorie} · Causes : ${entry.causes.slice(0, 2).join(', ')}${entry.causes.length > 2 ? '...' : ''}</p>
        </div>
    `).join('');
}

function useOBD2Code(code) {
    const symptomField = document.getElementById('carSymptom');
    const current = symptomField.value.trim();
    symptomField.value = current ? `${current}, ${code}` : code;
    showSection('diagnostic');
    symptomField.focus();
}

// Afficher tous les codes au chargement de la section OBD2
renderOBD2Cards(Object.values(OBD2_DATABASE));

// Filtre en temps réel
obd2SearchInput.addEventListener('input', () => {
    const query = obd2SearchInput.value.trim().toLowerCase();
    if (!query) {
        renderOBD2Cards(Object.values(OBD2_DATABASE));
        return;
    }
    const filtered = Object.values(OBD2_DATABASE).filter(entry =>
        entry.code.toLowerCase().includes(query) ||
        entry.description.toLowerCase().includes(query) ||
        entry.causes.some(c => c.toLowerCase().includes(query)) ||
        entry.categorie.toLowerCase().includes(query)
    );
    renderOBD2Cards(filtered);
});
```

- [ ] **Étape 2 : Vérifier dans le navigateur**

Aller dans "Base OBD2" → les codes s'affichent en grille. Taper "lambda" dans la recherche → filtrage en temps réel. Cliquer un code → naviguer vers Diagnostic avec le code pré-rempli.

---

## Task 12: app.js — Logique Historique

**Fichiers:**
- Modifier: `app.js`

- [ ] **Étape 1 : Ajouter les fonctions d'historique**

```javascript
// Historique
const MAX_HISTORY = 10;
const HISTORY_KEY = 'amboul_history';
const historiqueList = document.getElementById('historiqueList');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

function loadHistory() {
    try {
        return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    } catch {
        return [];
    }
}

function saveToHistory(entry) {
    const history = loadHistory();
    history.unshift({ id: Date.now(), date: new Date().toLocaleString('fr-CA'), ...entry });
    if (history.length > MAX_HISTORY) history.pop();
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderHistorique();
}

function deleteHistoryEntry(id) {
    const history = loadHistory().filter(e => e.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    renderHistorique();
}

function reloadFromHistory(entry) {
    document.getElementById('carSymptom').value = entry.symptom;
    showSection('diagnostic');
}

function renderHistorique() {
    const history = loadHistory();
    if (history.length === 0) {
        historiqueList.innerHTML = '<p class="historique-empty">Aucun diagnostic sauvegardé.</p>';
        return;
    }
    historiqueList.innerHTML = history.map(entry => `
        <div class="historique-card">
            <div class="historique-card-header">
                <div>
                    <div class="historique-vehicule">${entry.make} ${entry.model} (${entry.year})</div>
                    <p class="historique-symptom">${entry.symptom}</p>
                </div>
                <div class="historique-meta">
                    <span class="historique-provider">${entry.provider}</span>
                    <span>${entry.date}</span>
                </div>
            </div>
            <div class="historique-actions">
                <button class="btn secondary-btn" onclick="reloadFromHistory(${JSON.stringify(entry).replace(/"/g, '&quot;')})">↩️ Recharger</button>
                <button class="btn danger-btn" onclick="deleteHistoryEntry(${entry.id})">🗑️ Supprimer</button>
            </div>
        </div>
    `).join('');
}

clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Effacer tout l\'historique ?')) {
        localStorage.removeItem(HISTORY_KEY);
        renderHistorique();
    }
});

// Rendre les fonctions accessibles depuis le HTML inline
window.reloadFromHistory = reloadFromHistory;
window.deleteHistoryEntry = deleteHistoryEntry;
window.useOBD2Code = useOBD2Code;

// Charger l'historique au démarrage
renderHistorique();
```

- [ ] **Étape 2 : Vérifier dans le navigateur**

Faire un diagnostic → aller dans Historique → aucune entrée encore. L'entrée sera ajoutée à la prochaine tâche.

---

## Task 13: app.js — Auto-save + bouton impression

**Fichiers:**
- Modifier: `app.js`

- [ ] **Étape 1 : Référencer le bouton d'impression**

Dans les déclarations DOM, ajouter :

```javascript
const printBtn = document.getElementById('printBtn');
const printZone = document.getElementById('printZone');
```

- [ ] **Étape 2 : Modifier le bloc `try` du `form.addEventListener('submit', ...)` pour sauvegarder l'historique et afficher le bouton impression**

Dans le bloc `try`, après avoir assigné `textResponse` (avant le parsing markdown), ajouter :

```javascript
// Sauvegarder dans l'historique
saveToHistory({
    make,
    model,
    year,
    symptom,
    provider,
    result: textResponse
});
```

Et après le `resultContainer.innerHTML = marked.parse(textResponse)`, ajouter :

```javascript
// Afficher le bouton impression
printBtn.classList.remove('hidden');
```

Dans le bloc `catch`, ajouter :

```javascript
printBtn.classList.add('hidden');
```

- [ ] **Étape 3 : Ajouter le listener du bouton impression**

```javascript
printBtn.addEventListener('click', () => {
    const make = document.getElementById('carMake').value;
    const model = document.getElementById('carModel').value;
    const year = document.getElementById('carYear').value;
    const symptom = document.getElementById('carSymptom').value;

    printZone.innerHTML = `
        <h1>🔧 Amboul Mecanic Repair</h1>
        <p style="color:#555; margin-bottom:1rem;">Rapport de diagnostic — ${new Date().toLocaleString('fr-CA')}</p>
        <h2>Véhicule : ${make} ${model} (${year})</h2>
        <h3>Symptômes / Codes :</h3>
        <p>${symptom}</p>
        <h3>Diagnostic IA :</h3>
        ${resultContainer.innerHTML}
    `;
    window.print();
});
```

- [ ] **Étape 4 : Vérifier dans le navigateur**

Faire un diagnostic complet → le bouton "🖨️ Imprimer" apparaît → cliquer → la boîte d'impression s'ouvre avec fond blanc, logo, véhicule, symptômes et diagnostic. Aller dans Historique → la nouvelle entrée y est.

---

## Task 14: app.js — Validation inline + meilleure gestion d'erreurs

**Fichiers:**
- Modifier: `app.js`

- [ ] **Étape 1 : Référencer le div d'erreur inline**

Dans les déclarations DOM, ajouter :

```javascript
const formError = document.getElementById('formError');

function showFormError(message) {
    formError.textContent = message;
    formError.classList.remove('hidden');
    formError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function clearFormError() {
    formError.classList.add('hidden');
    formError.textContent = '';
}
```

- [ ] **Étape 2 : Remplacer les `alert()` dans `form.addEventListener('submit', ...)`**

Remplacer :

```javascript
if (!apiKey) {
    alert(`Veuillez d'abord configurer votre clé API pour ${provider} dans les paramètres (⚙️).`);
    openModal();
    return;
}
```

Par :

```javascript
if (!apiKey) {
    showFormError(`Clé API ${provider} manquante. Configurez-la dans ⚙️ Paramètres.`);
    openModal();
    return;
}
clearFormError();
```

- [ ] **Étape 3 : Améliorer le message d'erreur dans le bloc `catch`**

Remplacer le message d'erreur générique dans le `catch` par :

```javascript
let userMessage = error.message;
if (error.message.includes('401') || error.message.includes('Unauthorized')) {
    userMessage = 'Clé API invalide ou expirée. Vérifiez vos paramètres (⚙️).';
} else if (error.message.includes('429') || error.message.includes('quota')) {
    userMessage = 'Quota API dépassé. Réessayez dans quelques minutes.';
} else if (error.message.includes('model')) {
    userMessage = 'Modèle IA invalide. Vérifiez le "Nom du Modèle" dans les paramètres (⚙️).';
} else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
    userMessage = 'Erreur réseau. Vérifiez votre connexion internet.';
}

resultContainer.innerHTML = `
    <div class="empty-state">
        <span class="empty-icon" style="color: var(--error-color)">⚠️</span>
        <p style="color: var(--error-color); font-weight: 600;">${userMessage}</p>
        <p style="font-size: 0.8rem; margin-top: 0.5rem; color: var(--text-muted);">Détail technique : ${error.message}</p>
    </div>
`;
```

- [ ] **Étape 4 : Remplacer l'`alert()` du bouton Sauvegarder dans la modal**

Remplacer :

```javascript
alert('Paramètres sauvegardés avec succès !');
```

Par l'ajout d'un feedback visuel temporaire sur le bouton :

```javascript
saveSettingsBtn.textContent = '✅ Sauvegardé !';
setTimeout(() => { saveSettingsBtn.textContent = 'Sauvegarder'; }, 2000);
```

- [ ] **Étape 5 : Test final complet**

Ouvrir `index.html` et tester :
1. Soumettre sans clé API → message d'erreur inline rouge (pas d'alert)
2. Faire un diagnostic complet → auto-save dans historique, bouton imprimer visible
3. Imprimer → rapport propre fond blanc
4. Base OBD2 → recherche "P0300" → carte avec causes apparaît, clic → préremplit le formulaire
5. Historique → entrée présente avec bouton Recharger et Supprimer
6. Sauvegarder paramètres → feedback sur le bouton, pas d'alert

---

## Récapitulatif des commits suggérés

```bash
git add CLAUDE.md README.md && git commit -m "docs: add CLAUDE.md and README"
git add .claude/agents/ && git commit -m "feat: add diagnosticien, obd2-expert, ui-designer agents"
git add .claude/skills/ && git commit -m "feat: add amboul-mecanic, export-rapport, api-debug skills"
git add .claude/settings.local.json && git commit -m "config: extend permissions"
git add index.html style.css && git commit -m "feat: add nav header and section containers"
git add app.js && git commit -m "feat: add navigation logic and NA car makes"
git add app.js && git commit -m "feat: add OBD2 database and search"
git add app.js && git commit -m "feat: add history, print, and inline validation"
```
