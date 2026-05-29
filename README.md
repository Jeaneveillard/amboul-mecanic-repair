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
| Google Gemini | gemini-2.5-flash | console.cloud.google.com |
| Anthropic Claude | claude-haiku-4-5-20251001 | console.anthropic.com |
| DeepSeek | deepseek-chat | platform.deepseek.com |
| xAI Grok | grok-3-mini | console.x.ai |

## Fonctionnalités

- Diagnostic IA multi-fournisseur
- Base de données OBD2 intégrée (150+ codes)
- Historique des 10 derniers diagnostics
- Export / Impression du rapport
- Support véhicules 2006 — présent (Europe + Amérique du Nord)

## Technologies

HTML5 · CSS3 · JavaScript ES6+ · marked.js · localStorage
