import mongoose from "mongoose";
import { AppError } from "../../lib/types/index";
import {
  DeliveryBoyModelType,
  DeliveryBoyStatus,
  IDeliveryBoyDocument,
} from "../../lib/types/deliveryboy/deliveryBoy.types";

export const deliveryBoyUtils = {
  statics: {
    async generateDeliveryBoyCode(this: DeliveryBoyModelType): Promise<string> {
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const day = date.getDate().toString().padStart(2, "0");

      const prefix = `DBY${year}${month}${day}`;
      const lastBoy = await this.findOne({
        deliveryCode: new RegExp(`^${prefix}`),
      })
        .sort({ deliveryCode: -1 })
        .lean();

      let sequence = 1;
      if (lastBoy && lastBoy.deliveryCode) {
        const lastSeq = parseInt(lastBoy.deliveryCode.slice(-4));
        if (!isNaN(lastSeq)) sequence = lastSeq + 1;
      }

      return `${prefix}${sequence.toString().padStart(4, "0")}`;
    },
  },
};
