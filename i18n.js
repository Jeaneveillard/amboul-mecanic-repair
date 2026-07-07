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
        'settings.backend_hint': 'Serveur des comptes et de l\'IA. Le mode gratuit s\'active via « Continuer sans compte » à la connexion.',
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
        'ai.lang_instruction': 'Répondez UNIQUEMENT en français.',
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
        'settings.backend_hint': 'Accounts & AI server. Free mode is enabled via "Continue without account" at login.',
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
        'settings.backend_hint': 'Servidor de cuentas e IA. El modo gratis se activa con "Continuar sin cuenta" al iniciar sesión.',
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
        'settings.backend_hint': 'Sèvè kont ak IA. Mòd gratis la aktive ak « Kontinye san kont » lè w ap konekte.',
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
    if (obd2H2)  obd2H2.textContent  = t('obd2.title');
    if (obd2Sub) obd2Sub.textContent  = t('obd2.subtitle');
    if (obd2Inp) obd2Inp.placeholder  = t('obd2.search_placeholder');

    // Historique
    const histH2  = document.querySelector('#section-historique h2');
    const histSub = document.querySelector('#section-historique .subtitle');
    const clrBtn  = document.getElementById('clearHistoryBtn');
    if (histH2)  histH2.textContent  = t('history.title');
    if (histSub) histSub.textContent = t('history.subtitle');
    if (clrBtn)  clrBtn.textContent  = t('history.clear');

    // Auth overlay
    const authSub    = document.getElementById('authSubtitle');
    const authEmailL = document.querySelector('label[for="authEmail"]');
    const authPwdL   = document.querySelector('label[for="authPassword"]');
    const authEmailI = document.getElementById('authEmail');
    const authPwdI   = document.getElementById('authPassword');
    const authFreeEl = document.getElementById('authFreeBtn');
    if (authSub)    authSub.textContent    = t('auth.subtitle');
    if (authEmailL) authEmailL.textContent = t('auth.email');
    if (authPwdL)   authPwdL.textContent   = t('auth.password');
    if (authEmailI) authEmailI.placeholder = t('auth.email_placeholder');
    if (authPwdI)   authPwdI.placeholder   = t('auth.password_placeholder');
    if (authFreeEl) authFreeEl.textContent = t('auth.free_mode');

    // Settings modal
    const settTitle   = document.querySelector('#settingsModal h3');
    const settUserLbl = document.getElementById('settingsUserLabel');
    const settBkLbl   = document.querySelector('label[for="backendUrlInput"]');
    const settBkHnt = document.querySelector('#backendUrlInput + .field-hint');
    const settPrLbl = document.querySelector('label[for="aiProvider"]');
    const settMdLbl = document.querySelector('label[for="customModel"]');
    const settMdHnt = document.querySelector('#customModel + .field-hint');
    const saveBtnEl = document.getElementById('saveSettingsBtn');
    const logoutEl  = document.getElementById('logoutBtn');
    if (settTitle)   settTitle.textContent   = t('settings.title');
    if (settUserLbl) settUserLbl.textContent = t('settings.user');
    if (settBkLbl)   settBkLbl.textContent   = t('settings.backend_url');
    if (settBkHnt)  settBkHnt.textContent = t('settings.backend_hint');
    if (settPrLbl)  settPrLbl.textContent = t('settings.provider');
    if (settMdLbl)  settMdLbl.textContent = t('settings.model');
    if (settMdHnt)  settMdHnt.textContent = t('settings.model_hint');
    if (saveBtnEl && saveBtnEl.textContent !== '✅ Sauvegardé !' && saveBtnEl.textContent !== '✅ Saved!' && saveBtnEl.textContent !== '✅ Guardado!' && saveBtnEl.textContent !== '✅ Sovgade!')
        saveBtnEl.textContent = t('settings.save');
    if (logoutEl)   logoutEl.textContent  = t('settings.logout');

    // Select fournisseurs IA
    const aiProvSel = document.getElementById('aiProvider');
    if (aiProvSel) {
        const provMap = { pollinations: 'provider.pollinations', gemini: 'provider.gemini', claude: 'provider.claude', deepseek: 'provider.deepseek', grok: 'provider.grok' };
        aiProvSel.querySelectorAll('option').forEach(opt => {
            if (provMap[opt.value]) opt.textContent = t(provMap[opt.value]);
        });
    }

    // Photo placeholder
    const photoP = document.querySelector('.vehicle-col-placeholder p');
    if (photoP) photoP.textContent = t('photo.select');

    // État vide du schéma de panne
    const diagEmpty = document.querySelector('#diagPanelContent .empty-state p');
    if (diagEmpty) diagEmpty.textContent = t('diag.empty');

    // État vide du résultat
    const resultEmpty = document.querySelector('#resultContainer .empty-state p');
    if (resultEmpty) resultEmpty.textContent = t('result.empty');
}
