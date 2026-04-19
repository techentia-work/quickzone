import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { AppError, AuthRequest } from "../../lib/types/index";
import QCNotification from "../../models/notifications/notifications.model";
import { getIO } from "../../lib/config/socket/socket";

export const qcNotificationController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
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
      } = req.body;

      if (!title || !body)
        throw new AppError("Title and body are required", 400);

      const notification = await QCNotification.create({
        user,
        vendor,
        driver,
        isForAdmin,
        title,
        body,
        type,
        order,
        meta: meta || {},
      });

      // ✅ Emit WebSocket event if available
      const io = getIO();
      if (io) {
        // emit to specific room(s)
        if (user) io.to(`user:${user}`).emit("notification:new", notification);
        if (vendor)
          io.to(`vendor:${vendor}`).emit("notification:new", notification);
        if (driver)
          io.to(`driver:${driver}`).emit("notification:new", notification);
        if (isForAdmin) io.to("admin").emit("notification:new", notification);
      }

      res.status(201).json({
        success: true,
        message: "Notification created successfully",
        data: notification,
      });
    } catch (err) {
      next(err);
    }
  },

  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { role } = req.query;
      const id = req.user?._id;

      if (!role)
        throw new AppError(
          "Role query param (user/vendor/driver/admin) required",
          400
        );

      let query: any = {};
      switch (role) {
        case "user":
          query.user = id;
          break;
        case "vendor":
          query.vendor = id;
          break;
        case "driver":
          query.driver = id;
          break;
        case "admin":
          query.isForAdmin = true;
          break;
        default:
          throw new AppError("Invalid role specified", 400);
      }

      const notifications = await QCNotification.find(query).sort({
        createdAt: -1,
      });
      const unreadCount = await QCNotification.countDocuments({
        ...query,
        read: false,
      });
      res.status(200).json({
        success: true,
        message: "Notifications fetched successfully",
        data: { notifications, unreadCount },
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id as string))
        throw new AppError("Invalid notification ID", 400);

      console.log("Id", id);

      const notifications = await QCNotification.find({ user: id });
      if (!notifications) throw new AppError("No notifications found", 200);


      const unreadCount = await QCNotification.countDocuments({
        user: id,
        read: false,
      });

      res.status(200).json({
        success: true,
        data: { notifications, unreadCount },
      });
    } catch (err) {
      next(err);
    }
  },

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const notification = await QCNotification.findById(id);
      if (!notification) throw new AppError("Notification not found", 404);

      await notification.markAsRead();

      res.status(200).json({
        success: true,
        message: "Notification marked as read",
      });
    } catch (err) {
      next(err);
    }
  },

  async markAsUnread(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const notification = await QCNotification.findById(id);
      if (!notification) throw new AppError("Notification not found", 404);

      await notification.markAsUnread();

      res.status(200).json({
        success: true,
        message: "Notification marked as unread",
      });
    } catch (err) {
      next(err);
    }
  },

  async markAllRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { role } = req.query;
      const id = req.user?._id;

      if (!role)
        throw new AppError(
          "Role query param (user/vendor/driver/admin) required",
          400
        );

      switch (role) {
        case "admin":
          await QCNotification.markAllReadForAdmin();
          break;

        case "user":
        case "vendor":
        case "driver":
          if (!id || !mongoose.Types.ObjectId.isValid(id as string)) {
            throw new AppError(
              "Valid ID is required for user/vendor/driver",
              400
            );
          }

          if (role === "user")
            await QCNotification.markAllReadForUser(id as string);
          if (role === "vendor")
            await QCNotification.markAllReadForVendor(id as string);
          if (role === "driver")
            await QCNotification.markAllReadForDriver(id as string);
          break;

        default:
          throw new AppError("Invalid role specified", 400);
      }

      res.status(200).json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updated = await QCNotification.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
      });

      if (!updated) throw new AppError("Notification not found", 404);

      res.status(200).json({
        success: true,
        message: "Notification updated successfully",
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await QCNotification.findByIdAndDelete(id);
      if (!deleted) throw new AppError("Notification not found", 404);

      res.status(200).json({
        success: true,
        message: "Notification deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  },

  async deleteOld(req: Request, res: Response, next: NextFunction) {
    try {
      const { daysOld = 30 } = req.query;
      const result = await QCNotification.deleteOld(Number(daysOld));

      res.status(200).json({
        success: true,
        message: `Deleted notifications older than ${daysOld} days`,
        deletedCount: result.deletedCount,
      });
    } catch (err) {
      next(err);
    }
  },
};
