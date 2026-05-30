# Multilinguisme FR/EN/ES/HT — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter un sélecteur de langue (FR/EN/ES/HT) qui traduit absolument toute l'interface et fait répondre l'IA dans la langue choisie.

**Architecture:** Un fichier `i18n.js` contient le dictionnaire complet des 4 langues et les fonctions `t(key)`, `setLang(lang)`, `applyTranslations()`. `app.js` remplace tous les textes codés en dur par `t('clé')`. `api.js` ajoute l'instruction de langue au prompt IA.

**Tech Stack:** Vanilla JS, localStorage, 4 fichiers modifiés + 1 créé.

---

## Fichiers

| Fichier | Action |
|---------|--------|
| `i18n.js` | Créer — dictionnaire 4 langues + fonctions |
| `index.html` | Modifier — boutons langue dans le header |
| `style.css` | Modifier — styles `.lang-btn` |
| `app.js` | Modifier — `t()` partout + `applyTranslations()` |
| `api.js` | Modifier — instruction langue dans le userPrompt |

---

## Task 1 : Créer `i18n.js`

**Fichiers :**
- Créer : `i18n.js` (à la racine du projet, à côté de `app.js`)

- [ ] **Étape 1 : Créer `i18n.js` avec ce contenu exact**

```javascript
// ===== Système de traduction Amboul Mecanic Repair =====
// Langues : fr (Français), en (English), es (Español), ht (Kreyòl ayisyen)

const TRANSLATIONS = {
    fr: {
        // Navigation
        'nav.diagnostic': '🔧 Diagnostic',
        'nav.obd2': '🔍 Base OBD2',
        'nav.history': '📋 Historique',
        // Mobile nav
        'mobile.diagnostic': 'Diagnostic',
        'mobile.obd2': 'OBD2',
        'mobile.history': 'Historique',
        'mobile.settings': 'Paramètres',
        // Formulaire
        'form.title': 'Nouveau Diagnostic',
        'form.subtitle': 'Entrez les informations du véhicule de 2006 à nos jours.',
        'form.make': 'Marque du véhicule',
        'form.make_placeholder': 'Sélectionnez une marque',
        'form.model': 'Modèle',
        'form.model_placeholder': 'Sélectionnez un modèle',
        'form.year': 'Année',
        'form.year_placeholder': 'Sélectionnez l\'année',
        'form.symptom': 'Symptômes ou Codes OBD2',
        'form.symptom_placeholder': 'Ex: Code P0171, ou le moteur broute à l\'accélération...',
        'form.submit': 'Lancer l\'Analyse',
        // Résultat
        'result.title': 'Résultat du Diagnostic',
        'result.empty': 'En attente des données du véhicule...',
        'result.print': '🖨️ Imprimer',
        // Schéma panne
        'diag.title': 'Schéma de panne',
        'diag.empty': 'Lancez un diagnostic pour localiser la panne sur le véhicule',
        'diag.parts_title': '🔧 Pièces en cause',
        'diag.parts_empty': 'Lancez un diagnostic pour voir les pièces en cause',
        // OBD2
        'obd2.title': 'Base de Données OBD2',
        'obd2.subtitle': 'Recherchez un code ou un mot-clé. Cliquez sur un code pour l\'utiliser dans le diagnostic.',
        'obd2.search_placeholder': 'Rechercher : P0171, catalyseur, lambda...',
        'obd2.empty': 'Aucun code trouvé pour cette recherche.',
        'obd2.click_hint': 'Cliquer pour utiliser dans le diagnostic',
        // Historique
        'history.title': 'Historique des Diagnostics',
        'history.subtitle': 'Les 10 derniers diagnostics sauvegardés sur cet appareil.',
        'history.clear': '🗑️ Effacer tout',
        'history.empty': 'Aucun diagnostic sauvegardé.',
        'history.reload': '↩️ Recharger',
        'history.delete': '🗑️ Supprimer',
        'history.confirm_clear': 'Effacer tout l\'historique ?',
        // Auth overlay
        'auth.subtitle': 'Connectez-vous pour accéder à l\'outil de diagnostic.',
        'auth.email': 'Email',
        'auth.email_placeholder': 'mecanicien@garage.com',
        'auth.password': 'Mot de passe',
        'auth.password_placeholder': 'Minimum 8 caractères',
        'auth.signin': 'Se connecter',
        'auth.register': 'Créer un compte',
        'auth.no_account': 'Pas encore de compte ?',
        'auth.have_account': 'Déjà un compte ?',
        'auth.free_mode': 'Continuer sans compte (Pollinations gratuit)',
        // Settings modal
        'settings.title': 'Configuration IA',
        'settings.user': 'Utilisateur connecté',
        'settings.backend_url': 'URL du Backend',
        'settings.backend_hint': 'Laissez vide pour Pollinations gratuit sans compte.',
        'settings.provider': 'Fournisseur IA préféré',
        'settings.model': 'Modèle personnalisé (Optionnel)',
        'settings.model_hint': 'Ex: claude-sonnet-4-6, gemini-2.5-pro, grok-3',
        'settings.save': 'Sauvegarder',
        'settings.logout': 'Se déconnecter',
        // Tableau symptômes
        'check.header': 'État',
        'check.normal': 'Marquer comme normal',
        'check.verified': 'Normal ✓ — cliquer pour annuler',
        // Erreurs
        'error.api_key': 'Clé API manquante. Configurez-la dans ⚙️ Paramètres, ou choisissez le Mode Gratuit.',
        'error.session': 'Session expirée. Reconnectez-vous.',
        'error.network': 'Erreur réseau. Vérifiez votre connexion internet.',
        'error.quota': 'Quota API dépassé. Réessayez dans quelques minutes.',
        'error.model': 'Modèle IA invalide. Vérifiez le "Nom du Modèle" dans les paramètres (⚙️).',
        // Fournisseurs IA
        'provider.pollinations': '🆓 Mode Gratuit — Sans clé API',
        'provider.gemini': 'Google Gemini',
        'provider.claude': 'Anthropic Claude',
        'provider.deepseek': 'DeepSeek',
        'provider.grok': 'xAI Grok',
        // Divers
        'photo.select': 'Sélectionnez un véhicule',
        'zone.affected': 'Zone affectée :',
        'parts.google': '🔍 Voir sur Google',
        'severity.info': 'Info',
        'severity.warning': 'Attention',
        'severity.critical': 'Critique',
        // Instruction langue pour l'IA
        'ai.lang_instruction': '',
    },

    en: {
        'nav.diagnostic': '🔧 Diagnosis',
        'nav.obd2': '🔍 OBD2 Database',
        'nav.history': '📋 History',
        'mobile.diagnostic': 'Diagnosis',
        'mobile.obd2': 'OBD2',
        'mobile.history': 'History',
        'mobile.settings': 'Settings',
        'form.title': 'New Diagnosis',
        'form.subtitle': 'Enter vehicle information from 2006 to present.',
        'form.make': 'Vehicle Make',
        'form.make_placeholder': 'Select a make',
        'form.model': 'Model',
        'form.model_placeholder': 'Select a model',
        'form.year': 'Year',
        'form.year_placeholder': 'Select the year',
        'form.symptom': 'Symptoms or OBD2 Codes',
        'form.symptom_placeholder': 'E.g.: Code P0171, or engine misfiring...',
        'form.submit': 'Run Analysis',
        'result.title': 'Diagnosis Result',
        'result.empty': 'Waiting for vehicle data...',
        'result.print': '🖨️ Print',
        'diag.title': 'Fault Diagram',
        'diag.empty': 'Run a diagnosis to locate the fault on the vehicle',
        'diag.parts_title': '🔧 Parts at Fault',
        'diag.parts_empty': 'Run a diagnosis to see the faulty parts',
        'obd2.title': 'OBD2 Database',
        'obd2.subtitle': 'Search a code or keyword. Click to use in diagnosis.',
        'obd2.search_placeholder': 'Search: P0171, catalytic converter, lambda...',
        'obd2.empty': 'No code found for this search.',
        'obd2.click_hint': 'Click to use in diagnosis',
        'history.title': 'Diagnosis History',
        'history.subtitle': 'The last 10 diagnoses saved on this device.',
        'history.clear': '🗑️ Clear all',
        'history.empty': 'No diagnosis saved.',
        'history.reload': '↩️ Reload',
        'history.delete': '🗑️ Delete',
        'history.confirm_clear': 'Clear all history?',
        'auth.subtitle': 'Sign in to access the diagnostic tool.',
        'auth.email': 'Email',
        'auth.email_placeholder': 'mechanic@garage.com',
        'auth.password': 'Password',
        'auth.password_placeholder': 'Minimum 8 characters',
        'auth.signin': 'Sign in',
        'auth.register': 'Create account',
        'auth.no_account': 'No account yet?',
        'auth.have_account': 'Already have an account?',
        'auth.free_mode': 'Continue without account (free Pollinations)',
        'settings.title': 'AI Configuration',
        'settings.user': 'Logged in as',
        'settings.backend_url': 'Backend URL',
        'settings.backend_hint': 'Leave empty for free Pollinations without account.',
        'settings.provider': 'Preferred AI Provider',
        'settings.model': 'Custom Model (Optional)',
        'settings.model_hint': 'E.g.: claude-sonnet-4-6, gemini-2.5-pro, grok-3',
        'settings.save': 'Save',
        'settings.logout': 'Sign out',
        'check.header': 'Status',
        'check.normal': 'Mark as normal',
        'check.verified': 'Normal ✓ — click to undo',
        'error.api_key': 'Missing API key. Configure it in ⚙️ Settings, or choose Free Mode.',
        'error.session': 'Session expired. Please sign in again.',
        'error.network': 'Network error. Check your internet connection.',
        'error.quota': 'API quota exceeded. Try again in a few minutes.',
        'error.model': 'Invalid AI model. Check the "Custom Model" in settings (⚙️).',
        'provider.pollinations': '🆓 Free Mode — No API Key',
        'provider.gemini': 'Google Gemini',
        'provider.claude': 'Anthropic Claude',
        'provider.deepseek': 'DeepSeek',
        'provider.grok': 'xAI Grok',
        'photo.select': 'Select a vehicle',
        'zone.affected': 'Affected zone:',
        'parts.google': '🔍 View on Google',
        'severity.info': 'Info',
        'severity.warning': 'Warning',
        'severity.critical': 'Critical',
        'ai.lang_instruction': 'Respond ONLY in English.',
    },

    es: {
        'nav.diagnostic': '🔧 Diagnóstico',
        'nav.obd2': '🔍 Base OBD2',
        'nav.history': '📋 Historial',
        'mobile.diagnostic': 'Diagnóstico',
        'mobile.obd2': 'OBD2',
        'mobile.history': 'Historial',
        'mobile.settings': 'Ajustes',
        'form.title': 'Nuevo Diagnóstico',
        'form.subtitle': 'Ingrese la información del vehículo desde 2006.',
        'form.make': 'Marca del vehículo',
        'form.make_placeholder': 'Seleccione una marca',
        'form.model': 'Modelo',
        'form.model_placeholder': 'Seleccione un modelo',
        'form.year': 'Año',
        'form.year_placeholder': 'Seleccione el año',
        'form.symptom': 'Síntomas o Códigos OBD2',
        'form.symptom_placeholder': 'Ej: Código P0171, o el motor falla...',
        'form.submit': 'Iniciar Análisis',
        'result.title': 'Resultado del Diagnóstico',
        'result.empty': 'Esperando datos del vehículo...',
        'result.print': '🖨️ Imprimir',
        'diag.title': 'Diagrama de Falla',
        'diag.empty': 'Ejecute un diagnóstico para localizar la falla en el vehículo',
        'diag.parts_title': '🔧 Piezas Defectuosas',
        'diag.parts_empty': 'Ejecute un diagnóstico para ver las piezas defectuosas',
        'obd2.title': 'Base de Datos OBD2',
        'obd2.subtitle': 'Busque un código o palabra clave. Haga clic para usar en el diagnóstico.',
        'obd2.search_placeholder': 'Buscar: P0171, catalizador, lambda...',
        'obd2.empty': 'No se encontró código para esta búsqueda.',
        'obd2.click_hint': 'Haga clic para usar en el diagnóstico',
        'history.title': 'Historial de Diagnósticos',
        'history.subtitle': 'Los últimos 10 diagnósticos guardados en este dispositivo.',
        'history.clear': '🗑️ Borrar todo',
        'history.empty': 'Ningún diagnóstico guardado.',
        'history.reload': '↩️ Recargar',
        'history.delete': '🗑️ Eliminar',
        'history.confirm_clear': '¿Borrar todo el historial?',
        'auth.subtitle': 'Inicie sesión para acceder a la herramienta de diagnóstico.',
        'auth.email': 'Correo electrónico',
        'auth.email_placeholder': 'mecanico@taller.com',
        'auth.password': 'Contraseña',
        'auth.password_placeholder': 'Mínimo 8 caracteres',
        'auth.signin': 'Iniciar sesión',
        'auth.register': 'Crear cuenta',
        'auth.no_account': '¿Aún no tienes cuenta?',
        'auth.have_account': '¿Ya tienes una cuenta?',
        'auth.free_mode': 'Continuar sin cuenta (Pollinations gratis)',
        'settings.title': 'Configuración IA',
        'settings.user': 'Usuario conectado',
        'settings.backend_url': 'URL del Backend',
        'settings.backend_hint': 'Deje vacío para Pollinations gratis sin cuenta.',
        'settings.provider': 'Proveedor IA preferido',
        'settings.model': 'Modelo personalizado (Opcional)',
        'settings.model_hint': 'Ej: claude-sonnet-4-6, gemini-2.5-pro, grok-3',
        'settings.save': 'Guardar',
        'settings.logout': 'Cerrar sesión',
        'check.header': 'Estado',
        'check.normal': 'Marcar como normal',
        'check.verified': 'Normal ✓ — clic para deshacer',
        'error.api_key': 'Clave API faltante. Configúrela en ⚙️ Ajustes, o elija el Modo Gratuito.',
        'error.session': 'Sesión expirada. Inicie sesión de nuevo.',
        'error.network': 'Error de red. Verifique su conexión a internet.',
        'error.quota': 'Cuota API excedida. Inténtelo de nuevo en unos minutos.',
        'error.model': 'Modelo IA inválido. Verifique el "Modelo personalizado" en ajustes (⚙️).',
        'provider.pollinations': '🆓 Modo Gratuito — Sin clave API',
        'provider.gemini': 'Google Gemini',
        'provider.claude': 'Anthropic Claude',
        'provider.deepseek': 'DeepSeek',
        'provider.grok': 'xAI Grok',
        'photo.select': 'Seleccione un vehículo',
        'zone.affected': 'Zona afectada:',
        'parts.google': '🔍 Ver en Google',
        'severity.info': 'Info',
        'severity.warning': 'Atención',
        'severity.critical': 'Crítico',
        'ai.lang_instruction': 'Responde ÚNICAMENTE en español.',
    },

    ht: {
        'nav.diagnostic': '🔧 Dyagnostik',
        'nav.obd2': '🔍 Baz OBD2',
        'nav.history': '📋 Istwa',
        'mobile.diagnostic': 'Dyagnostik',
        'mobile.obd2': 'OBD2',
        'mobile.history': 'Istwa',
        'mobile.settings': 'Paramèt',
        'form.title': 'Nouvo Dyagnostik',
        'form.subtitle': 'Antre enfòmasyon veyikil la soti 2006 rive jodi a.',
        'form.make': 'Mak veyikil la',
        'form.make_placeholder': 'Chwazi yon mak',
        'form.model': 'Modèl',
        'form.model_placeholder': 'Chwazi yon modèl',
        'form.year': 'Ane',
        'form.year_placeholder': 'Chwazi ane a',
        'form.symptom': 'Sentom oswa Kòd OBD2',
        'form.symptom_placeholder': 'Egz: Kòd P0171, oswa motè a bat mal...',
        'form.submit': 'Kòmanse Analiz',
        'result.title': 'Rezilta Dyagnostik',
        'result.empty': 'Ap tann done veyikil la...',
        'result.print': '🖨️ Enprime',
        'diag.title': 'Dyagram Pàn',
        'diag.empty': 'Kòmanse yon dyagnostik pou jwenn kote pàn nan sou veyikil la',
        'diag.parts_title': '🔧 Pati ki Defye',
        'diag.parts_empty': 'Kòmanse yon dyagnostik pou wè pati ki defye yo',
        'obd2.title': 'Baz Done OBD2',
        'obd2.subtitle': 'Chèche yon kòd oswa mo-kle. Klike pou itilize nan dyagnostik.',
        'obd2.search_placeholder': 'Chèche: P0171, katalizè, lambda...',
        'obd2.empty': 'Pa gen kòd ki jwenn pou rechèch sa a.',
        'obd2.click_hint': 'Klike pou itilize nan dyagnostik',
        'history.title': 'Istwa Dyagnostik',
        'history.subtitle': '10 dènye dyagnostik ki sovgade sou aparèy sa a.',
        'history.clear': '🗑️ Efase tout',
        'history.empty': 'Pa gen dyagnostik sovgade.',
        'history.reload': '↩️ Rechaje',
        'history.delete': '🗑️ Efase',
        'history.confirm_clear': 'Efase tout istwa a?',
        'auth.subtitle': 'Konekte ou pou jwenn aksè nan zouti dyagnostik la.',
        'auth.email': 'Imèl',
        'auth.email_placeholder': 'mekanisyen@garaj.com',
        'auth.password': 'Modpas',
        'auth.password_placeholder': 'Minimòm 8 karaktè',
        'auth.signin': 'Konekte',
        'auth.register': 'Kreye kont',
        'auth.no_account': 'Pa gen kont toujou?',
        'auth.have_account': 'Deja gen yon kont?',
        'auth.free_mode': 'Kontinye san kont (Pollinations gratis)',
        'settings.title': 'Konfigirasyon IA',
        'settings.user': 'Itilizatè konekte',
        'settings.backend_url': 'URL Backend',
        'settings.backend_hint': 'Kite vid pou Pollinations gratis san kont.',
        'settings.provider': 'Founisè IA prefere',
        'settings.model': 'Modèl pèsonalize (Opsyonèl)',
        'settings.model_hint': 'Egz: claude-sonnet-4-6, gemini-2.5-pro, grok-3',
        'settings.save': 'Sovgade',
        'settings.logout': 'Dekonekte',
        'check.header': 'Estati',
        'check.normal': 'Make kòm nòmal',
        'check.verified': 'Nòmal ✓ — klike pou defèt',
        'error.api_key': 'Kle API manke. Konfigire l nan ⚙️ Paramèt, oswa chwazi Mòd Gratis.',
        'error.session': 'Sesyon ekspire. Tanpri konekte ankò.',
        'error.network': 'Erè rezo. Tcheke koneksyon entènèt ou.',
        'error.quota': 'Kota API depase. Eseye ankò nan kèk minit.',
        'error.model': 'Modèl IA pa valid. Tcheke "Modèl pèsonalize" nan paramèt (⚙️).',
        'provider.pollinations': '🆓 Mòd Gratis — San kle API',
        'provider.gemini': 'Google Gemini',
        'provider.claude': 'Anthropic Claude',
        'provider.deepseek': 'DeepSeek',
        'provider.grok': 'xAI Grok',
        'photo.select': 'Chwazi yon veyikil',
        'zone.affected': 'Zòn afekte:',
        'parts.google': '🔍 Gade sou Google',
        'severity.info': 'Enfòmasyon',
        'severity.warning': 'Atansyon',
        'severity.critical': 'Kritik',
        'ai.lang_instruction': 'Reponn SÈLMAN ann kreyòl ayisyen.',
    }
};

let currentLang = localStorage.getItem('amboul_lang') || 'fr';

function t(key) {
    return TRANSLATIONS[currentLang]?.[key] ?? TRANSLATIONS['fr'][key] ?? key;
}

function getLang() { return currentLang; }

function setLang(lang) {
    if (!TRANSLATIONS[lang]) return;
    currentLang = lang;
    localStorage.setItem('amboul_lang', lang);
    applyTranslations();
    // Mettre à jour l'état actif des boutons de langue
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

function applyTranslations() {
    // Navigation header
    const navD = document.querySelector('.nav-btn[data-section="diagnostic"]');
    const navO = document.querySelector('.nav-btn[data-section="obd2"]');
    const navH = document.querySelector('.nav-btn[data-section="historique"]');
    if (navD) navD.textContent = t('nav.diagnostic');
    if (navO) navO.textContent = t('nav.obd2');
    if (navH) navH.textContent = t('nav.history');

    // Mobile nav
    const mobD = document.querySelector('.mobile-nav-btn[data-section="diagnostic"] span:last-child');
    const mobO = document.querySelector('.mobile-nav-btn[data-section="obd2"] span:last-child');
    const mobH = document.querySelector('.mobile-nav-btn[data-section="historique"] span:last-child');
    const mobS = document.querySelector('#mobileSettingsBtn span:last-child');
    if (mobD) mobD.textContent = t('mobile.diagnostic');
    if (mobO) mobO.textContent = t('mobile.obd2');
    if (mobH) mobH.textContent = t('mobile.history');
    if (mobS) mobS.textContent = t('mobile.settings');

    // Formulaire
    const formTitle = document.querySelector('#section-diagnostic .input-panel h2');
    const formSub   = document.querySelector('#section-diagnostic .input-panel .subtitle');
    if (formTitle) formTitle.textContent = t('form.title');
    if (formSub)   formSub.textContent   = t('form.subtitle');

    const lMake = document.querySelector('label[for="carMake"]');
    const lMod  = document.querySelector('label[for="carModel"]');
    const lYear = document.querySelector('label[for="carYear"]');
    const lSym  = document.querySelector('label[for="carSymptom"]');
    if (lMake) lMake.textContent = t('form.make');
    if (lMod)  lMod.textContent  = t('form.model');
    if (lYear) lYear.textContent = t('form.year');
    if (lSym)  lSym.textContent  = t('form.symptom');

    const makeOpt = document.querySelector('#carMake option[value=""]');
    const modOpt  = document.querySelector('#carModel option[value=""]');
    const yearOpt = document.querySelector('#carYear option[value=""]');
    if (makeOpt) makeOpt.textContent = t('form.make_placeholder');
    if (modOpt)  modOpt.textContent  = t('form.model_placeholder');
    if (yearOpt) yearOpt.textContent = t('form.year_placeholder');

    const sym = document.getElementById('carSymptom');
    if (sym) sym.placeholder = t('form.symptom_placeholder');

    const submitText = document.querySelector('#submitBtn .btn-text');
    if (submitText) submitText.textContent = t('form.submit');

    // Résultat
    const resTitle = document.querySelector('.result-panel-header h2');
    if (resTitle) resTitle.textContent = t('result.title');

    const printBtnEl = document.getElementById('printBtn');
    if (printBtnEl && !printBtnEl.classList.contains('hidden')) printBtnEl.textContent = t('result.print');

    // Schéma panne
    const diagH2 = document.querySelector('#diagPanel h2');
    if (diagH2) diagH2.textContent = t('diag.title');

    // OBD2
    const obd2H2  = document.querySelector('#section-obd2 h2');
    const obd2Sub = document.querySelector('#section-obd2 .subtitle');
    const obd2Inp = document.getElementById('obd2Search');
    if (obd2H2)  obd2H2.textContent   = t('obd2.title');
    if (obd2Sub) obd2Sub.textContent   = t('obd2.subtitle');
    if (obd2Inp) obd2Inp.placeholder   = t('obd2.search_placeholder');

    // Historique
    const histH2  = document.querySelector('#section-historique h2');
    const histSub = document.querySelector('#section-historique .subtitle');
    const clrBtn  = document.getElementById('clearHistoryBtn');
    if (histH2)  histH2.textContent  = t('history.title');
    if (histSub) histSub.textContent = t('history.subtitle');
    if (clrBtn)  clrBtn.textContent  = t('history.clear');

    // Auth overlay
    const authSub = document.getElementById('authSubtitle');
    const authEmailL = document.querySelector('label[for="authEmail"]');
    const authPwdL   = document.querySelector('label[for="authPassword"]');
    const authEmailI = document.getElementById('authEmail');
    const authPwdI   = document.getElementById('authPassword');
    if (authSub)    authSub.textContent    = t('auth.subtitle');
    if (authEmailL) authEmailL.textContent = t('auth.email');
    if (authPwdL)   authPwdL.textContent   = t('auth.password');
    if (authEmailI) authEmailI.placeholder = t('auth.email_placeholder');
    if (authPwdI)   authPwdI.placeholder   = t('auth.password_placeholder');

    const authFreeEl = document.getElementById('authFreeBtn');
    if (authFreeEl) authFreeEl.textContent = t('auth.free_mode');

    // Settings modal
    const settTitle = document.querySelector('#settingsModal h3');
    const settUser  = document.querySelector('label[for="backendUrlInput"]')?.previousElementSibling;
    const settBkLbl = document.querySelector('label[for="backendUrlInput"]');
    const settBkHnt = document.querySelector('#backendUrlInput + .field-hint');
    const settPrLbl = document.querySelector('label[for="aiProvider"]');
    const settMdLbl = document.querySelector('label[for="customModel"]');
    const settMdHnt = document.querySelector('#customModel + .field-hint');
    const saveBtnEl = document.getElementById('saveSettingsBtn');
    const logoutEl  = document.getElementById('logoutBtn');
    if (settTitle)  settTitle.textContent  = t('settings.title');
    if (settBkLbl)  settBkLbl.textContent  = t('settings.backend_url');
    if (settBkHnt)  settBkHnt.textContent  = t('settings.backend_hint');
    if (settPrLbl)  settPrLbl.textContent  = t('settings.provider');
    if (settMdLbl)  settMdLbl.textContent  = t('settings.model');
    if (settMdHnt)  settMdHnt.textContent  = t('settings.model_hint');
    if (saveBtnEl && saveBtnEl.textContent !== '✅ Sauvegardé !' && saveBtnEl.textContent !== '✅ Saved!')
        saveBtnEl.textContent = t('settings.save');
    if (logoutEl)   logoutEl.textContent   = t('settings.logout');

    // Select fournisseurs IA
    const aiProvSel = document.getElementById('aiProvider');
    if (aiProvSel) {
        const opts = aiProvSel.querySelectorAll('option');
        const provMap = { pollinations: 'provider.pollinations', gemini: 'provider.gemini', claude: 'provider.claude', deepseek: 'provider.deepseek', grok: 'provider.grok' };
        opts.forEach(opt => { if (provMap[opt.value]) opt.textContent = t(provMap[opt.value]); });
    }

    // Photo placeholder
    const photoP = document.querySelector('.vehicle-col-placeholder p');
    if (photoP) photoP.textContent = t('photo.select');
}
```

