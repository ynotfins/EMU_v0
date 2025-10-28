import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const cfg = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_WEB!,
};

const app = initializeApp(cfg);
const db = getFirestore(app);

// TODO: replace with your actual UID after you sign in once and copy it
const UID = process.env.EMU_SUPER_UID || "REPLACE_WITH_YOUR_UID";

(async () => {
  console.log("🔑 Seeding roles for UID:", UID);

  if (UID === "REPLACE_WITH_YOUR_UID") {
    console.error(
      "❌ Error: Please set EMU_SUPER_UID in .env.local or replace UID in script"
    );
    process.exit(1);
  }

  try {
    await setDoc(doc(db, "roles/supes", UID), {
      createdAt: new Date().toISOString(),
    });
    console.log("✅ Added to roles/supes");

    await setDoc(doc(db, "roles/admins", UID), {
      createdAt: new Date().toISOString(),
    });
    console.log("✅ Added to roles/admins");

    console.log("\n🎉 Roles seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding roles:", error);
    process.exit(1);
  }
})();
