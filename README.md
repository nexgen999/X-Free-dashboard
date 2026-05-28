# 📱 X-Free Dashboard

**X-Free Dashboard** est une application web haute fidélité, développée sur une architecture **Local-First / PWA**, conçue spécifiquement pour planifier, rédiger et optimiser l'utilisation de comptes **X (Twitter) non-payants** soumis à de fortes restrictions de quota d'API.

L'application contourne l'API Payante de X en utilisant intelligemment les intentions natives de liens (**X Web Intents**) officielles et sécurisées. Elle permet d'organiser ses brouillons, de planifier son calendrier de publication et de surveiller ses limites quotidiennes de façon **100% stable, gratuite et sans collecter d'informations personnelles**.

---

## 🌟 Fonctionnalités Principales

### 1. Ergonomie Mobile & Bureau Hybride
- **Sur PC / Tablette** (Écrans larges) : Layout stable fixé en deux zones. Sidebar latérale de navigation de 250px toujours visible avec aperçu de profil personnalisé (Avatar, Nom, @Handle).
- **Sur Mobile Android / iOS** : L'interface se transforme en s'adaptant à l'ergonomie mobile : barres d'onglets inférieures, tiroir réactif (Hamburger drawer) accessible d'un geste pour le profil, et zones de clic adaptées à l'usage tactile (min. `44px`).

### 2. Compositeur Avancé d'un Rendu Fidèle
- **Simulateur Temps Réel (WYSIWYG)** : Éditeur visuel reproduisant fidèlement le design officiel de X (mode clair et sombre "Twitter Black").
- **Compteur de Caractères Intelligent** : Détecte dynamiquement la limite de 280 caractères, évalue la taille des liens et signale visuellement tout dépassement.
- **Support des Médias et Émojis** : Système d'intégration d'images (format Base64 persistant localement) ou d'émojis intégrés.
- **Gestionnaire d'Intentions** : Bouton d'action directe qui pré-remplit instantanément le post préparé sur l'application officielle de X (Desktop/Mobile).

### 3. Gestionnaire Complet de Brouillons & Modèles d'Engagement
- **Brouillons multiples** : Filtrez, effectuez des recherches instantanées, éditez à la volée, clonez ou supprimez vos publications en attente.
- **Hub de Modèles / Blueprints** :
  - **Prédéfinis (Officiels)** : Modèles pré-conceptuels étudiés pour maximiser l'engagement (Threads/Fils d'actualités, Annonces de produits, Citations inspirantes, Événements de direct, Q&A interactifs) traduits automatiquement en français et anglais.
  - **Modèles personnalisés** : Créez vos propres structures réutilisables d'un simple clic pour économiser un temps précieux.

### 4. Calendrier de Publication Intelligent (Shadow Calendar)
- Planifiez visuellement vos parutions. L'application calcule les horaires de fort trafic et vous aide à équilibrer votre distribution hebdomadaire.
- Puisque l'API de base n'autorise pas la publication automatique, l'application agit comme un **rappel/assistant** de publication avec des simulations d'alertes locales en arrière-plan.

### 5. Compteurs de Limites Quotidiennes Gratuités (Safe Limits)
- Suivez vos actions quotidiennes (limite de 50 posts libres et 200 reposts par jour).
- **Barre d'alignement manuel** : Loggez d'un clic les actions effectuées en dehors du dashboard pour rester à l'abri d'un shadowban.
- **Score d'Optimisation Dynamique** : Calcule en temps réel l'état sanitaire de votre compte selon la fréquence de parution et le respect des limitations.