- [ ] **Étape 2 : Vérifier en console que `t()` fonctionne**

Ouvre `index.html` dans le navigateur → F12 console → tape :
```javascript
t('form.submit')  // doit retourner "Lancer l'Analyse"
setLang('en'); t('form.submit')  // doit retourner "Run Analysis"
setLang('ht'); t('nav.diagnostic')  // doit retourner "🔧 Dyagnostik"
setLang('fr');  // remettre fr
```

- [ ] **Étape 3 : Commit**

```bash
git add i18n.js
git commit -m "feat(i18n): translation dictionary FR/EN/ES/HT"
```

---

## Task 2 : index.html — Sélecteur de langue + chargement i18n.js

**Fichiers :**
- Modifier : `index.html`

- [ ] **Étape 1 : Ajouter `<script src="i18n.js">` avant les autres scripts**

Trouver la section scripts en fin de body. Remplacer :
```html
    <script src="auth.js"></script>
```
Par :
```html
    <script src="i18n.js"></script>
    <script src="auth.js"></script>
```

- [ ] **Étape 2 : Ajouter les boutons de langue dans le header**

Trouver le `<header class="glass-header">`. Après `<div class="logo">...</div>`, ajouter :
```html
            <div class="lang-switcher" role="group" aria-label="Language">
                <button type="button" class="lang-btn active" data-lang="fr" title="Français">FR</button>
                <button type="button" class="lang-btn" data-lang="en" title="English">EN</button>
                <button type="button" class="lang-btn" data-lang="es" title="Español">ES</button>
                <button type="button" class="lang-btn" data-lang="ht" title="Kreyòl">HT</button>
            </div>
```

