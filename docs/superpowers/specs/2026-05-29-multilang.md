# Multilinguisme — Amboul Mecanic Repair

Date: 2026-05-29
Langues : Français (fr) · English (en) · Español (es) · Kreyòl ayisyen (ht)

---

## Objectif

Ajouter 4 langues à l'app. Chaque langue change **absolument tout** : onglets de navigation, boutons, labels de formulaire, placeholders, messages vides, erreurs, overlay de connexion, modal ⚙️, mobile nav, section OBD2, historique, schéma de panne. L'IA répond aussi dans la langue choisie.

---

## Architecture

### Nouveau fichier `i18n.js`

Chargé avant `app.js` dans `index.html`. Contient :

```javascript
const TRANSLATIONS = { fr: {...}, en: {...}, es: {...}, ht: {...} };
let currentLang = localStorage.getItem('amboul_lang') || 'fr';
function t(key) { return TRANSLATIONS[currentLang]?.[key] ?? TRANSLATIONS['fr'][key] ?? key; }
function setLang(lang) { currentLang = lang; localStorage.setItem('amboul_lang', lang); applyTranslations(); }
function applyTranslations() { /* met à jour tous les textes statiques du DOM */ }
function getLang() { return currentLang; }
```

### Sélecteur dans le header

```html
<div class="lang-switcher">
  <button class="lang-btn active" data-lang="fr">FR</button>
  <button class="lang-btn" data-lang="en">EN</button>
  <button class="lang-btn" data-lang="es">ES</button>
  <button class="lang-btn" data-lang="ht">HT</button>
</div>
```

Positionné entre le logo et la nav principale.

---

## Clés de traduction — inventaire complet

### Navigation
| Clé | FR | EN | ES | HT |
|-----|----|----|----|----|
| `nav.diagnostic` | 🔧 Diagnostic | 🔧 Diagnosis | 🔧 Diagnóstico | 🔧 Dyagnostik |
| `nav.obd2` | 🔍 Base OBD2 | 🔍 OBD2 Database | 🔍 Base OBD2 | 🔍 Baz OBD2 |
| `nav.history` | 📋 Historique | 📋 History | 📋 Historial | 📋 Istwa |
| `nav.settings` | ⚙️ Paramètres | ⚙️ Settings | ⚙️ Ajustes | ⚙️ Paramèt |

### Formulaire diagnostic
| Clé | FR | EN | ES | HT |
|-----|----|----|----|----|
| `form.title` | Nouveau Diagnostic | New Diagnosis | Nuevo Diagnóstico | Nouvo Dyagnostik |
| `form.subtitle` | Entrez les informations du véhicule de 2006 à nos jours. | Enter vehicle information from 2006 to present. | Ingrese la información del vehículo desde 2006. | Antre enfòmasyon veyikil la soti 2006 rive jodi a. |
| `form.make` | Marque du véhicule | Vehicle Make | Marca del vehículo | Mak veyikil la |
| `form.make_placeholder` | Sélectionnez une marque | Select a make | Seleccione una marca | Chwazi yon mak |
| `form.model` | Modèle | Model | Modelo | Modèl |
| `form.model_placeholder` | Sélectionnez un modèle | Select a model | Seleccione un modelo | Chwazi yon modèl |
| `form.year` | Année | Year | Año | Ane |
| `form.year_placeholder` | Sélectionnez l'année | Select the year | Seleccione el año | Chwazi ane a |
| `form.symptom` | Symptômes ou Codes OBD2 | Symptoms or OBD2 Codes | Síntomas o Códigos OBD2 | Sentom oswa Kòd OBD2 |
| `form.symptom_placeholder` | Ex: Code P0171, ou le moteur broute... | E.g.: Code P0171, or engine misfiring... | Ej: Código P0171, o el motor falla... | Egz: Kòd P0171, oswa motè a bat mal... |
| `form.submit` | Lancer l'Analyse | Run Analysis | Iniciar Análisis | Kòmanse Analiz |

