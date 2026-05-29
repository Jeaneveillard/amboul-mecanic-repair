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