- [ ] **Étape 3 : Vérifier que les 4 boutons s'affichent dans le header**

Ouvrir `index.html` → les 4 boutons doivent être visibles entre le logo et la navigation.

- [ ] **Étape 4 : Commit**

```bash
git add index.html
git commit -m "feat(i18n): add language switcher buttons to header"
```

---

## Task 3 : style.css — Styles des boutons de langue

**Fichiers :**
- Modifier : `style.css`

- [ ] **Étape 1 : Ajouter les styles après `.icon-btn:hover`**

```css
/* Sélecteur de langue */
.lang-switcher {
    display: flex;
    gap: 0.15rem;
    align-items: center;
}

.lang-btn {
    background: transparent;
    border: 1px solid transparent;
    color: var(--text-muted);
    font-size: 0.72rem;
    font-weight: 700;
    font-family: var(--font-sans);
    cursor: pointer;
    padding: 0.25rem 0.45rem;
    border-radius: 5px;
    letter-spacing: 0.03em;
    transition: var(--transition);
    min-height: unset;
}

.lang-btn:hover {
    color: var(--text-main);
    background: rgba(255, 255, 255, 0.06);
    border-color: var(--glass-border);
}

.lang-btn.active {
    color: var(--primary-color);
    background: rgba(59, 130, 246, 0.12);
    border-color: rgba(59, 130, 246, 0.3);
}
```

