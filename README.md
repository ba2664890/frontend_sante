# CerviCare+ Frontend

Frontend React pour la plateforme de dépistage du cancer du col de l'utérus au Sénégal.

## Fonctionnalités

- 🏠 **Tableau de bord** avec statistiques en temps réel
- 👥 **Gestion des patientes** avec formulaires complets
- 📊 **Statistiques et rapports** avec visualisations interactives
- 🗺️ **Carte interactive** du Sénégal
- 🔔 **Système de notifications** et rappels automatiques
- 🔐 **Authentification** avec gestion des rôles
- 📱 **Design responsive** et moderne

## Prérequis

- Node.js (version 16 ou supérieure)
- npm ou yarn

## Installation

1. Cloner le repository
2. Installer les dépendances :
   ```bash
   npm install
   ```

3. Copier le fichier d'environnement :
   ```bash
   cp .env.example .env
   ```

4. Configurer les variables d'environnement dans `.env`

## Démarrage

### Mode développement
```bash
npm start
```

L'application sera accessible sur http://localhost:3000

### Mode production
```bash
npm run build
npm run serve
```

## Scripts disponibles

- `npm start` - Démarrer le serveur de développement
- `npm run build` - Construire l'application pour la production
- `npm test` - Lancer les tests
- `npm run lint` - Vérifier le code avec ESLint
- `npm run lint:fix` - Corriger automatiquement les erreurs ESLint
- `npm run format` - Formater le code avec Prettier

## Structure du projet

```
src/
├── components/          # Composants réutilisables
├── contexts/           # Contextes React
├── pages/              # Pages principales
├── services/           # Services API
├── types/              # Types TypeScript
├── utils/              # Utilitaires
└── App.tsx             # Composant principal
```

## Technologies utilisées

- **React 18** - Framework principal
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS
- **React Query** - Gestion des données serveur
- **React Router** - Routage
- **React Hook Form** - Gestion des formulaires
- **Recharts** - Visualisations de données
- **Leaflet** - Cartes interactives
- **Axios** - Client HTTP
- **React Hot Toast** - Notifications

## Identifiants de démonstration

- **Admin**: admin / admin123
- **Superviseur**: supervisor / supervisor123
- **Agent de santé**: agent / agent123

## Configuration

### Variables d'environnement

- `REACT_APP_API_URL` - URL de l'API backend
- `REACT_APP_ENV` - Environnement (development/production)
- `REACT_APP_VERSION` - Version de l'application
- `REACT_APP_MAP_TILE_URL` - URL des tuiles pour la carte

## Développement

### Ajouter une nouvelle page

1. Créer le composant dans `src/pages/`
2. Ajouter la route dans `src/App.tsx`
3. Ajouter le lien dans la sidebar si nécessaire

### Ajouter un nouveau service

1. Créer le fichier dans `src/services/`
2. Utiliser le client API configuré
3. Exporter le service pour l'utiliser dans les composants

### Styles

Les styles sont gérés avec Tailwind CSS. Les classes personnalisées sont définies dans `src/index.css`.

## Production

### Build optimisé

```bash
npm run build
```

Le build optimisé sera généré dans le dossier `build/`.

### Déploiement

L'application peut être déployée sur n'importe quel serveur web static ou service d'hébergement (Netlify, Vercel, etc.).

## Licence

Propriétaire - CerviCare+ 2024