/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/firebaseAdmin.ts
import admin from 'firebase-admin';

const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId:process.env.FIREBASE_PROJECT_ID,
        clientEmail:process.env.FIREBASE_CLIENT_EMAIL,
        privateKey:privateKey
      })
    });
  } catch (error: any) {
    console.error("ERRO DETALHADO NA INICIALIZAÇÃO DO FIREBASE ADMIN:", error.message);
    throw new Error("Falha ao inicializar o Firebase Admin SDK.");
  }
}

const adminAuth = admin.auth();
const adminFirestore = admin.firestore();

export { adminAuth, adminFirestore };