### Résultats
| Clé | FR | EN | ES | HT |
|-----|----|----|----|----|
| `result.title` | Résultat du Diagnostic | Diagnosis Result | Resultado del Diagnóstico | Rezilta Dyagnostik |
| `result.empty` | En attente des données du véhicule... | Waiting for vehicle data... | Esperando datos del vehículo... | Ap tann done veyikil la... |
| `result.print` | 🖨️ Imprimer | 🖨️ Print | 🖨️ Imprimir | 🖨️ Enprime |

### Schéma de panne (4e colonne)
| Clé | FR | EN | ES | HT |
|-----|----|----|----|----|
| `diag.title` | Schéma de panne | Fault Diagram | Diagrama de Falla | Dyagram Pàn |
| `diag.empty` | Lancez un diagnostic pour localiser la panne | Run a diagnosis to locate the fault | Ejecute un diagnóstico para localizar la falla | Kòmanse yon dyagnostik pou jwenn kote pàn nan |
| `diag.parts_title` | 🔧 Pièces en cause | 🔧 Parts at Fault | 🔧 Piezas Defectuosas | 🔧 Pati ki Defye |

### Base OBD2
| Clé | FR | EN | ES | HT |
|-----|----|----|----|----|
| `obd2.title` | Base de Données OBD2 | OBD2 Database | Base de Datos OBD2 | Baz Done OBD2 |
| `obd2.subtitle` | Recherchez un code ou un mot-clé. Cliquez pour utiliser dans le diagnostic. | Search a code or keyword. Click to use in diagnosis. | Busque un código o palabra clave. Haga clic para usar en el diagnóstico. | Chèche yon kòd oswa mo-kle. Klike pou itilize nan dyagnostik. |
| `obd2.search_placeholder` | Rechercher : P0171, catalyseur, lambda... | Search: P0171, catalytic converter, lambda... | Buscar: P0171, catalizador, lambda... | Chèche: P0171, katalizè, lambda... |
| `obd2.empty` | Aucun code trouvé pour cette recherche. | No code found for this search. | No se encontró código para esta búsqueda. | Pa gen kòd ki jwenn pou rechèch sa a. |

### Historique
| Clé | FR | EN | ES | HT |
|-----|----|----|----|----|
| `history.title` | Historique des Diagnostics | Diagnosis History | Historial de Diagnósticos | Istwa Dyagnostik |
| `history.subtitle` | Les 10 derniers diagnostics sauvegardés sur cet appareil. | The last 10 diagnoses saved on this device. | Los últimos 10 diagnósticos guardados en este dispositivo. | 10 dènye dyagnostik ki sovgade sou aparèy sa a. |
| `history.clear` | 🗑️ Effacer tout | 🗑️ Clear all | 🗑️ Borrar todo | 🗑️ Efase tout |
| `history.empty` | Aucun diagnostic sauvegardé. | No diagnosis saved. | Ningún diagnóstico guardado. | Pa gen dyagnostik sovgade. |
| `history.reload` | ↩️ Recharger | ↩️ Reload | ↩️ Recargar | ↩️ Rechaje |
| `history.delete` | 🗑️ Supprimer | 🗑️ Delete | 🗑️ Eliminar | 🗑️ Efase |
| `history.confirm_clear` | Effacer tout l'historique ? | Clear all history? | ¿Borrar todo el historial? | Efase tout istwa a? |

### Overlay de connexion
| Clé | FR | EN | ES | HT |
|-----|----|----|----|----|
| `auth.subtitle` | Connectez-vous pour accéder à l'outil de diagnostic. | Sign in to access the diagnostic tool. | Inicie sesión para acceder a la herramienta de diagnóstico. | Konekte ou pou jwenn aksè nan zouti dyagnostik la. |
| `auth.email` | Email | Email | Correo electrónico | Imèl |
| `auth.password` | Mot de passe | Password | Contraseña | Modpas |
| `auth.signin` | Se connecter | Sign in | Iniciar sesión | Konekte |
| `auth.register` | Créer un compte | Create account | Crear cuenta | Kreye kont |
| `auth.no_account` | Pas encore de compte ? | No account yet? | ¿Aún no tienes cuenta? | Pa gen kont toujou? |
| `auth.have_account` | Déjà un compte ? | Already have an account? | ¿Ya tienes una cuenta? | Deja gen yon kont? |
| `auth.free_mode` | Continuer sans compte (Pollinations gratuit) | Continue without account (free Pollinations) | Continuar sin cuenta (Pollinations gratis) | Kontinye san kont (Pollinations gratis) |

