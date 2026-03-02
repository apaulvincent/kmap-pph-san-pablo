# KMap PPH San Pablo

KMap is a modern web application designed for residents and visitors of **PHirst Park Homes (PPH) San Pablo**. It simplifies house navigation within the subdivision by providing an interactive map that locates specific houses using Block and Lot numbers.

![KMap Showcase](https://via.placeholder.com/800x450?text=KMap+PPH+San+Pablo+Showcase)

## 🌟 Key Features

- **Free Mapping Stack**: Powered by **Leaflet** and **OpenStreetMap** (No Google Maps API costs).
- **Subdivision Overlay**: The official site layout image is overlaid directly on the map for maximum clarity.
- **House Locator**: Search by Block and Lot number to find exact coordinates.
- **Dynamic Routing**: Automatic distance and walking time calculation from your current GPS position or a manual starting point.
- **Firebase Auth**: Integrated Google OAuth via Firebase for future "Saved Locations" features.
- **Premium UI**: Sleek glassmorphism design with a mobile-responsive sidebar.

## 🛠️ Technology Stack

- **Framework**: React 18 + Vite + TypeScript
- **UI Library**: Material UI (MUI)
- **Maps**: Leaflet & React-Leaflet
- **Auth**: Firebase Authentication (Google OAuth)
- **Icons**: Lucide React
- **Typography**: Outfit (Google Fonts)

## 🚀 Deployment (Push to Production)

This project is optimized for deployment to **Firebase Hosting** or **Vercel**.

### Prerequisites
1. Create a **Firebase Project** in the [Firebase Console](https://console.firebase.google.com/).
2. Enable **Google Auth** in the Authentication section.
3. Add a **Web App** to your project to get your keys.

### 1. Configure Environment Variables
Create a `.env` file in the root directory (based on `.env` template):
```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 2. Build for Production
```bash
npm run build
```

### 3. Deploy
#### Option A: Firebase Hosting (Recommended)
```bash
# Install firebase tools if you haven't
npm install -g firebase-tools

# Login and initialize
firebase login
firebase init hosting

# Deploy!
firebase deploy
```

#### Option B: Vercel / Netlify
Simply connect your GitHub repository to **Vercel** or **Netlify**. They will automatically detect the Vite build settings and environment variables.

## 📍 Local Development

1. **Clone the repo**:
   ```bash
   git clone https://github.com/apaulvincent/kmap-pph-san-pablo.git
   ```
2. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```
3. **Run dev**:
   ```bash
   npm run dev
   ```

---
Developed with ❤️ by Antigravity.
