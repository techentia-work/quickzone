import { Router } from "express";
import mongoose from "mongoose";
import { withAuth } from "../../lib/middlewares/index";
import { qcNotificationController } from "../../controllers/notification/notification.controller";

export const qcNotificationRouter = Router();

qcNotificationRouter.patch(
  "/mark-all-read",
  withAuth(false),
  qcNotificationController.markAllRead
);

qcNotificationRouter.delete(
  "/cleanup/old",
  withAuth(true),
  qcNotificationController.deleteOld
);

qcNotificationRouter.post("/bulk", withAuth(true), async (req, res, next) => {
  const notifications = req.body;

  if (!Array.isArray(notifications) || notifications.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No notifications provided",
    });
  }

  const createdNotifications: any[] = [];
  const session = await mongoose.startSession();
  const startTime = new Date();

  try {
    await session.withTransaction(async () => {
      for (const notif of notifications) {
        const {
          user,
          vendor,
          driver,
          isForAdmin,
          title,
          body,
          type,
          order,
          meta,
        } = notif;

        if (!title || !body)
          throw new Error("Each notification must have a title and body");

        const newNotification = await mongoose.model("QCNotification").create(
          [
            {
              user,
              vendor,
              driver,
              isForAdmin,
              title,
              body,
              type,
              order,
              meta: meta || {},
            },
          ],
          { session }
        );

        createdNotifications.push(newNotification[0]);
      }
    });

    const endTime = new Date();
    console.log(
      `Bulk notification creation completed in ${
        (endTime.getTime() - startTime.getTime()) / 1000
      }s`
    );

    return res.status(201).json({
      success: true,
      message: "Notifications created successfully",
      data: createdNotifications,
    });
  } catch (err) {
    next(err);
  } finally {
    session.endSession();
  }
});

qcNotificationRouter.post("/", withAuth(true), qcNotificationController.create);
qcNotificationRouter.get("/", withAuth(false), qcNotificationController.getAll);
qcNotificationRouter.get("/:id", withAuth(false), qcNotificationController.getById);
qcNotificationRouter.put("/:id", withAuth(true), qcNotificationController.update);
qcNotificationRouter.patch("/:id/read", withAuth(true), qcNotificationController.markAsRead);
qcNotificationRouter.patch("/:id/unread", withAuth(false), qcNotificationController.markAsUnread);
qcNotificationRouter.delete("/:id", withAuth(true), qcNotificationController.delete);

export default qcNotificationRouter;
