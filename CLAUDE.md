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