- [ ] **Étape 2 : Vérifier dans le navigateur**

Ouvrir `index.html` → les boutons FR EN ES HT doivent être discrets mais lisibles. Le bouton FR doit être en bleu (actif).

- [ ] **Étape 3 : Commit**

```bash
git add style.css
git commit -m "feat(i18n): lang-btn styles"
```

---

## Task 4 : app.js — Brancher le sélecteur + remplacer les textes dynamiques

**Fichiers :**
- Modifier : `app.js`

- [ ] **Étape 1 : Initialiser la langue et brancher les boutons**

Dans `app.js`, au tout début du `DOMContentLoaded` (juste après les déclarations DOM existantes), ajouter :

```javascript
    // ===== Initialisation langue =====
    applyTranslations(); // applique la langue sauvegardée au chargement

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => setLang(btn.dataset.lang));
    });

    // Marquer le bouton actif au chargement
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === getLang());
    });
```

- [ ] **Étape 2 : Remplacer les textes dynamiques dans `renderHistorique()`**

Trouver la fonction `renderHistorique()`. Remplacer :
- `'Aucun diagnostic sauvegardé.'` → `t('history.empty')`
- `'↩️ Recharger'` → `t('history.reload')`
- `'🗑️ Supprimer'` → `t('history.delete')`

