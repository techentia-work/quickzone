// lib/otp.ts
import { firestore } from "firebase-admin";

const firebaseDb = firestore();

export const saveOTP = async (identifier: string, otp: string, type: "email" | "phone") => {
    const docRef = firebaseDb.collection("otps").doc(identifier);
    await docRef.set({
        otp,
        type,
        createdAt: firestore.FieldValue.serverTimestamp(),
        expiresAt: firestore.Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000)), // 5 min
    });
};

export const verifyOTP = async (identifier: string, otp: string) => {
    const docRef = firebaseDb.collection("otps").doc(identifier);
    const doc = await docRef.get();
    if (!doc.exists) return false;

    const data = doc.data();
    const now = new Date();
    if (data?.otp === otp && data.expiresAt.toDate() > now) {
        await docRef.delete();
        return true;
    }
    return false;
};
