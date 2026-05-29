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
- DeepSeek : `deepseek-v3`, `deepseek-reasoner`
- Grok : `grok-3-mini`, `grok-3`, `grok-2-1212`