Dans `clearHistoryBtn.addEventListener('click', ...)`, remplacer :
- `'Effacer tout l\'historique ?'` → `t('history.confirm_clear')`

- [ ] **Étape 3 : Remplacer les textes dans `renderOBD2Cards()`**

Trouver la fonction `renderOBD2Cards()`. Remplacer :
- `'Aucun code trouvé pour cette recherche.'` → `t('obd2.empty')`
- `title="Cliquer pour utiliser dans le diagnostic"` → `title="${t('obd2.click_hint')}"`

Dans la fonction `graviteLabel(g)` :
```javascript
function graviteLabel(g) {
    return { 1: t('severity.info'), 2: t('severity.warning'), 3: t('severity.critical') }[g] || t('severity.info');
}
```

- [ ] **Étape 4 : Remplacer les textes dans `buildPartsDiagram()`**

Trouver la fonction `buildPartsDiagram(parts, make, model, year)`. Remplacer :
- `'🔧 Pièces en cause — ${make} ${model} ${year}'` → `` `${t('diag.parts_title')} — ${make} ${model} ${year}` ``
- `'🔧 Pièces en cause'` (titre) → `t('diag.parts_title')`
- `'Lancez un diagnostic pour voir les pièces en cause'` → `t('diag.parts_empty')`

