# Changelog - X-Free Dashboard

All notable changes to the **X-Free Dashboard** project are logged here.

---

## [v1.2.1] - 2026-05-28
### Added
- **Clean Production Asset Naming**: Configured Vite with customized Rollup output structures to write asset files cleanly to `assets/index.js` and `assets/index.css` instead of using randomized long hashes inside `/Ready.To.Use` and `/dist` outputs.
- **Enhanced PWA Update Reload**: Automatic reloading on service worker updates (`controllerchange` and state listener) ensures client devices immediately synchronize when the application updates.

### Optimized
- **Theme Variables Engine**: Resolved specific issue where Twitter Dim and Twitter Black styling variables did not register perfectly under specific Android views or tablet settings, aligning Tailwind v4 selector overrides dynamically using structural `@variant dark (&:where(.dark, .dark *));`.

---

## [v1.2.0] - 2026-05-28
### Added
- **Complete Bilingual Framework (FR & EN)**: Dynamic application-wide localization and translation system.
- **Predefined Engagement Templates**: Multi-language (English and French) templates representing high-engagement structures (Threads, Product Releases, Quotes, Events, Engagement Questions) in `/src/components/TemplatesManager.tsx`.
- **Custom Color Accents**: Extended customizable color palettes for UI themes in settings.
- **Portability Pack (`/Ready.To.Use`)**: Fully static, portable PWA production build folder created at root with relative asset paths for effortless Web hosting or native WebView integration.

### Optimized
- **Robust Relative Asset Resolution**: Modified default Vite configurations to output code referencing absolute-safe relative base (`./`) structures.
- **Code Nesting & Layout Mismatches**: Cleaned up syntax nesting inside `QuickActionCounter` and translations engine profiles.

---

## [v1.1.0] - 2026-05-24
### Added
- **Professional Polish UI Theme**: Clean, responsive layout with modular spacing, charcoal grays, high-contrast typography, and dark-mode options styled dynamically.
- **Interactive Drafts Manager**: Search, categorizations, deletion, and directly loading templates onto the Composer active workspace.
- **Predefined Custom Templates**: Reusable layouts saved per client device.
- **Native Link Intents Bypass**: Removed premium account API prompts, moving the instructions warning box to an elegant, non-intrusive first-use modal.

### Optimized
- **API Defense Score**: Refined optimization formula inside limits trackers to better display shadowban risk percentages.

---

## [v1.0.0] - First Stable Release
### Added
- **Rich Ergonomics Double-Layout**: Fixing sidebars on desktop viewports and rendering convenient bottom ergonomic bars and drawers on compact screens.
- **Interactive Offline Databases**: Dual local persistence engines (IndexedDB/WebSQL fallback state) utilizing zero central data servers.
- **WebRTC Local Peer Synchronization**: Synchronizing drafts and activity limits directly over local Wi-Fi router networks using safe peer connections.
- **Visual Composer Workspace**: Real-time post visual simulator rendering exact layout and boundaries.
- **Native Service Worker**: Local assets offline caching, support for background processes, and installable PWA web manifests.
