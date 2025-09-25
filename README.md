# 🎮 GameTrackr

**GameTrackr** est une application web moderne développée avec Angular 20 pour suivre et gérer votre collection de jeux vidéo. Gardez une trace de vos jeux préférés, notez-les, et organisez votre bibliothèque ludique !

## ✨ Fonctionnalités

### 🔐 Authentification
- **Inscription/Connexion** utilisateur avec validation
- **Gestion de profil** utilisateur
- **Suppression de compte** avec nettoyage automatique des données
- **Système d'autorisation** (utilisateur/admin)

### 🎯 Gestion des Jeux
- **Bibliothèque de jeux** pré-remplie avec des titres populaires
- **Notation des jeux** (système de notes personnalisées)
- **Suivi du statut** : À jouer, En cours, Terminé, Liste de souhaits, Abandonné
- **Données personnalisées** par utilisateur
- **Persistance des données** avec localStorage

### 🛠️ Fonctionnalités Techniques
- **Pipes personnalisés** :
  - `TimeSincePipe` : Affichage de dates relatives ("il y a 2 jours")
  - `GameStatusPipe` : Affichage du statut des jeux avec emojis
- **Directives personnalisées** :
  - `HighlightDirective` : Effets de survol personnalisables
- **Système réactif** avec Angular Signals et Effects
- **Intercepteur HTTP** pour l'authentification automatique
- **Architecture modulaire** avec feature modules

## 🚀 Installation

### Prérequis
- **Node.js** (version 18+)
- **npm** ou **yarn**
- **Angular CLI** (`npm install -g @angular/cli`)

### Installation des dépendances
```bash
git clone https://github.com/Jordy-6/GameTrackr.git
cd GameTrackr
npm install
```

## 🏃‍♂️ Démarrage

### Serveur de développement
```bash
npm start
# ou
ng serve
```
L'application sera accessible sur `http://localhost:4200`

### Build de production
```bash
npm run build
# ou
ng build
```

### Tests
```bash
npm test
# ou
ng test
```

### Linting
```bash
npm run lint          # Vérification du code
npm run lint:fix      # Correction automatique
```

### Formatage du code
```bash
npm run format        # Formatage avec Prettier
npm run format:check  # Vérification du formatage
```

## 📁 Structure du Projet

```
src/
├── app/
│   ├── core/                    # Services et intercepteurs globaux
│   │   └── interceptors/
│   │       └── auth.ts          # Intercepteur d'authentification
│   ├── features/                # Modules fonctionnels
│   │   ├── auth/                # Module d'authentification
│   │   │   ├── model/
│   │   │   └── services/
│   │   ├── game/                # Module de gestion des jeux
│   │   │   ├── model/
│   │   │   └── services/
│   │   └── user/                # Module utilisateur
│   │       └── model/
│   ├── shared/                  # Composants, pipes et directives partagés
│   │   ├── pipes/
│   │   │   ├── time-since.pipe.ts
│   │   │   └── game-status.pipe.ts
│   │   └── directives/
│   │       └── highlight.directive.ts
│   ├── app.component.ts         # Composant racine
│   ├── app.config.ts            # Configuration de l'application
│   └── app.routes.ts            # Configuration des routes
└── assets/                      # Ressources statiques
```

## 🎮 Jeux Disponibles

La bibliothèque inclut des titres populaires :
- The Legend of Zelda: Breath of the Wild
- Cyberpunk 2077
- Red Dead Redemption 2
- Hollow Knight
- Elden Ring
- God of War
- The Witcher 3: Wild Hunt
- Super Mario Odyssey
- Hades
- Ghost of Tsushima

## 🔧 Technologies Utilisées

### Frontend
- **Angular 20** - Framework principal
- **TypeScript** - Langage de programmation
- **TailwindCSS** - Framework CSS
- **RxJS** - Programmation réactive

### Outils de Développement
- **ESLint** - Linting du code
- **Prettier** - Formatage du code
- **Husky** - Hooks Git
- **Lint-staged** - Linting sur les fichiers stagés
- **Karma & Jasmine** - Tests unitaires

### Fonctionnalités Angular
- **Standalone Components** - Architecture moderne
- **Signals & Effects** - Gestion d'état réactive
- **Reactive Forms** - Formulaires réactifs
- **HTTP Interceptors** - Gestion des requêtes HTTP
- **Custom Pipes & Directives** - Composants réutilisables

## 📊 Données Utilisateur

Les données sont stockées localement dans le navigateur via `localStorage` :
- **Utilisateurs** : Profils et authentification
- **Données de jeux** : Notes, statuts et préférences par utilisateur
- **Synchronisation automatique** avec Angular Effects

## 🛡️ Sécurité

- **Validation des formulaires** côté client
- **Authentification par token** JWT simulé
- **Intercepteur HTTP** pour l'authentification automatique
- **Gestion des erreurs** 401/403
- **Nettoyage automatique** des données lors de la suppression d'utilisateur


## 📝 Scripts Disponibles

| Script | Description |
|--------|-------------|
| `npm start` | Démarre le serveur de développement |
| `npm run build` | Build de production |
| `npm test` | Lance les tests unitaires |
| `npm run lint` | Vérifie la qualité du code |
| `npm run lint:fix` | Corrige automatiquement les erreurs de linting |
| `npm run format` | Formate le code avec Prettier |
| `npm run format:check` | Vérifie le formatage du code |

## 🎯 Roadmap

- [ ] Intégration avec une API backend
- [ ] Système de recommandations
- [ ] Import/Export de données
- [ ] Mode sombre
- [ ] Support mobile amélioré
- [ ] Système de tags personnalisés
- [ ] Partage de listes de jeux

## 👤 Auteur

**Jordy-6**
- GitHub: [@Jordy-6](https://github.com/Jordy-6)

---

⭐ N'hésitez pas à donner une étoile si ce projet vous plaît !
