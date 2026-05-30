document.addEventListener('DOMContentLoaded', () => {
    // ===== DOM Elements =====
    const yearSelect = document.getElementById('carYear');
    const carMakeSelect = document.getElementById('carMake');
    const carModelSelect = document.getElementById('carModel');
    const form = document.getElementById('diagnosticForm');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const loader = submitBtn.querySelector('.loader');
    const resultContainer = document.getElementById('resultContainer');
    const formError = document.getElementById('formError');
    const printBtn = document.getElementById('printBtn');
    const printZone = document.getElementById('printZone');
    const obd2SearchInput = document.getElementById('obd2Search');
    const obd2ResultsDiv = document.getElementById('obd2Results');
    const historiqueList = document.getElementById('historiqueList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const vehicleSidePhoto = document.getElementById('vehicleSidePhoto');
    const vehicleSideFallback = document.getElementById('vehicleSideFallback');
    const vehicleSideBadge = document.getElementById('vehicleSideBadge');
    const diagPanelContent = document.getElementById('diagPanelContent');

    // ===== Initialisation langue =====
    applyTranslations();
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => setLang(btn.dataset.lang));
        btn.classList.toggle('active', btn.dataset.lang === getLang());
    });

    // ===== Initialisation Auth =====
    if (!isLoggedIn() && getBackendUrl()) {
        showAuthOverlay();
    }

    // ===== Logique overlay connexion =====
    // showAuthOverlay / hideAuthOverlay sont définies dans auth.js (chargé avant)
    const authForm    = document.getElementById('authForm');
    const authError   = document.getElementById('authError');
    const authBtnText = document.getElementById('authBtnText');
    const authToggleBtn  = document.getElementById('authToggleBtn');
    const authToggleText = document.getElementById('authToggleText');
    const authSubmitBtn  = document.getElementById('authSubmitBtn');
    const authFreeBtn    = document.getElementById('authFreeBtn');

    let authMode = 'login';

    authToggleBtn?.addEventListener('click', () => {
        authMode = authMode === 'login' ? 'register' : 'login';
        authBtnText.textContent    = authMode === 'login' ? t('auth.signin')     : t('auth.register');
        authToggleBtn.textContent  = authMode === 'login' ? t('auth.register')   : t('auth.signin');
        authToggleText.textContent = authMode === 'login' ? t('auth.no_account') : t('auth.have_account');
        authError.classList.add('hidden');
    });

    authFreeBtn?.addEventListener('click', () => hideAuthOverlay());

    authForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        authError.classList.add('hidden');
        const email    = document.getElementById('authEmail').value.trim();
        const password = document.getElementById('authPassword').value;
        const loaderEl = authSubmitBtn.querySelector('.loader');
        authBtnText.classList.add('hidden');
        loaderEl.classList.remove('hidden');
        authSubmitBtn.disabled = true;
        try {
            authMode === 'login' ? await login(email, password) : await register(email, password);
            hideAuthOverlay();
            const emailDisplay = document.getElementById('settingsUserEmail');
            if (emailDisplay) emailDisplay.textContent = getUser() || '—';
        } catch (err) {
            authError.textContent = err.message;
            authError.classList.remove('hidden');
        } finally {
            authBtnText.classList.remove('hidden');
            loaderEl.classList.add('hidden');
            authSubmitBtn.disabled = false;
        }
    });

    // ===== Constants =====
    const MAX_HISTORY = 10;
    const HISTORY_KEY = 'amboul_history';

    // ===== Car Data =====
    const carData = {
        "Audi": ["A3", "A4", "Q3", "Q5"],
        "BMW": ["Série 1", "Série 3", "X1", "X3", "X5"],
        "Buick": ["Enclave", "Encore", "Envision", "LaCrosse"],
        "Cadillac": ["Escalade", "XT5", "XT4", "CT5", "CT4"],
        "Chevrolet": ["Silverado", "Equinox", "Malibu", "Traverse", "Colorado", "Tahoe", "Suburban", "Blazer", "Trax"],
        "Chrysler": ["300", "Pacifica", "Voyager"],
        "Citroën": ["C3", "C4", "C5 Aircross", "Berlingo"],
        "Dacia": ["Sandero", "Duster", "Jogger"],
        "Dodge": ["Ram 1500", "Charger", "Challenger", "Durango", "Journey"],
        "Fiat": ["500", "Panda", "Tipo"],
        "Ford": ["F-150", "Escape", "Explorer", "Ranger", "Bronco", "Edge", "Mustang", "Transit", "Fiesta", "Focus", "Puma", "Kuga"],
        "GMC": ["Sierra 1500", "Terrain", "Acadia", "Canyon", "Yukon"],
        "Honda": ["Civic", "CR-V", "HR-V", "Jazz"],
        "Hyundai": ["Tucson", "i20", "Kona", "i30"],
        "Jeep": ["Wrangler", "Grand Cherokee", "Cherokee", "Compass", "Gladiator", "Renegade"],
        "Kia": ["Sportage", "Ceed", "Niro", "Picanto"],
        "Lincoln": ["Navigator", "Aviator", "Corsair", "Nautilus"],
        "Mercedes-Benz": ["Classe A", "Classe C", "GLA", "GLC"],
        "Nissan": ["Qashqai", "Juke", "Micra", "X-Trail"],
        "Peugeot": ["208", "308", "2008", "3008", "5008", "508"],
        "RAM": ["1500", "2500", "3500", "ProMaster"],
        "Renault": ["Clio", "Megane", "Captur", "Kadjar", "Austral", "Twingo", "Scenic"],
        "Toyota": ["Yaris", "Corolla", "RAV4", "C-HR", "Aygo"],
        "Volkswagen": ["Golf", "Polo", "Tiguan", "Passat", "T-Roc"]
    };

    // ===== OBD2 Database =====
    const OBD2_DATABASE = {
        "P0100": { code: "P0100", description: "Débit massique d'air — circuit défaut", causes: ["Débitmètre encrassé ou défectueux", "Connecteur débranché", "Fuite sur conduit admission"], gravite: 2, categorie: "Moteur" },
        "P0101": { code: "P0101", description: "Débit massique d'air — plage hors limite", causes: ["Filtre à air colmaté", "Débitmètre défectueux", "Fuite d'air admission"], gravite: 2, categorie: "Moteur" },
        "P0110": { code: "P0110", description: "Température air admission — circuit défaut", causes: ["Capteur IAT défectueux", "Fil coupé ou court-circuit"], gravite: 1, categorie: "Moteur" },
        "P0116": { code: "P0116", description: "Température liquide refroidissement — plage", causes: ["Thermostat coincé ouvert", "Capteur ECT défectueux", "Fuite de liquide de refroidissement"], gravite: 2, categorie: "Moteur" },
        "P0118": { code: "P0118", description: "Température liquide refroidissement — haute", causes: ["Capteur ECT court-circuité", "Fil endommagé"], gravite: 2, categorie: "Moteur" },
        "P0120": { code: "P0120", description: "Capteur position papillon (TPS) — circuit A", causes: ["TPS usé ou défectueux", "Connecteur corrodé", "Court-circuit sur signal"], gravite: 2, categorie: "Moteur" },
        "P0130": { code: "P0130", description: "Sonde lambda amont — circuit lent Banc 1", causes: ["Sonde lambda vieillie", "Fuite d'échappement avant sonde", "Empoisonnement au plomb"], gravite: 2, categorie: "Moteur" },
        "P0135": { code: "P0135", description: "Sonde lambda amont — chauffe circuit Banc 1", causes: ["Résistance de chauffe grillée", "Fil d'alimentation coupé"], gravite: 2, categorie: "Moteur" },
        "P0141": { code: "P0141", description: "Sonde lambda aval — chauffe circuit Banc 1", causes: ["Résistance de chauffe grillée", "Connecteur oxydé"], gravite: 1, categorie: "Moteur" },
        "P0150": { code: "P0150", description: "Sonde lambda amont — circuit lent Banc 2", causes: ["Sonde lambda vieillie Banc 2", "Fuite d'échappement avant sonde", "Empoisonnement au plomb"], gravite: 2, categorie: "Moteur" },
        "P0171": { code: "P0171", description: "Mélange trop pauvre — Banc 1", causes: ["Fuite d'air sur admission", "Injecteur encrassé ou défaillant", "Sonde lambda défectueuse", "Pompe à carburant faible", "Régulateur de pression carburant"], gravite: 2, categorie: "Moteur" },
        "P0172": { code: "P0172", description: "Mélange trop riche — Banc 1", causes: ["Injecteur qui fuit", "Pression carburant trop élevée", "Sonde lambda encrassée", "MAP sensor défectueux"], gravite: 2, categorie: "Moteur" },
        "P0174": { code: "P0174", description: "Mélange trop pauvre — Banc 2", causes: ["Fuite d'air côté Banc 2", "Injecteurs Banc 2 encrassés", "Sonde lambda Banc 2 défectueuse"], gravite: 2, categorie: "Moteur" },
        "P0175": { code: "P0175", description: "Mélange trop riche — Banc 2", causes: ["Injecteurs Banc 2 qui fuient", "Pression carburant élevée", "MAP sensor défectueux"], gravite: 2, categorie: "Moteur" },
        "P0200": { code: "P0200", description: "Circuit injecteur — défaut général", causes: ["Injecteur défectueux", "Fil coupé ou court-circuit", "Calculateur défectueux"], gravite: 3, categorie: "Moteur" },
        "P0300": { code: "P0300", description: "Ratés d'allumage — multiple cylindres", causes: ["Bougies d'allumage usées", "Bobines d'allumage défectueuses", "Injecteurs encrassés", "Fuite de compression"], gravite: 3, categorie: "Moteur" },
        "P0301": { code: "P0301", description: "Raté d'allumage — cylindre 1", causes: ["Bougie cylindre 1 défectueuse", "Bobine cylindre 1 en panne", "Injecteur cylindre 1 encrassé"], gravite: 3, categorie: "Moteur" },
        "P0302": { code: "P0302", description: "Raté d'allumage — cylindre 2", causes: ["Bougie cylindre 2 défectueuse", "Bobine cylindre 2 en panne", "Compression faible cylindre 2"], gravite: 3, categorie: "Moteur" },
        "P0303": { code: "P0303", description: "Raté d'allumage — cylindre 3", causes: ["Bougie cylindre 3 défectueuse", "Bobine cylindre 3 en panne", "Injecteur cylindre 3"], gravite: 3, categorie: "Moteur" },
        "P0304": { code: "P0304", description: "Raté d'allumage — cylindre 4", causes: ["Bougie cylindre 4 défectueuse", "Bobine cylindre 4 en panne", "Joint de culasse cylindre 4"], gravite: 3, categorie: "Moteur" },
        "P0325": { code: "P0325", description: "Capteur de cliquetis — circuit Banc 1", causes: ["Capteur cliquetis défectueux", "Fil coupé ou desserré", "Problème de compression moteur"], gravite: 2, categorie: "Moteur" },
        "P0335": { code: "P0335", description: "Capteur position vilebrequin (CKP) — circuit A", causes: ["Capteur CKP défectueux", "Roue phonique endommagée", "Connecteur corrodé"], gravite: 3, categorie: "Moteur" },
        "P0340": { code: "P0340", description: "Capteur position arbre à cames (CMP) — circuit A", causes: ["Capteur CMP défectueux", "Déréglage distribution", "Connecteur lâche"], gravite: 3, categorie: "Moteur" },
        "P0400": { code: "P0400", description: "Recirculation gaz d'échappement (EGR) — débit", causes: ["Vanne EGR encrassée ou bloquée", "Tuyau EGR obstrué", "Capteur différentiel de pression EGR"], gravite: 2, categorie: "Moteur" },
        "P0401": { code: "P0401", description: "EGR — débit insuffisant détecté", causes: ["Vanne EGR collée fermée", "Dépôts de carbone sur vanne EGR", "Solénoïde EGR défectueux"], gravite: 2, categorie: "Moteur" },
        "P0420": { code: "P0420", description: "Catalyseur sous-efficace — Banc 1", causes: ["Catalyseur vieilli ou empoisonné", "Sonde lambda aval HS", "Huile ou liquide de refroidissement brûlé"], gravite: 2, categorie: "Moteur" },
        "P0430": { code: "P0430", description: "Catalyseur sous-efficace — Banc 2", causes: ["Catalyseur Banc 2 défectueux", "Sonde lambda aval Banc 2 HS", "Ratés d'allumage prolongés"], gravite: 2, categorie: "Moteur" },
        "P0440": { code: "P0440", description: "Système EVAP — défaut général", causes: ["Bouchon de réservoir mal fermé", "Canister saturé", "Fuite de vapeurs de carburant"], gravite: 1, categorie: "Moteur" },
        "P0442": { code: "P0442", description: "EVAP — petite fuite détectée", causes: ["Bouchon réservoir fissuré", "Tuyau EVAP pincé ou fissuré", "Purge solénoïde défectueuse"], gravite: 1, categorie: "Moteur" },
        "P0455": { code: "P0455", description: "EVAP — grande fuite détectée", causes: ["Bouchon réservoir absent ou cassé", "Tuyau EVAP déconnecté", "Canister endommagé"], gravite: 2, categorie: "Moteur" },
        "P0480": { code: "P0480", description: "Motoventilateur de refroidissement — circuit", causes: ["Motoventilateur défectueux", "Relais de ventilateur grillé", "Fil coupé"], gravite: 2, categorie: "Moteur" },
        "P0500": { code: "P0500", description: "Capteur vitesse véhicule (VSS) — circuit", causes: ["Capteur VSS défectueux", "Couronne ABS endommagée", "Fil coupé au capteur"], gravite: 2, categorie: "Moteur" },
        "P0505": { code: "P0505", description: "Régulation du ralenti — circuit", causes: ["Vanne IAC encrassée ou défectueuse", "Fuite d'air au ralenti", "Calculateur défectueux"], gravite: 2, categorie: "Moteur" },
        "P0600": { code: "P0600", description: "Communication série — lien défaut", causes: ["Calculateur défectueux", "Problème alimentation calculateur", "Bus CAN perturbé"], gravite: 3, categorie: "Moteur" },
        "P0700": { code: "P0700", description: "Contrôle transmission — défaut TCM", causes: ["Défaut détecté par le TCM", "Lire les codes spécifiques transmission", "Problème mécanique boîte"], gravite: 2, categorie: "Transmission" },
        "P0715": { code: "P0715", description: "Capteur vitesse turbine — circuit A", causes: ["Capteur vitesse turbine défectueux", "Fil coupé", "Dépôts métal dans boîte"], gravite: 2, categorie: "Transmission" },
        "P0720": { code: "P0720", description: "Capteur vitesse sortie transmission — circuit", causes: ["Capteur OSS défectueux", "Couronne ABS endommagée", "Connecteur corrodé"], gravite: 2, categorie: "Transmission" },
        "P0730": { code: "P0730", description: "Rapport de transmission incorrect", causes: ["Solénoïde de rapport défectueux", "Huile de boîte dégradée ou basse", "Usure mécanique interne"], gravite: 3, categorie: "Transmission" },
        "P0750": { code: "P0750", description: "Solénoïde de passage rapport A — circuit", causes: ["Solénoïde défectueux", "Fil coupé ou court-circuit", "Valve body encrassée"], gravite: 3, categorie: "Transmission" },
        "C0031": { code: "C0031", description: "Capteur vitesse roue avant droite — circuit", causes: ["Capteur ABS avant droit défectueux", "Anneau ABS fissuré ou sale", "Fil coupé"], gravite: 3, categorie: "Châssis" },
        "C0034": { code: "C0034", description: "Capteur vitesse roue avant gauche — circuit", causes: ["Capteur ABS avant gauche défectueux", "Anneau ABS encrassé", "Connecteur oxydé"], gravite: 3, categorie: "Châssis" },
        "C0035": { code: "C0035", description: "Capteur vitesse roue arrière droite — circuit", causes: ["Capteur ABS arrière droit défectueux", "Anneau ABS endommagé", "Fil rompu"], gravite: 3, categorie: "Châssis" },
        "C0040": { code: "C0040", description: "Capteur vitesse roue arrière gauche — circuit", causes: ["Capteur ABS arrière gauche défectueux", "Anneau ABS encrassé", "Connecteur corrodé"], gravite: 3, categorie: "Châssis" },
        "U0001": { code: "U0001", description: "Bus CAN haute vitesse — communication perdue", causes: ["Problème d'alimentation calculateur", "Bus CAN court-circuité", "Calculateur principal défectueux"], gravite: 3, categorie: "Réseau CAN" },
        "U0100": { code: "U0100", description: "Communication perdue avec ECM/PCM", causes: ["Calculateur moteur hors tension", "Fusible ECM grillé", "Bus CAN interrompu"], gravite: 3, categorie: "Réseau CAN" },
        "U0101": { code: "U0101", description: "Communication perdue avec TCM", causes: ["TCM hors tension", "Fusible TCM grillé", "Bus CAN perturbé"], gravite: 3, categorie: "Réseau CAN" },
        "U0121": { code: "U0121", description: "Communication perdue avec module ABS", causes: ["Calculateur ABS défectueux", "Fusible ABS grillé", "Bus CAN interrompu"], gravite: 3, categorie: "Réseau CAN" },
        "U0155": { code: "U0155", description: "Communication perdue avec tableau de bord", causes: ["Tableau de bord hors tension", "Fusible grillé", "Bus CAN interrompu"], gravite: 2, categorie: "Réseau CAN" },
        "B0070": { code: "B0070", description: "Module airbag conducteur — circuit", causes: ["Airbag conducteur défectueux", "Connecteur spiralé usé", "Module airbag en panne"], gravite: 3, categorie: "Carrosserie" },
        "B0075": { code: "B0075", description: "Module airbag passager — circuit", causes: ["Airbag passager défectueux", "Connecteur sous siège corrodé", "Module airbag en panne"], gravite: 3, categorie: "Carrosserie" },
        "B1000": { code: "B1000", description: "Calculateur de confort — défaut interne", causes: ["Calculateur BSM/BCM défectueux", "Problème d'alimentation", "Mise à jour logicielle requise"], gravite: 2, categorie: "Carrosserie" }
    };

    // ===== Modal Elements =====
    const settingsBtn      = document.getElementById('settingsBtn');
    const settingsModal    = document.getElementById('settingsModal');
    const closeModalBtn    = document.getElementById('closeModalBtn');
    const saveSettingsBtn  = document.getElementById('saveSettingsBtn');
    const customModelInput = document.getElementById('customModel');
    const aiProviderSelect = document.getElementById('aiProvider');

    // ===== Sécurité : échappement HTML =====
    function escHtml(str) {
        return String(str ?? '').replace(/[&<>"']/g, c => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
    }

    // ===== Navigation (header + mobile bottom nav) =====
    const navBtns = document.querySelectorAll('.nav-btn');
    const mobileNavBtns = document.querySelectorAll('.mobile-nav-btn[data-section]');
    const appSections = document.querySelectorAll('.app-section');

    function showSection(sectionId) {
        appSections.forEach(s => s.classList.add('hidden'));
        navBtns.forEach(b => b.classList.remove('active'));
        mobileNavBtns.forEach(b => b.classList.remove('active'));

        const target = document.getElementById('section-' + sectionId);
        if (target) {
            target.classList.remove('hidden');
            // Sur mobile : remonter en haut de la section
            if (window.innerWidth <= 768) window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        document.querySelectorAll(`.nav-btn[data-section="${sectionId}"], .mobile-nav-btn[data-section="${sectionId}"]`)
            .forEach(b => b.classList.add('active'));
    }

    navBtns.forEach(btn => btn.addEventListener('click', () => showSection(btn.dataset.section)));
    mobileNavBtns.forEach(btn => btn.addEventListener('click', () => showSection(btn.dataset.section)));

    // Bouton paramètres dans la mobile nav
    const mobileSettingsBtn = document.getElementById('mobileSettingsBtn');
    if (mobileSettingsBtn) {
        mobileSettingsBtn.addEventListener('click', () => openModal());
    }

    // ===== Form Error Helpers =====
    function clearFormError() {
        formError.classList.add('hidden');
        formError.textContent = '';
    }

    // ===== Year Select =====
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 2006; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearSelect.appendChild(option);
    }

    // ===== Make/Model Selects =====
    Object.keys(carData).sort().forEach(make => {
        const option = document.createElement('option');
        option.value = make;
        option.textContent = make;
        carMakeSelect.appendChild(option);
    });

    carMakeSelect.addEventListener('change', () => {
        const selectedMake = carMakeSelect.value;
        carModelSelect.innerHTML = '<option value="">Sélectionnez un modèle</option>';
        if (selectedMake && carData[selectedMake]) {
            carModelSelect.disabled = false;
            carData[selectedMake].forEach(model => {
                const option = document.createElement('option');
                option.value = model;
                option.textContent = model;
                carModelSelect.appendChild(option);
            });
        } else {
            carModelSelect.disabled = true;
        }
        // Réinitialiser la photo colonne quand la marque change
        vehicleSidePhoto.classList.add('hidden');
        vehicleSideFallback.classList.remove('hidden');
        vehicleSideBadge.innerHTML = '';
    });

    yearSelect.addEventListener('change', () => {
        const make = carMakeSelect.value;
        const model = carModelSelect.value;
        const year = yearSelect.value;
        if (make && model && year) updateVehiclePhoto(make, model, year);
    });

    // ===== Modal Logic =====
    const openModal = () => {
        if (aiProviderSelect) aiProviderSelect.value = localStorage.getItem('ai_provider') || 'pollinations';
        if (customModelInput) customModelInput.value = localStorage.getItem('custom_model') || '';
        const backendUrlInput = document.getElementById('backendUrlInput');
        if (backendUrlInput) backendUrlInput.value = getBackendUrl();
        const emailDisplay = document.getElementById('settingsUserEmail');
        if (emailDisplay) emailDisplay.textContent = getUser() || '—';
        settingsModal.classList.remove('hidden');
    };

    const closeModal = () => settingsModal.classList.add('hidden');

    settingsBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    settingsModal.addEventListener('click', (e) => { if (e.target === settingsModal) closeModal(); });

    saveSettingsBtn.addEventListener('click', () => {
        const backendUrlInput = document.getElementById('backendUrlInput');
        if (backendUrlInput) {
            localStorage.setItem('amboul_backend_url', backendUrlInput.value.trim());
        }
        localStorage.setItem('ai_provider', aiProviderSelect.value);
        localStorage.setItem('custom_model', customModelInput.value.trim());
        closeModal();
        const savedMsgs = { fr: '✅ Sauvegardé !', en: '✅ Saved!', es: '✅ Guardado!', ht: '✅ Sovgade!' };
        saveSettingsBtn.textContent = savedMsgs[getLang()] || '✅ Sauvegardé !';
        setTimeout(() => { saveSettingsBtn.textContent = t('settings.save'); }, 2000);
    });

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        closeModal();
        logout();
    });

    // ===== Loading State =====
    const setLoading = (isLoading) => {
        submitBtn.disabled = isLoading;
        if (isLoading) {
            btnText.classList.add('hidden');
            loader.classList.remove('hidden');
        } else {
            btnText.classList.remove('hidden');
            loader.classList.add('hidden');
        }
    };

    // ===== OBD2 Functions =====
    function graviteLabel(g) {
        return { 1: t('severity.info'), 2: t('severity.warning'), 3: t('severity.critical') }[g] || t('severity.info');
    }

    function renderOBD2Cards(codes) {
        if (codes.length === 0) {
            obd2ResultsDiv.innerHTML = `<p class="obd2-empty">${t('obd2.empty')}</p>`;
            return;
        }
        obd2ResultsDiv.innerHTML = codes.map(entry => `
            <div class="obd2-card" title="${t('obd2.click_hint')}" onclick="useOBD2Code('${entry.code}')">
                <div class="obd2-card-header">
                    <span class="obd2-code">${entry.code}</span>
                    <span class="obd2-badge badge-${entry.gravite}">${graviteLabel(entry.gravite)}</span>
                </div>
                <p class="obd2-desc">${entry.description}</p>
                <p class="obd2-categorie">${entry.categorie} · ${entry.causes.slice(0, 2).join(', ')}${entry.causes.length > 2 ? '...' : ''}</p>
            </div>
        `).join('');
    }

    window.useOBD2Code = function(code) {
        const current = document.getElementById('carSymptom').value.trim();
        document.getElementById('carSymptom').value = current ? `${current}, ${code}` : code;
        showSection('diagnostic');
        document.getElementById('carSymptom').focus();
    };

    renderOBD2Cards(Object.values(OBD2_DATABASE));

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

    // ===== History Functions =====
    const historyMap = new Map(); // id → entry, évite l'injection apostrophe dans onclick

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

    function renderHistorique() {
        const history = loadHistory();
        historyMap.clear();
        history.forEach(e => historyMap.set(e.id, e));

        if (history.length === 0) {
            historiqueList.innerHTML = `<p class="historique-empty">${t('history.empty')}</p>`;
            return;
        }
        historiqueList.innerHTML = history.map(entry => `
            <div class="historique-card">
                <div class="historique-card-header">
                    <div>
                        <div class="historique-vehicule">${escHtml(entry.make)} ${escHtml(entry.model)} (${escHtml(entry.year)})</div>
                        <p class="historique-symptom">${escHtml(entry.symptom)}</p>
                    </div>
                    <div class="historique-meta">
                        <span class="historique-provider">${escHtml(entry.provider)}</span>
                        <span>${entry.date}</span>
                    </div>
                </div>
                <div class="historique-actions">
                    <button type="button" class="btn secondary-btn" onclick="reloadFromHistory(${entry.id})">${t('history.reload')}</button>
                    <button type="button" class="btn danger-btn" onclick="deleteHistoryEntry(${entry.id})">${t('history.delete')}</button>
                </div>
            </div>
        `).join('');
    }

    window.reloadFromHistory = function(id) {
        const entry = historyMap.get(id);
        if (!entry) return;
        document.getElementById('carSymptom').value = entry.symptom;
        showSection('diagnostic');
    };

    window.deleteHistoryEntry = function(id) {
        const history = loadHistory().filter(e => e.id !== id);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        renderHistorique();
    };

    clearHistoryBtn.addEventListener('click', () => {
        if (confirm(t('history.confirm_clear'))) {
            localStorage.removeItem(HISTORY_KEY);
            renderHistorique();
        }
    });

    renderHistorique();

    // ===== Colonnes redimensionnables =====
    const mainContent = document.getElementById('mainContent');
    const COL_STORAGE_KEY = 'amboul_col_widths';

    function applyStoredColWidths() {
        // Ne pas appliquer les largeurs sauvegardées sur mobile/petite tablette :
        // inline style outrepasse les media queries CSS et casse la mise en page.
        if (window.innerWidth <= 1100) return;
        const saved = localStorage.getItem(COL_STORAGE_KEY);
        if (!saved) return;
        if (saved.includes('NaN') || saved.includes('fr') || saved.includes('auto')) {
            localStorage.removeItem(COL_STORAGE_KEY);
            return;
        }
        mainContent.style.gridTemplateColumns = saved;
    }
    applyStoredColWidths();

    (function initResizeHandles() {
        let dragging = false;
        let activeHandle = null;
        let startX = 0;
        let startWidths = [];

        mainContent.addEventListener('mousedown', (e) => {
            if (!e.target.classList.contains('col-resize-handle')) return;
            e.preventDefault();
            dragging = true;
            activeHandle = e.target;
            activeHandle.classList.add('dragging');
            startX = e.clientX;

            const cols = getComputedStyle(mainContent).gridTemplateColumns.split(' ');
            startWidths = cols.map(v => {
                const px = parseFloat(v);
                return isNaN(px) ? 200 : px;
            });
            // Rejeter si des valeurs NaN subsistent (grille incohérente)
            if (startWidths.some(isNaN)) { dragging = false; return; }
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!dragging) return;
            const delta = e.clientX - startX;
            const handles = [...mainContent.querySelectorAll('.col-resize-handle')];
            const hIdx = handles.indexOf(activeHandle);
            // In the grid: col0, handle0, col1, handle1, col2, handle2, col3
            // handle index maps to grid column indices: colBefore = hIdx*2, colAfter = hIdx*2+2
            const colBefore = hIdx * 2;
            const colAfter = colBefore + 2;

            const newWidths = [...startWidths];
            const minW = 120;
            newWidths[colBefore] = Math.max(minW, startWidths[colBefore] + delta);
            newWidths[colAfter] = Math.max(minW, startWidths[colAfter] - delta);

            mainContent.style.gridTemplateColumns = newWidths.map((w, i) =>
                i % 2 === 1 ? '6px' : `${w}px`
            ).join(' ');
        });

        document.addEventListener('mouseup', stopResize);

        // ===== Touch events (tablette) =====
        mainContent.addEventListener('touchstart', (e) => {
            if (!e.target.classList.contains('col-resize-handle')) return;
            e.preventDefault();
            dragging = true;
            activeHandle = e.target;
            activeHandle.classList.add('dragging');
            startX = e.touches[0].clientX;
            const cols = getComputedStyle(mainContent).gridTemplateColumns.split(' ');
            startWidths = cols.map(v => { const px = parseFloat(v); return isNaN(px) ? 200 : px; });
            if (startWidths.some(isNaN)) { dragging = false; return; }
            document.body.style.userSelect = 'none';
        }, { passive: false });

        document.addEventListener('touchmove', (e) => {
            if (!dragging) return;
            e.preventDefault();
            const delta = e.touches[0].clientX - startX;
            const handles = [...mainContent.querySelectorAll('.col-resize-handle')];
            const hIdx = handles.indexOf(activeHandle);
            const colBefore = hIdx * 2;
            const colAfter = colBefore + 2;
            const newWidths = [...startWidths];
            const minW = 120;
            newWidths[colBefore] = Math.max(minW, startWidths[colBefore] + delta);
            newWidths[colAfter] = Math.max(minW, startWidths[colAfter] - delta);
            mainContent.style.gridTemplateColumns = newWidths.map((w, i) =>
                i % 2 === 1 ? '6px' : `${w}px`
            ).join(' ');
        }, { passive: false });

        document.addEventListener('touchend', stopResize);

        function stopResize() {
            if (!dragging) return;
            dragging = false;
            if (activeHandle) activeHandle.classList.remove('dragging');
            activeHandle = null;
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            localStorage.setItem(COL_STORAGE_KEY, mainContent.style.gridTemplateColumns);
        }
    })();

    // ===== Zoom SVG schéma =====
    const svgZoomModal = document.getElementById('svgZoomModal');
    const svgZoomBody = document.getElementById('svgZoomBody');
    const svgZoomClose = document.getElementById('svgZoomClose');

    // Zoom du panneau pièces entier (clic sur la zone hors image/lien)
    document.addEventListener('click', (e) => {
        const panel = e.target.closest('.parts-panel');
        if (!panel) return;
        if (e.target.closest('a') || e.target.closest('img') || e.target.closest('.svg-zoom-modal')) return;
        svgZoomBody.innerHTML = diagPanelContent.innerHTML;
        svgZoomModal.classList.remove('hidden');
    });

    function closeSvgZoom() { svgZoomModal.classList.add('hidden'); }
    svgZoomClose.addEventListener('click', closeSvgZoom);
    svgZoomModal.querySelector('.svg-zoom-backdrop').addEventListener('click', closeSvgZoom);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeSvgZoom(); });

    // ===== Vehicle Photo (Wikipedia API) =====
    async function fetchVehiclePhoto(make, model) {
        const searches = [
            `${make} ${model}`,
            `${make} ${model} automobile`,
            make
        ];
        for (const query of searches) {
            try {
                const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(query)}&prop=pageimages&format=json&pithumbsize=500&origin=*`;
                const res = await fetch(url);
                const data = await res.json();
                const pages = data.query?.pages || {};
                const page = Object.values(pages)[0];
                if (page?.thumbnail?.source) return page.thumbnail.source;
            } catch { /* try next */ }
        }
        return null;
    }

    // ===== Photo colonne gauche (persistante) =====
    async function updateVehiclePhoto(make, model, year) {
        vehicleSideBadge.innerHTML = `<span>${escHtml(make)}</span><span style="opacity:0.75">${escHtml(model)}</span><span class="year-tag">${escHtml(year)}</span>`;
        vehicleSidePhoto.classList.add('hidden');
        vehicleSideFallback.classList.remove('hidden');

        const photoUrl = await fetchVehiclePhoto(make, model);
        if (photoUrl) {
            vehicleSidePhoto.src = photoUrl;
            vehicleSidePhoto.alt = `${make} ${model} ${year}`;
            vehicleSidePhoto.classList.remove('hidden');
            vehicleSideFallback.classList.add('hidden');
        }
    }

    // ===== Base de données des pièces avec coordonnées SVG =====
    // Ordre : phrases longues en premier pour éviter les faux-positifs courts
    const PARTS_DB = [
        // Électrique / Charge
        { key: 'alternateur',              x: 48,  y: 72,  color: '#3b82f6', label: 'Alternateur',           zone: 'electrical' },
        { key: 'batterie',                 x: 33,  y: 68,  color: '#3b82f6', label: 'Batterie',              zone: 'electrical' },
        { key: 'démarreur',                x: 40,  y: 79,  color: '#3b82f6', label: 'Démarreur',             zone: 'electrical' },
        { key: 'calculateur moteur',       x: 88,  y: 67,  color: '#3b82f6', label: 'Calculateur (ECU)',     zone: 'electrical' },
        { key: 'calculateur',              x: 88,  y: 67,  color: '#3b82f6', label: 'Calculateur (ECU)',     zone: 'electrical' },
        { key: 'boîte à fusibles',         x: 80,  y: 62,  color: '#3b82f6', label: 'Boîte à fusibles',     zone: 'electrical' },
        { key: 'fusible',                  x: 80,  y: 62,  color: '#3b82f6', label: 'Fusible(s)',            zone: 'electrical' },
        { key: 'motoventilateur',          x: 22,  y: 65,  color: '#3b82f6', label: 'Motoventilateur',      zone: 'electrical' },
        // Moteur — capteurs
        { key: 'débitmètre',               x: 27,  y: 65,  color: '#f59e0b', label: 'Débitmètre (MAF)',     zone: 'engine' },
        { key: 'capteur de position papillon', x: 60, y: 68, color: '#f59e0b', label: 'Capteur papillon (TPS)', zone: 'engine' },
        { key: 'capteur position vilebrequin', x: 63, y: 79, color: '#f59e0b', label: 'Capteur vilebrequin (CKP)', zone: 'engine' },
        { key: 'capteur position arbre à cames', x: 55, y: 57, color: '#f59e0b', label: "Capteur arbre à cames (CMP)", zone: 'engine' },
        { key: 'capteur de cliquetis',     x: 55,  y: 76,  color: '#f59e0b', label: 'Capteur cliquetis',    zone: 'engine' },
        { key: 'capteur iat',              x: 27,  y: 64,  color: '#f59e0b', label: 'Capteur temp. air',    zone: 'engine' },
        { key: 'capteur ect',              x: 63,  y: 62,  color: '#f59e0b', label: 'Capteur temp. liquide',zone: 'engine' },
        { key: 'vanne iac',                x: 62,  y: 69,  color: '#f59e0b', label: 'Vanne IAC (ralenti)',  zone: 'engine' },
        { key: 'vanne egr',                x: 52,  y: 63,  color: '#f59e0b', label: 'Vanne EGR',            zone: 'engine' },
        // Moteur — mécanique
        { key: 'joint de culasse',         x: 56,  y: 65,  color: '#ef4444', label: 'Joint de culasse',     zone: 'engine' },
        { key: 'culasse',                  x: 55,  y: 62,  color: '#ef4444', label: 'Culasse',              zone: 'engine' },
        { key: 'courroie de distribution', x: 30,  y: 67,  color: '#f59e0b', label: 'Courroie distrib.',    zone: 'engine' },
        { key: 'turbocompresseur',         x: 40,  y: 60,  color: '#f59e0b', label: 'Turbocompresseur',     zone: 'engine' },
        { key: 'turbo',                    x: 40,  y: 60,  color: '#f59e0b', label: 'Turbo',                zone: 'engine' },
        { key: 'bobine d\'allumage',       x: 53,  y: 58,  color: '#f59e0b', label: "Bobine d'allumage",   zone: 'engine' },
        { key: 'bobine',                   x: 53,  y: 58,  color: '#f59e0b', label: "Bobine d'allumage",   zone: 'engine' },
        { key: 'bougie',                   x: 58,  y: 60,  color: '#f59e0b', label: 'Bougie(s)',            zone: 'engine' },
        { key: 'injecteur',                x: 60,  y: 65,  color: '#f59e0b', label: 'Injecteur(s)',         zone: 'engine' },
        { key: 'thermostat',               x: 63,  y: 62,  color: '#f59e0b', label: 'Thermostat',           zone: 'engine' },
        { key: 'radiateur',                x: 22,  y: 70,  color: '#f59e0b', label: 'Radiateur',            zone: 'engine' },
        { key: 'compresseur de climatisation', x: 56, y: 73, color: '#8b5cf6', label: 'Compresseur clim.', zone: 'engine' },
        // Transmission
        { key: 'boîte de vitesses',        x: 115, y: 76,  color: '#f59e0b', label: 'Boîte de vitesses',   zone: 'transmission' },
        { key: 'convertisseur de couple',  x: 108, y: 79,  color: '#f59e0b', label: 'Convertisseur couple', zone: 'transmission' },
        { key: 'solénoïde de rapport',     x: 118, y: 80,  color: '#f59e0b', label: 'Solénoïde rapport',   zone: 'transmission' },
        { key: 'embrayage',                x: 120, y: 73,  color: '#f59e0b', label: 'Embrayage',            zone: 'transmission' },
        // Échappement / Émissions
        { key: 'sonde lambda amont',       x: 125, y: 84,  color: '#f59e0b', label: 'Sonde lambda (amont)', zone: 'exhaust' },
        { key: 'sonde lambda aval',        x: 178, y: 84,  color: '#f59e0b', label: 'Sonde lambda (aval)',  zone: 'exhaust' },
        { key: 'sonde lambda',             x: 150, y: 84,  color: '#f59e0b', label: 'Sonde lambda',         zone: 'exhaust' },
        { key: 'pot catalytique',          x: 165, y: 82,  color: '#f59e0b', label: 'Catalyseur',           zone: 'exhaust' },
        { key: 'catalyseur',               x: 165, y: 82,  color: '#f59e0b', label: 'Catalyseur',           zone: 'exhaust' },
        { key: 'dpf',                      x: 170, y: 82,  color: '#f59e0b', label: 'Filtre à particules (DPF)', zone: 'exhaust' },
        { key: 'fap',                      x: 170, y: 82,  color: '#f59e0b', label: 'FAP',                  zone: 'exhaust' },
        // Carburant
        { key: 'pompe à carburant',        x: 200, y: 80,  color: '#f59e0b', label: 'Pompe à carburant',   zone: 'fuel' },
        { key: 'filtre à carburant',       x: 140, y: 78,  color: '#f59e0b', label: 'Filtre à carburant',  zone: 'fuel' },
        { key: 'réservoir',                x: 193, y: 72,  color: '#f59e0b', label: 'Réservoir',            zone: 'fuel' },
        { key: 'canister',                 x: 205, y: 75,  color: '#f59e0b', label: 'Canister EVAP',        zone: 'fuel' },
        // Châssis / Roues
        { key: 'capteur abs avant',        x: 72,  y: 97,  color: '#ef4444', label: 'Capteur ABS avant',   zone: 'wheel-front' },
        { key: 'capteur abs arrière',      x: 218, y: 97,  color: '#ef4444', label: 'Capteur ABS arrière', zone: 'wheel-rear' },
        { key: 'abs',                      x: 72,  y: 97,  color: '#ef4444', label: 'Système ABS',         zone: 'wheel-front' },
        { key: 'amortisseur avant',        x: 65,  y: 87,  color: '#ef4444', label: 'Amortisseur avant',   zone: 'wheel-front' },
        { key: 'amortisseur arrière',      x: 215, y: 87,  color: '#ef4444', label: 'Amortisseur arrière', zone: 'wheel-rear' },
        { key: 'roulement avant',          x: 72,  y: 93,  color: '#ef4444', label: 'Roulement avant',     zone: 'wheel-front' },
        { key: 'roulement arrière',        x: 218, y: 93,  color: '#ef4444', label: 'Roulement arrière',   zone: 'wheel-rear' },
        // Carrosserie / Habitacle
        { key: 'airbag conducteur',        x: 140, y: 50,  color: '#8b5cf6', label: 'Airbag conducteur',   zone: 'cabin' },
        { key: 'airbag passager',          x: 155, y: 48,  color: '#8b5cf6', label: 'Airbag passager',     zone: 'cabin' },
        { key: 'airbag',                   x: 145, y: 50,  color: '#8b5cf6', label: 'Airbag',              zone: 'cabin' },
    ];

    function detectParts(symptom, result) {
        const text = (symptom + ' ' + result).toLowerCase();
        const found = [];
        const seenLabels = new Set();
        for (const part of PARTS_DB) {
            if (text.includes(part.key) && !seenLabels.has(part.label)) {
                found.push(part);
                seenLabels.add(part.label);
                if (found.length >= 7) break; // max 7 pièces
            }
        }
        return found;
    }

    // SVG de base du véhicule (réutilisable)
    const ZONE_LABELS = {
        engine: 'Moteur', transmission: 'Transmission', exhaust: 'Échappement',
        electrical: 'Électrique', fuel: 'Carburant', 'wheel-front': 'Roue av.',
        'wheel-rear': 'Roue arr.', cabin: 'Habitacle'
    };

    // Termes Wikipedia pour chaque pièce (en anglais pour de meilleures images)
    const PART_WIKI = {
        'Alternateur':              'Alternator (automobile)',
        'Batterie':                 'Automotive battery',
        'Démarreur':                'Starter motor',
        'Calculateur (ECU)':        'Engine control unit',
        'Boîte à fusibles':         'Fuse (electrical)',
        'Fusible(s)':               'Fuse (electrical)',
        'Motoventilateur':          'Radiator fan',
        'Débitmètre (MAF)':         'Mass airflow sensor',
        'Capteur papillon (TPS)':   'Throttle position sensor',
        'Capteur vilebrequin (CKP)':'Crankshaft position sensor',
        "Capteur arbre à cames (CMP)":'Camshaft position sensor',
        'Capteur cliquetis':        'Knock sensor',
        'Capteur temp. air':        'Intake air temperature sensor',
        'Capteur temp. liquide':    'Coolant temperature sensor',
        'Vanne IAC (ralenti)':      'Idle air control valve',
        'Vanne EGR':                'Exhaust gas recirculation',
        'Joint de culasse':         'Head gasket',
        'Culasse':                  'Cylinder head',
        'Courroie distrib.':        'Timing belt',
        'Turbo':                    'Turbocharger',
        'Turbocompresseur':         'Turbocharger',
        "Bobine d'allumage":        'Ignition coil',
        'Bougie(s)':                'Spark plug',
        'Injecteur(s)':             'Fuel injector',
        'Thermostat':               'Thermostat',
        'Radiateur':                'Radiator engine cooling',
        'Compresseur clim.':        'Compressor air conditioning',
        'Boîte de vitesses':        'Manual transmission',
        'Convertisseur couple':     'Torque converter',
        'Solénoïde rapport':        'Transmission solenoid',
        'Embrayage':                'Clutch',
        'Sonde lambda (amont)':     'Oxygen sensor',
        'Sonde lambda (aval)':      'Oxygen sensor',
        'Sonde lambda':             'Oxygen sensor',
        'Catalyseur':               'Catalytic converter',
        'FAP':                      'Diesel particulate filter',
        'Filtre à particules (DPF)':'Diesel particulate filter',
        'Pompe à carburant':        'Fuel pump',
        'Filtre à carburant':       'Fuel filter',
        'Réservoir':                'Fuel tank',
        'Canister EVAP':            'Evaporative emission control',
        'Capteur ABS avant':        'Anti-lock braking system',
        'Capteur ABS arrière':      'Anti-lock braking system',
        'Système ABS':              'Anti-lock braking system',
        'Amortisseur avant':        'Shock absorber',
        'Amortisseur arrière':      'Shock absorber',
        'Roulement avant':          'Wheel bearing',
        'Roulement arrière':        'Wheel bearing',
        'Airbag conducteur':        'Airbag',
        'Airbag passager':          'Airbag',
        'Airbag':                   'Airbag',
    };

    async function fetchWikiImage(query) {
        try {
            const url = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(query)}&prop=pageimages&format=json&pithumbsize=250&origin=*`;
            const res = await fetch(url);
            const data = await res.json();
            const page = Object.values(data.query?.pages || {})[0];
            return page?.thumbnail?.source || null;
        } catch { return null; }
    }

    // Cherche une photo spécifique au véhicule sur Wikimedia Commons, puis Wikipedia
    async function fetchPartImageForVehicle(partLabel, make, model, year) {
        const queries = [
            `${make} ${model} ${year} ${partLabel}`,
            `${make} ${model} ${partLabel}`,
            `${make} ${partLabel}`,
        ];
        for (const q of queries) {
            try {
                const url = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(q)}&prop=pageimages&format=json&pithumbsize=320&gsrlimit=5&origin=*`;
                const res = await fetch(url);
                const data = await res.json();
                const pages = Object.values(data.query?.pages || {});
                const withImg = pages.filter(p => p.thumbnail?.source);
                if (withImg.length > 0) return withImg[0].thumbnail.source;
            } catch { /* essayer la requête suivante */ }
        }
        // Fallback : Wikipedia générique pour la pièce
        const wikiQuery = PART_WIKI[partLabel];
        if (wikiQuery) {
            const src = await fetchWikiImage(wikiQuery);
            if (src) return src;
        }
        return null;
    }

    let _imgGeneration = 0;

    async function loadPartImages(parts, make, model, year) {
        const gen = ++_imgGeneration;
        await Promise.all(parts.map(async (part, i) => {
            const src = await fetchPartImageForVehicle(part.label, make, model, year);
            if (gen !== _imgGeneration) return; // diagnostic re-lancé — ignorer
            const el = document.getElementById(`pimg-${i}`);
            if (!src || !el) return;
            // encodeURIComponent évite l'injection : &#39; est décodé par le parseur HTML
            // avant exécution JS — encodeURIComponent encode tout caractère dangereux.
            el.innerHTML = `<img src="${escHtml(src)}" alt="${escHtml(part.label)}" class="part-card-photo"
                onclick="zoomPartPhoto(decodeURIComponent('${encodeURIComponent(src)}'), decodeURIComponent('${encodeURIComponent(part.label)}'))"
                onerror="this.parentElement.innerHTML='<span class=part-icon-fb>${escHtml(getPartEmoji(part.zone))}</span>'">`;
        }));
    }

    window.zoomPartPhoto = function(src, label) {
        svgZoomBody.innerHTML = `
            <div class="part-zoom-body">
                <div class="part-zoom-label">${escHtml(label)}</div>
                <img src="${escHtml(src)}" alt="${escHtml(label)}" class="part-zoom-img">
            </div>`;
        svgZoomModal.classList.remove('hidden');
    };

    function getPartEmoji(zone) {
        return { engine:'⚙️', transmission:'🔄', electrical:'⚡', exhaust:'💨',
                 fuel:'⛽', 'wheel-front':'🔵', 'wheel-rear':'🔵', cabin:'🪑' }[zone] || '🔧';
    }

    function buildPartsDiagram(parts, make, model, year) {
        if (parts.length === 0) {
            return `<div class="parts-panel-empty">
                <span class="empty-icon diag-empty-icon">🔍</span>
                <p>${t('diag.parts_empty')}</p>
            </div>`;
        }

        const cards = parts.map((part, i) => {
            const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(`${make} ${model} ${year} ${part.label}`)}&tbm=isch`;
            return `<div class="part-card">
                <div class="part-card-num" style="background:${part.color}">${i + 1}</div>
                <div class="part-card-img" id="pimg-${i}" title="Cliquer pour agrandir">
                    <span class="part-icon-fb">${getPartEmoji(part.zone)}</span>
                </div>
                <div class="part-card-info">
                    <div class="part-card-name">${part.label}</div>
                    <div class="part-card-zone" style="color:${part.color}">${ZONE_LABELS[part.zone] || part.zone}</div>
                    <a href="${googleUrl}" target="_blank" rel="noopener noreferrer" class="part-card-search">🔍 Voir sur Google</a>
                </div>
            </div>`;
        }).join('');

        setTimeout(() => loadPartImages(parts, make, model, year), 30);

        return `<div class="parts-panel">
            <div class="parts-panel-title">${t('diag.parts_title')} — ${make} ${model} ${year}</div>
            <div class="parts-cards">${cards}</div>
        </div>`;
    }

    // ===== Vérification des symptômes (checkboxes sur les tableaux) =====
    function addSymptomChecks() {
        const tables = resultContainer.querySelectorAll('table');
        tables.forEach(table => {
            // Ajouter l'en-tête "État" si thead existe
            const theadRow = table.querySelector('thead tr');
            if (theadRow && !theadRow.querySelector('.check-th')) {
                const th = document.createElement('th');
                th.className = 'check-th';
                th.textContent = t('check.header');
                theadRow.insertBefore(th, theadRow.firstChild);
            }

            // Ajouter une cellule check à chaque ligne du tbody
            const bodyRows = table.querySelectorAll('tbody tr');
            bodyRows.forEach(row => {
                if (row.querySelector('.check-td')) return; // déjà ajouté
                const td = document.createElement('td');
                td.className = 'check-td';

                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'check-btn';
                btn.title = t('check.normal');
                btn.setAttribute('aria-pressed', 'false');
                btn.innerHTML = `<span class="check-icon unchecked">○</span>`;

                btn.addEventListener('click', () => {
                    const isNormal = row.classList.toggle('symptom-normal');
                    btn.setAttribute('aria-pressed', String(isNormal));
                    btn.title = isNormal ? t('check.verified') : t('check.normal');
                    btn.innerHTML = isNormal
                        ? `<span class="check-icon checked">✓</span>`
                        : `<span class="check-icon unchecked">○</span>`;
                });

                td.appendChild(btn);
                row.insertBefore(td, row.firstChild);
            });
        });
    }

    // ===== Print Button =====
    printBtn.addEventListener('click', () => {
        const make = document.getElementById('carMake').value;
        const model = document.getElementById('carModel').value;
        const year = document.getElementById('carYear').value;
        const symptom = document.getElementById('carSymptom').value;
        printZone.innerHTML = `
            <h1>🔧 Amboul Mecanic Repair</h1>
            <p style="color:#555; margin-bottom:1rem;">Rapport de diagnostic — ${new Date().toLocaleString('fr-CA')}</p>
            <h2>Véhicule : ${escHtml(make)} ${escHtml(model)} (${escHtml(year)})</h2>
            <h3>Symptômes / Codes :</h3>
            <p>${escHtml(symptom)}</p>
            <h3>Diagnostic IA :</h3>
            ${resultContainer.innerHTML}
        `;
        window.print();
    });

    // ===== Form Submit =====
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearFormError();

        const provider = localStorage.getItem('ai_provider') || 'pollinations';

        const make = document.getElementById('carMake').value.trim();
        const model = document.getElementById('carModel').value.trim();
        const year = document.getElementById('carYear').value;
        const symptom = document.getElementById('carSymptom').value.trim();

        setLoading(true);
        resultContainer.innerHTML = '';
        resultContainer.classList.remove('empty');
        printBtn.classList.add('hidden');

        try {
            const textResponse = await callDiagnose({ make, model, year, symptom, provider });

            const rawHtml = typeof window.marked !== 'undefined'
                ? window.marked.parse(textResponse)
                : `<pre style="white-space:pre-wrap;font-family:inherit;">${textResponse}</pre>`;
            const parsedHtml = typeof window.DOMPurify !== 'undefined'
                ? window.DOMPurify.sanitize(rawHtml, { USE_PROFILES: { html: true } })
                : rawHtml;

            resultContainer.innerHTML = parsedHtml;
            addSymptomChecks();
            const parts = detectParts(symptom, textResponse);
            diagPanelContent.innerHTML = buildPartsDiagram(parts, make, model, year);

            saveToHistory({ make, model, year, symptom, provider, result: textResponse });
            printBtn.classList.remove('hidden');

        } catch (error) {
            console.error('API Error:', error);
            let userMessage = error.message;
            if (error.message.includes('401') || error.message.toLowerCase().includes('session')) {
                userMessage = t('error.session');
            } else if (error.message.includes('429') || error.message.toLowerCase().includes('quota')) {
                userMessage = t('error.quota');
            } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                userMessage = t('error.network');
            }
            resultContainer.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon" style="color: var(--error-color)">⚠️</span>
                    <p style="color: var(--error-color); font-weight: 600;">${escHtml(userMessage)}</p>
                    <p style="font-size: 0.8rem; margin-top: 0.5rem; color: var(--text-muted);">Détail : ${escHtml(error.message)}</p>
                </div>
            `;
            printBtn.classList.add('hidden');
        } finally {
            setLoading(false);
        }
    });
});
