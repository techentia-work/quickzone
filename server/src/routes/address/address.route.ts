import { Router } from "express";
import { addressController } from "../../controllers/index";
import { withAuth, validate } from "../../lib/middlewares/index";
import { addressSchema } from "../../lib/schema/index";

export const addressRouter = Router();

// CRUD Operations
addressRouter.post("/", withAuth(false), validate(addressSchema.createAddressSchema), addressController.createAddress);
addressRouter.get("/", withAuth(false), addressController.getAllAddresses);
addressRouter.get("/default", withAuth(false), addressController.getDefaultAddress);
addressRouter.get("/type/:type", withAuth(false), addressController.getAddressesByType);
addressRouter.get("/:addressId", withAuth(false), addressController.getAddressById);
addressRouter.patch("/:addressId", withAuth(false), validate(addressSchema.updateAddressSchema), addressController.updateAddress);
addressRouter.patch("/:addressId/set-default", withAuth(false), addressController.setDefaultAddress);
addressRouter.delete("/:addressId", withAuth(false), addressController.deleteAddress);
addressRouter.delete("/:addressId/permanent", withAuth(false), addressController.permanentDeleteAddress);
addressRouter.post("/:addressId/restore", withAuth(false), addressController.restoreAddress);