### Modal ⚙️ Paramètres
| Clé | FR | EN | ES | HT |
|-----|----|----|----|----|
| `settings.title` | Configuration IA | AI Configuration | Configuración IA | Konfigirasyon IA |
| `settings.user` | Utilisateur connecté | Logged in as | Usuario conectado | Itilizatè konekte |
| `settings.backend_url` | URL du Backend | Backend URL | URL del Backend | URL Backend |
| `settings.provider` | Fournisseur IA préféré | Preferred AI Provider | Proveedor IA preferido | Founisè IA prefere |
| `settings.model` | Modèle personnalisé (Optionnel) | Custom Model (Optional) | Modelo personalizado (Opcional) | Modèl pèsonalize (Opsyonèl) |
| `settings.save` | Sauvegarder | Save | Guardar | Sovgade |
| `settings.logout` | Se déconnecter | Sign out | Cerrar sesión | Dekonekte |

### Messages d'erreur
| Clé | FR | EN | ES | HT |
|-----|----|----|----|----|
| `error.api_key` | Clé API manquante. Configurez-la dans ⚙️ Paramètres. | Missing API key. Configure it in ⚙️ Settings. | Clave API faltante. Configúrela en ⚙️ Ajustes. | Kle API manke. Konfigire l nan ⚙️ Paramèt. |
| `error.session` | Session expirée. Reconnectez-vous. | Session expired. Please sign in again. | Sesión expirada. Inicie sesión de nuevo. | Sesyon ekspire. Tanpri konekte ankò. |
| `error.network` | Erreur réseau. Vérifiez votre connexion internet. | Network error. Check your internet connection. | Error de red. Verifique su conexión a internet. | Erè rezo. Tcheke koneksyon entènèt ou. |

### Tableau symptômes (colonne "État")
| Clé | FR | EN | ES | HT |
|-----|----|----|----|----|
| `check.header` | État | Status | Estado | Estati |
| `check.normal` | Marquer comme normal | Mark as normal | Marcar como normal | Make kòm nòmal |
| `check.verified` | Normal ✓ — cliquer pour annuler | Normal ✓ — click to undo | Normal ✓ — clic para deshacer | Nòmal ✓ — klike pou defèt |

---

## IA dans la bonne langue

Le `userPrompt` envoyé au backend ajoute en fin de requête :

```
fr : (répondre en français)
en : Respond ONLY in English.
es : Responde ÚNICAMENTE en español.
ht : Reponn SÈLMAN ann kreyòl ayisyen.
```

Cette instruction est ajoutée côté frontend dans `api.js` avant l'envoi.

---

## Fichiers modifiés

| Fichier | Action |
|---------|--------|
| `i18n.js` | Créer — dictionnaire + t() + setLang() + applyTranslations() |
| `index.html` | Ajouter boutons langue dans le header |
| `app.js` | Remplacer tous les textes codés en dur par t('clé') |
| `style.css` | Styles `.lang-btn` |
| `api.js` | Ajouter instruction langue au userPrompt |

---

## Contraintes

- `applyTranslations()` ne couvre que les éléments statiques du DOM. Les éléments générés dynamiquement (cartes OBD2, historique, schéma pièces) utilisent `t()` directement dans leurs fonctions de rendu.
- Le créole haïtien n'a pas de traduction OBD2 officielle — les noms de codes (P0171, etc.) restent en français/anglais technique.
- Pas de RTL (toutes les langues cibles sont LTR).
