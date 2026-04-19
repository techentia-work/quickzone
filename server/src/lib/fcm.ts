import admin from "./firebase";
import { MulticastMessage } from "firebase-admin/messaging";

export const sendPushNotification = async (
  tokens: string[],
  title: string,
  body: string,
  data: Record<string, string> = {}
) => {
  const message: MulticastMessage = {
    tokens,

    // 🔴 THIS IS REQUIRED
    notification: {
      title,
      body,
    },

    data,

    android: {
      priority: "high",
    },

    apns: {
      payload: {
        aps: {
          alert: {
            title,
            body,
          },
          sound: "default",
        },
      },
    },
  };

  await admin.messaging().sendEachForMulticast(message);
};