### 6. Architecture 100% Local-First & P2P Local Sync (WebRTC)
- **Zéro Base de Données Cloud** : Toutes les données sont préservées localement (IndexedDB avec fallbacks d'états sécurisés). Aucun serveur central ne stocke vos informations.
- **Synchronisation LAN Hors-Ligne** : Partagez instantanément vos brouillons et compteurs de limites entre votre PC et votre Android en connectant simplement les deux appareils sur le même routeur Wi-Fi, via un tunnel P2P direct WebRTC sécurisé à l'aide d'un code PIN à 6 chiffres.

### 7. Personnalisation Avancée
- **Twitter Light, Twitter Black, Slate Sky, & Mystic Night** : Thèmes de couleurs intégrales personnalisables.
- **Sélecteur de Polices** : Choisissez votre esthétique typographique (Inter, Space Grotesk, JetBrains Mono).
- **Bilinguisme Complet** : Traduction dynamique et fluide de l'application en **Français** (`FR`) et **Anglais** (`EN`) via l'onglet Paramètres.

---

## 📦 PWA : Comment installer l'application sur Mobile Android et PC ?

L'application inclut une configuration **PWA complète (Web App Manifest + Service Worker)**.

### Sur PC (Windows / macOS / Linux)
1. **Depuis votre serveur de déploiement** (ou localement en lançant l'application) : ouvrez Google Chrome, Edge ou Brave.
2. Regardez dans le coin droit de la barre d'adresse de votre navigateur : une icône représentant **un ordinateur avec une flèche de téléchargement** (Installer) apparaîtra.
3. Cliquez dessus et l'application s'installera sur votre ordinateur sous forme d'application de bureau indépendante avec son icône raccourci sur le bureau.

### Sur Mobile Android (via Google Chrome ou Firefox)
1. Ouvrez votre navigateur internet de prédilection et naviguez sur l'adresse hébergée.
2. Une bannière apparaîtra en bas de page : **"Ajouter X-Free Dashboard à l'écran d'accueil"**.
3. *Alternative* : Cliquez sur les trois petits points verticaux en haut à droite du navigateur, puis sélectionnez **"Installer l'application"** (ou "Ajouter à l'écran d'accueil").
4. L'application se comporte alors comme une app native : pas de barre d'adresse, fluidité optimisée à 60 FPS, stockage sécurisé persistant, et pleine autonomie d'affichage.

---

## 🛠️ Utilisation de l'Archive de Compilation Portable `Ready.To.Use`

À la racine de ce dépôt, vous trouverez le dossier spécial **/Ready.To.Use**. 
Ce dossier contient la build statique optimisée, prête à l'emploi.

### Pour l'utiliser instantanément :
Vous pouvez **zipper** ce dossier et l'envoyer sur :
1. N'importe quel hébergeur statique gratuit en 2 clics (Vercel, Netlify, Cloudflare Pages, GitHub Pages).
2. Un serveur local Web (ou application de réseau local).
3. Une WebView Android (pour empaqueter l'application dans un fichier `.apk` natif).

*Note sur le lancement d'un fichier `index.html` en local* : Pour que le Service Worker (PWA) et les imports asynchrones modernes fonctionnent, l'index de Ready.To.Use doit être servi à l'adresse sécurisée `https://` ou via un serveur local `http://localhost`. Si vous double-cliquez directement sur `index.html` via l'explorateur de fichiers (`file://`), le navigateur restreindra les modules pour des raisons de CORS. Exécutez simplement un serveur local miniature (par exemple, `npx serve Ready.To.Use` ou Python `python -m http.server`).

---

## 🚀 Lancer l'environnement de développement sur PC

Si vous souhaitez modifier le code source ou lancer le serveur de développement :

### Prérequis
- [Node.js](https://nodejs.org/) (version 18+ recommandée)
- npm (fourni avec Node.js)

### Étapes d'installation
1. **Extraire les sources** ou cloner le projet.
2. Ouvrez un terminal dans le dossier du projet et installez les dépendances :
   ```bash
   npm install
   ```
3. Lancez le serveur de développement :
   ```bash
   npm run dev
   ```
4. Ouvrez votre navigateur sur l'adresse locale affichée, par défaut :
   ```
   http://localhost:3000
   ```

### Commandes de Compilation utile :
- **Lancer le Linter** : `npm run lint`
- **Compiler une nouvelle version statique optimale** (qui mettra également à jour le dossier `/Ready.To.Use` automatiquement via notre script de synchronisation d'assets) :
  ```bash
  npm run build
  ```
