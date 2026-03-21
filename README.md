# 🚀 Online Pad (Modernized)

A professional, real-time collaborative text editor built with a serverless architecture and Material Design 3.

## 🛠 Tech Stack
- **Frontend**: React 18+ (TypeScript), Vite 6
- **Architecture**: Feature-based Modular Design (SOLID)
- **State Management**: TanStack Query (React Query)
- **Backend/DB**: Firebase Cloud Firestore
- **UI Framework**: Material UI (MUI) 7 with MD3 Customization
- **Icons**: Lucide React

## 🏗 Architecture
The repository follows a **Feature-based structure** to ensure scalability and maintainability:
- `src/app`: Root providers and core App configuration.
- `src/features`: Domain-specific modules (Landing, Editor).
- `src/services`: External API abstractions.
- `src/theme`: MD3 design tokens and component overrides.

## 🚀 Performance
- **Code Splitting**: Features are lazy-loaded via `React.lazy` to minimize initial bundle size.
- **Vite 6**: Leveraging the latest bundling engine for near-instant HMR.
- **Debounced Persistence**: Optimised Firestore writes to ensure efficiency.

## 📦 Setup & Installation
1. Clone the repository.
2. Create a `.env` file in the root and add your Firebase configurations (see `.env.example`).
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

## 🔒 Security
- Configuration is managed via Environment Variables.
- No hardcoded secrets in the source code.

## 🚀 Deployment
This application is correctly configured to deploy to **GitHub Pages**.

### Automatic Deployment (GitHub Actions)
We've included a deploy workflow in `.github/workflows/deploy.yml`. 
1. Push your code to a GitHub Repository.
2. In your repository settings, navigate to **Pages** -> **Build and deployment** -> **Source** and select **GitHub Actions**.
3. Any push to `main` or `master` will trigger the workflow to build the React application and deploy it completely free to GitHub Pages!

### Manual Deployment
If you aren't using Actions, you can build manually by running:
```bash
npm run build
```
This will compile a static `dist` folder, which can be easily published using the `gh-pages` npm dependency or dragged/dropped onto any static hosting platform.
