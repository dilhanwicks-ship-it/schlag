// ─────────────────────────────────────────────────────────────
// Firebase configuration (Realtime Database)
// Safe to commit — Firebase web config is not a secret; access is
// controlled by the Realtime Database security rules.
// ─────────────────────────────────────────────────────────────
const FIREBASE_CONFIG = {
  databaseURL: "https://schlag-e83bb-default-rtdb.firebaseio.com",
  projectId: "schlag-e83bb",
  authDomain: "schlag-e83bb.firebaseapp.com"
};

firebase.initializeApp(FIREBASE_CONFIG);