Trouver la ligne Google URL dans `buildPartsDiagram` et remplacer `'🔍 Voir sur Google'` → `t('parts.google')`.

- [ ] **Étape 5 : Remplacer les textes dans `addSymptomChecks()`**

Trouver la fonction `addSymptomChecks()`. Remplacer :
- `'État'` → `t('check.header')`
- `'Marquer comme normal'` → `t('check.normal')`
- `'Normal ✓ — cliquer pour annuler'` → `t('check.verified')`
- `'Marquer comme normal'` (dans le `btn.title =`) → `t('check.normal')`

- [ ] **Étape 6 : Remplacer les messages d'erreur dans `form.submit`**

Dans le bloc `catch (error)` du form submit, remplacer les chaînes :
- `'Clé API ${provider} manquante...'` → `t('error.api_key')`
- `'Session expirée. Reconnectez-vous.'` → `t('error.session')`
- `'Quota API dépassé...'` → `t('error.quota')`
- `'Modèle IA invalide...'` → `t('error.model')`
- `'Erreur réseau...'` → `t('error.network')`

- [ ] **Étape 7 : Remplacer le diag empty state dans `buildPartsDiagram`**

Dans `buildPartsDiagram`, remplacer le HTML du panneau vide :
```javascript
// Ancien :
return `<div class="parts-panel-empty">
    <span class="empty-icon diag-empty-icon">🔍</span>
    <p>Lancez un diagnostic pour voir les pièces en cause</p>
