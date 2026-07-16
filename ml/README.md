# Sales Weather — ML Service

Petit microservice Python (FastAPI + scikit-learn) qui entraîne et sert
les modèles de prédiction (revenu/tickets + demande par produit), en
complément de l'heuristique déjà présente dans le backend NestJS.

Il entraîne systématiquement **deux types de modèles** (Régression Linéaire
et Random Forest) et renvoie les deux résultats + celui recommandé (le plus
précis lors du dernier entraînement), pour pouvoir comparer.

## Installation

```bash
cd ml
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux

pip install -r requirements.txt
```

## Lancer le service

Le backend NestJS doit tourner en même temps (sur `http://localhost:3000`
par défaut — modifiable via la variable d'environnement `NESTJS_BASE_URL`).

```bash
uvicorn app.main:app --reload --port 8000
```

Le service est alors disponible sur `http://localhost:8000`.
Documentation interactive auto-générée : `http://localhost:8000/docs`.

## Endpoints

### `GET /health`
Vérifie que le service tourne.

### `POST /train`
Récupère les données d'entraînement depuis NestJS
(`/predictions/training-data/revenue` et `/demand`), entraîne les 4 modèles
(linéaire + forêt, pour revenu et demande), les sauvegarde dans `models/`,
et renvoie les métriques (R², MAE) de chacun.

Si moins de 5 échantillons sont disponibles, l'entraînement est annulé et
`status: "not_enough_data"` est renvoyé.

### `POST /predict/revenue`
Corps attendu :
```json
{
  "temperature": 32,
  "humidity": 45,
  "rainfall": 0,
  "windSpeed": 12,
  "weatherCondition": "SUNNY"
}
```
Renvoie `status: "not_trained"` si `/train` n'a jamais réussi.

### `POST /predict/demand`
Corps attendu :
```json
{
  "temperature": 32,
  "humidity": 45,
  "rainfall": 0,
  "windSpeed": 12,
  "weatherCondition": "SUNNY",
  "productId": 5,
  "category": "COLD_DRINK",
  "productName": "Ice Cream"
}
```

## Notes importantes

- Les métriques R²/MAE sont calculées **sur les mêmes données que
  l'entraînement** (pas de vrai jeu de test séparé) — avec aussi peu de
  données pour l'instant, un split train/test ne laisserait presque rien
  pour valider. À traiter comme un indicateur de "qualité d'ajustement",
  pas de généralisation réelle. Ça s'améliorera avec plus d'historique.
- Les modèles entraînés (`models/*.pkl`) et leurs métadonnées ne sont pas
  versionnés dans Git (voir `.gitignore`) — ils sont régénérés à chaque
  appel de `/train`.