import admin from "firebase-admin";
import path from "path";
import fs from "fs";
// CommonJS handles __filename and __dirname automatically
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const serviceAccountPath = path.join(
  process.cwd(),
  "config/firebase-admin.json"
);

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, "utf-8")
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin; // ✅ DEFAULT EXPORT