</div>`;

// Nouveau :
return `<div class="parts-panel-empty">
    <span class="empty-icon diag-empty-icon">🔍</span>
    <p>${t('diag.parts_empty')}</p>
</div>`;
```

- [ ] **Étape 8 : Remplacer dans `diagPanelContent` l'état initial**

Dans `index.html`, le texte initial du 4e panneau est codé en dur. Mettre à jour `applyTranslations()` dans `i18n.js` pour gérer l'état vide du diagPanel :

Ajouter à la fin de `applyTranslations()` dans `i18n.js`:
```javascript
    // État vide du schéma de panne (si encore vide)
    const diagEmpty = document.querySelector('#diagPanelContent .empty-state p');
    if (diagEmpty) diagEmpty.textContent = t('diag.empty');
```

- [ ] **Étape 9 : Remplacer `saveSettingsBtn` feedback dans les 2 langues**

Dans le `saveSettingsBtn.addEventListener`, remplacer :
```javascript
saveSettingsBtn.textContent = '✅ Sauvegardé !';
setTimeout(() => { saveSettingsBtn.textContent = 'Sauvegarder'; }, 2000);
```
Par :
```javascript
const savedMsg = { fr: '✅ Sauvegardé !', en: '✅ Saved!', es: '✅ Guardado!', ht: '✅ Sovgade!' };
saveSettingsBtn.textContent = savedMsg[getLang()] || '✅ Sauvegardé !';
setTimeout(() => { saveSettingsBtn.textContent = t('settings.save'); }, 2000);
```

