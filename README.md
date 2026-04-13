# 📍 Nearby - Proximity Social Discovery

**Nearby** is a modern, proximity-based social discovery application built natively with Expo. It re-imagines how we connect with people around us by letting users securely discover, approach, and communicate with other active users within a live 100-meter radar radius.

Whether catching someone reading your favorite book at a cafe or looking to network at an event, Nearby gives you a context-aware icebreaker by allowing you to send temporary, distance-verified "Approach Requests."

---

## ✨ Core Features

*   **100m Radar Map:** A live, dynamic map plotting your location alongside other visible users exclusively within a ~100m vicinity.
*   **Invisible / Ghost Mode:** Full control over your privacy. Seamlessly toggle on/off your visibility on the map with a sleek HUD overlay.
*   **Approach Requests:** Tap a user's pin on the map to send an introductory note.
*   **Request Management Hub:** A dedicated tab to securely review, accept, or decline incoming Approach Requests.
*   **Profile Customization:** Fully syncs with Clerk authentication, letting you tweak your display name and view secure user data.
*   **Simulate Environment:** Built-in dev tools (`+` button) to generate mock users actively around your coordinates for rapid UX testing.

---

## 🛠️ Technology Stack

*   **Framework:** React Native / [Expo](https://expo.dev/) (SDK 50+)
*   **Routing & Backend:** [Expo Router API Routes](https://docs.expo.dev/router/reference/api-routes/) (v3) executing serverlessly on edge.
*   **Styling:** [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native).
*   **Database:** [Neon Serverless PostgreSQL](https://neon.tech/) using direct edge connections.
*   **Authentication:** [Clerk Expo](https://clerk.com/docs/quickstarts/expo) (OAuth, Email Verification, Session Management).
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand) (Client-side localized stores).
*   **Maps:** `react-native-maps` rendering Apple Maps (iOS) and Google Maps (Android).

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js installed, along with either the **iOS Simulator** (Xcode) or **Android Emulator** (Android Studio). 

### Environment Setup
1. Clone this repository.
2. Ensure you have the `.env.local` file configured in your project root with your valid API keys:
   ```env
   EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
   DATABASE_URL=your_postgresql_neon_url
   ...
   ```

### Installation
Run the following commands to install dependencies and start the local development server:

```bash
# Install NPM dependencies
npm install

# Start the Expo Bundler in development mode
npx expo start -c
```

Once Metro is running, press **`i`** to open the iOS Simulator or **`a`** to open the Android Emulator.

---

## 🗺️ Project Structure

```text
├── app/
│   ├── (api)/              # Backend: Serverless API endpoints (nearby, requests, mock generation)
│   ├── (auth)/             # Frontend: Clerk authentication flows (sign-in, sign-up)
│   ├── (root)/             # Frontend: Main secured application stack
│   │   └── (tabs)/         # Bottom navigation (Home Map, Requests, Chat, Profile)
│   └── index.tsx           # Global routing entry point
├── components/             # Reusable UI components (Map, InputField, CustomButton)
├── lib/                    # Core utilities (API fetcher wrappers)
├── store/                  # Zustand global state (LocationStore, NearbyStore)
└── types/                  # Global Typescript interfaces
```

---

## 🔄 How the Map works in Development
When developing on a simulator, you must ensure a **Custom Location** is injected into your emulator (e.g., in iOS Simulator `Features > Location > Custom Location`), otherwise, the initial `expo-location` request may stall. 

Since you won't naturally have other database users standing next to you during development, **simply tap the `+` icon on the Home page** HUD to securely inject a simulated profile directly into your Neon DB exactly 50 meters away!

---

## 📝 License
Built and reconfigured locally. All rights reserved.
# Nearby
