# Amboul Mecanic Repair

Outil de diagnostic automobile IA pour mécaniciens. Entrez les informations d'un véhicule et ses symptômes, l'IA génère un diagnostic structuré avec coûts des pièces ($ CAD), schéma de localisation et outils nécessaires.

## Utilisation

1. Ouvrir `index.html` dans un navigateur moderne (ou la version hébergée)
2. Se connecter avec le compte fourni par l'administrateur — ou « Continuer sans compte » (mode gratuit Pollinations)
3. Sélectionner le véhicule (marque / modèle / année)
4. Entrer les symptômes ou codes OBD2
5. Cliquer « Lancer l'Analyse »

## Navigation

- **Diagnostic** — Formulaire principal d'analyse IA + photo du véhicule + schéma des pièces en cause
- **Base OBD2** — Recherche de codes P/U/B/C (y compris codes VE) avec description et gravité
- **Historique** — 10 derniers diagnostics sauvegardés localement, rechargeables sans nouvel appel IA
- **Admin** — Gestion des comptes mécaniciens (visible uniquement pour l'administrateur)

## Architecture

- **Frontend** : HTML/CSS/JS vanilla, 4 langues (FR/EN/ES/HT), responsive mobile/tablette
- **Backend** (`backend/`) : Node.js/Express sur Render.com, PostgreSQL (Neon.tech), auth JWT
- Les clés API IA sont stockées côté serveur uniquement (`backend/.env`)

## Fournisseurs IA (configurés côté backend)

| Fournisseur | Modèle par défaut |
|-------------|-------------------|
| Pollinations (gratuit) | openai |
| Google Gemini | gemini-2.5-flash |
| Anthropic Claude | claude-haiku-4-5-20251001 |
| DeepSeek | deepseek-chat |
| xAI Grok | grok-3-mini |

## Fonctionnalités

- Diagnostic IA multi-fournisseur (thermique, hybride, 100% électrique)
- Base de données OBD2 intégrée (codes P/U/B/C + codes VE)
- Comptes mécaniciens gérés par l'admin, déconnexion auto après 30 min d'inactivité
- Historique des 10 derniers diagnostics avec rechargement hors-ligne
- Export / Impression du rapport
- Support véhicules 2006 — présent (Europe + Amérique du Nord + marques VE)

## Déploiement backend

Variables d'environnement requises (voir `backend/.env.example`) : `JWT_SECRET`, `DATABASE_URL`, `ADMIN_EMAIL`, `ADMIN_INITIAL_PASSWORD` + clés API optionnelles.

## Technologies

HTML5 · CSS3 · JavaScript ES6+ · marked.js · DOMPurify · Express · PostgreSQL · JWT