- [ ] **Étape 10 : Tester dans le navigateur**

1. Ouvrir `index.html` → tout en français ✓
2. Cliquer **EN** → nav, formulaire, placeholders, OBD2, historique passent en anglais ✓
3. Cliquer **ES** → espagnol ✓
4. Cliquer **HT** → kreyòl ✓
5. Recharger la page → la langue choisie est mémorisée ✓

- [ ] **Étape 11 : Commit**

```bash
git add app.js i18n.js
git commit -m "feat(i18n): wire translations into app.js dynamic text"
```

---

## Task 5 : api.js — Instruction langue dans le prompt IA

**Fichiers :**
- Modifier : `api.js`

- [ ] **Étape 1 : Ajouter l'instruction langue dans `callPollinationsDirect`**

Trouver dans `api.js` la ligne :
```javascript
const userPrompt = `Véhicule: ${make} ...`;
```

La remplacer par :
```javascript
const langInstruction = typeof t === 'function' ? t('ai.lang_instruction') : '';
const userPrompt = `Véhicule: ${make} ${model} (Année: ${year})\nSymptômes/Codes: ${symptom}\nVeuillez analyser et fournir un diagnostic selon vos instructions systémiques.${langInstruction ? '\n' + langInstruction : ''}`;
```

- [ ] **Étape 2 : Même modification dans `callDiagnose` (mode backend)**

Dans `callDiagnose`, la requête envoie `{ make, model, year, symptom, provider }` au backend. Ajouter aussi `lang` :

```javascript
body: JSON.stringify({ make, model, year, symptom, provider, lang: typeof getLang === 'function' ? getLang() : 'fr' })
```

- [ ] **Étape 3 : backend/routes/diagnose.js — Récupérer `lang` et l'injecter**

Dans `backend/routes/diagnose.js`, ajouter `lang` à la validation :
```javascript
body('lang').optional().isIn(['fr', 'en', 'es', 'ht']).default('fr'),
```

Ajouter après les validations :
```javascript
const { make, model, year, symptom, provider, lang = 'fr' } = req.body;

const langInstructions = {
    fr: '',
    en: 'Respond ONLY in English.',
    es: 'Responde ÚNICAMENTE en español.',
    ht: 'Reponn SÈLMAN ann kreyòl ayisyen.'
};
const langInstruction = langInstructions[lang] || '';

const userPrompt = `Véhicule: ${make} ${model} (Année: ${year})\nSymptômes/Codes: ${symptom}\nVeuillez analyser et fournir un diagnostic selon vos instructions systémiques.${langInstruction ? '\n' + langInstruction : ''}`;
```

- [ ] **Étape 4 : Tester**

1. Sélectionner **EN** → lancer un diagnostic → la réponse IA est en anglais ✓
2. Sélectionner **HT** → lancer un diagnostic → la réponse est en kreyòl ✓

- [ ] **Étape 5 : Commit + push**

```bash
git add api.js backend/routes/diagnose.js
git commit -m "feat(i18n): AI responds in selected language"
git push
```

---

## Auto-revue

**Spec coverage :**
- ✅ Navigation → Task 4, étape 1 + `applyTranslations()`
- ✅ Nav mobile → `applyTranslations()`
- ✅ Formulaire (labels, placeholders, bouton) → `applyTranslations()` + Task 4
- ✅ Résultats → `applyTranslations()`
- ✅ Schéma panne → Tasks 4 + `applyTranslations()`
- ✅ OBD2 complet → Task 4 étapes 3 + `applyTranslations()`
- ✅ Historique complet → Task 4 étapes 2 + `applyTranslations()`
- ✅ Auth overlay → `applyTranslations()`
- ✅ Modal ⚙️ → `applyTranslations()`
- ✅ Tableau État → Task 4 étape 5
- ✅ Erreurs → Task 4 étape 6
- ✅ IA dans la bonne langue → Task 5
- ✅ Sélecteur de langue → Task 2 + 3
- ✅ Mémorisation langue → localStorage dans `setLang()`

**Type consistency :** `t()`, `getLang()`, `setLang()`, `applyTranslations()` définis dans Task 1, utilisés dans Tasks 2-5. ✓
