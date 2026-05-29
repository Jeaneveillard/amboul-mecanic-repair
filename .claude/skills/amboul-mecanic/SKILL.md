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
5. **Erreurs** — afficher dans `#formError` avec classe `error-inline`, pas d'`alert()`

## Checklist après avoir codé

- [ ] Tester la fonctionnalité dans un navigateur (ouvrir `index.html`)
- [ ] Vérifier que les 4 providers API (Gemini, Claude, DeepSeek, Grok) ne sont pas cassés
- [ ] Vérifier que le localStorage est cohérent (pas de clés fantômes)
- [ ] Vérifier le rendu sur mobile (redimensionner à 375px)
