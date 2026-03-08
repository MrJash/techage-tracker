# TechAge Tracker

A minimalistic app to track your electronic devices and gadgets — log purchase dates, calculate product age, attach receipts, and sync everything across devices with your Google account.

## Features

- **Product tracking** — Add electronics with purchase date, price, category, condition, and receipt images
- **Age calculation** — Automatically calculates how old each product is
- **Collections** — Organize products into custom collections (e.g. "Home", "Work")
- **Cloud sync** — Sign in with Google to sync your data across devices via Firebase
- **Offline first** — Works fully without an account; data is stored locally in the browser
- **Import / Export** — Back up and restore your data as JSON
- **Drag & drop** — Reorder products and collections by dragging
- **Dark / light mode** — Theme toggle with animated switcher

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4**
- **shadcn/ui** + **Radix UI** primitives
- **Firebase** — Google Authentication + Cloud Firestore
- **Lucide React** — icons

## Getting Started

### Prerequisites

- Node.js 18+
- A Firebase project (for cloud sync — optional)

### Installation

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> Cloud sync is optional. The app works fully offline without any Firebase config.

### Run

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Firebase Setup (Optional)

To enable Google sign-in and cross-device sync:

1. Create a project in the [Firebase Console](https://console.firebase.google.com/)
2. Enable **Google** as a sign-in provider under Authentication
3. Create a **Firestore Database** and set the following security rules:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

4. Register a web app and copy the config values into `.env.local`
