import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Safely initialize Firebase App
let app;
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (err) {
    console.warn("Firebase app initialization failed, using placeholder app config:", err);
    app = initializeApp({
      apiKey: firebaseConfig.apiKey || "placeholder-api-key",
      authDomain: `${firebaseConfig.projectId || "awesome-music-zrwfn"}.firebaseapp.com`,
      projectId: firebaseConfig.projectId || "awesome-music-zrwfn"
    });
  }
} else {
  app = getApp();
}

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

// --- High-Integrity Diagnostic Error Handler (Required by Firebase Skill) ---
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write"
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || "anonymous_local_user",
      email: auth.currentUser?.email || "anonymous@local.com",
      emailVerified: auth.currentUser?.emailVerified || false,
      isAnonymous: auth.currentUser?.isAnonymous || false,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error("Firestore Permission/Policy Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Check if Firebase is running on placeholder configs
export function isUsingPlaceholderConfig(): boolean {
  return !firebaseConfig.apiKey || firebaseConfig.apiKey.includes("placeholder") || firebaseConfig.projectId.includes("placeholder");
}
