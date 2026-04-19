import { Response } from "express";
import mongoose, { Types } from "mongoose";
import { Order, Cart, Product, PromoCode, Address, Wallet, Transaction } from "../../models/index";
import {
  AppError,
  AuthRequest,
  IOrderDocument,
  IOrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentGateway,
  TaxRateType
} from "../../lib/types/index";
import { gstRates } from "../../lib/consts/index";
import { helperServerUtils } from "../../lib/utils/index";
import { sendNotificationServerUtils } from "../../lib/notification/notification.server.utils";
import { razorpayUtils } from "../../lib/utils/razorpay/razorpay.utils";

export const orderController = {

  createOrder: async (req: AuthRequest, res: Response) => {
    const userId = new mongoose.Types.ObjectId(req.user?._id);
    const {
      shippingAddressId,
      billingAddressId,
      paymentMethod,
      walletAmount = 0, // Amount to use from wallet
      notes,
      useNewAddress,
      shippingAddress,
      billingAddress,
    } = req.body;

    // Validate payment method
    if (!Object.values(PaymentMethod).includes(paymentMethod)) {
      throw new AppError("Invalid payment method", 400);
    }

    let finalShippingAddress;
    let finalBillingAddress;

    // Handle shipping address
    if (useNewAddress && shippingAddress) {
      finalShippingAddress = shippingAddress;
    } else if (shippingAddressId) {
      const savedAddress = await Address.findOne({
        _id: shippingAddressId,
        userId,
        isActive: true,
      });

      if (!savedAddress) {
        throw new AppError("Shipping address not found", 404);
      }

      finalShippingAddress = Object.assign({}, savedAddress.toObject());
    } else {
      throw new AppError("Shipping address is required", 400);
    }

    // Handle billing address
    if (billingAddressId) {
      const savedBillingAddress = await Address.findOne({
        _id: billingAddressId,
        userId,
        isActive: true,
      });

      if (!savedBillingAddress) {
        throw new AppError("Billing address not found", 404);
      }

      finalBillingAddress = Object.assign({}, savedBillingAddress.toObject());
    } else if (billingAddress) {
      finalBillingAddress = billingAddress;
    } else {
      finalBillingAddress = finalShippingAddress;
    }

    // Get user cart
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      throw new AppError("Cart is empty", 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Prepare order items with full product details
      const orderItems: IOrderItem[] = [];

      for (const cartItem of cart.items) {
        const product = await Product.findById(cartItem.productId).session(session);

        if (!product) {
          throw new AppError(`Product not found`, 404);
        }

        if (!product.isActive || product.isDeleted) {
          throw new AppError(`Product ${product.name} is not available`, 400);
        }

        // Check COD availability for COD or hybrid COD payments
        if (
          (paymentMethod === PaymentMethod.COD || paymentMethod === PaymentMethod.WALLET_COD) &&
          !product.isCOD
        ) {
          throw new AppError(`COD is not available for ${product.name}`, 400);
        }

        const variant = product.variants.find((v) =>
          (v._id as Types.ObjectId).equals(cartItem.variantId)
        );

        if (!variant) {
          throw new AppError(`Variant not found for ${product.name}`, 404);
        }

        if (variant.status !== "AVAILABLE") {
          throw new AppError(`${product.name} variant is not available`, 400);
        }

        const discountedPrice =
          cartItem.discountPercent && cartItem.discountPercent > 0
            ? +(cartItem.price * (1 - cartItem.discountPercent / 100)).toFixed(2)
            : cartItem.price;

        const taxRate = gstRates[product.taxRate || TaxRateType.GST_5];
        const itemSubTotal = discountedPrice * cartItem.quantity;
        const itemTax = +(itemSubTotal * taxRate).toFixed(2);

        orderItems.push({
          productId: product._id as mongoose.Types.ObjectId,
          variantId: variant._id as mongoose.Types.ObjectId,
          productName: product.name,
          variantTitle: variant.title,
          sku: variant.sku,
          price: cartItem.price,
          quantity: cartItem.quantity,
          discountPercent: cartItem.discountPercent || 0,
          discountedPrice,
          taxRate: product.taxRate,
          tax: itemTax,
          totalPrice: +(itemSubTotal + itemTax).toFixed(2),
          image: variant.images?.[0] || product.mainImage,
        });
      }

      // Validate stock availability
      await Order.validateStockAvailability(orderItems);

      // Validate promo code if applied
      let promoDiscount = 0;
      if (cart.appliedPromo) {
        const promo = await PromoCode.findOne({
          code: cart.appliedPromo.code,
        }).session(session);

        if (promo && promo.isActive) {
          promo.validatePromoCode(cart.subTotal);

          const canApply = await PromoCode.canBeAppliedByUser(userId, promo.code);
          if (!canApply) {
            throw new AppError("Promo code usage limit exceeded", 400);
          }

          promoDiscount = cart.appliedPromo.discountAmount;

          // Increment promo used count
          promo.usedCount = (promo.usedCount || 0) + 1;
          await promo.save({ session });
        }
      }

      // Calculate final amount
      const totalAmount = +(
        cart.subTotal +
        cart.totalTax +
        cart.handlingCharge +
        cart.deliveryCharge -
        promoDiscount
      ).toFixed(2);

      if (totalAmount < 0) {
        throw new AppError("Invalid order amount", 400);
      }

      // Handle wallet payment
      let walletTotalUsed = 0;
      let onlinePaid = 0;
      let remainingCOD = 0;

      // Get or create user's wallet
      let userWallet = await Wallet.getOrCreateWallet((userId as mongoose.Types.ObjectId).toString(), "USER");

      if (walletAmount > 0) {
        const availableBalance = userWallet.balance + userWallet.promoCash;

        if (availableBalance < walletAmount) {
          throw new AppError("Insufficient wallet balance", 400);
        }

        // Validate wallet amount doesn't exceed total
        if (walletAmount > totalAmount) {
          throw new AppError("Wallet amount cannot exceed total amount", 400);
        }

        walletTotalUsed = walletAmount;
      }

      // Calculate payment distribution based on payment method
      let finalPaymentStatus = PaymentStatus.PENDING;
      let finalOrderStatus = OrderStatus.PENDING;
      let needsRazorpayOrder = false;

      switch (paymentMethod) {
        case PaymentMethod.WALLET:
          // Full wallet payment
          if (walletTotalUsed !== totalAmount) {
            throw new AppError("Wallet amount must equal total amount for wallet payment", 400);
          }
          finalPaymentStatus = PaymentStatus.PAID;
          finalOrderStatus = OrderStatus.CONFIRMED;
          break;

        case PaymentMethod.WALLET_ONLINE:
          // Partial wallet + online
          if (walletTotalUsed >= totalAmount) {
            throw new AppError("Use WALLET payment method for full wallet payment", 400);
          }
          if (walletTotalUsed === 0) {
            throw new AppError("Wallet amount must be greater than 0 for wallet+online payment", 400);
          }
          onlinePaid = +(totalAmount - walletTotalUsed).toFixed(2);
          needsRazorpayOrder = true;
          break;

        case PaymentMethod.WALLET_COD:
          // Partial wallet + COD
          if (walletTotalUsed >= totalAmount) {
            throw new AppError("Use WALLET payment method for full wallet payment", 400);
          }
          if (walletTotalUsed === 0) {
            throw new AppError("Wallet amount must be greater than 0 for wallet+COD payment", 400);
          }
          remainingCOD = +(totalAmount - walletTotalUsed).toFixed(2);
          finalPaymentStatus = PaymentStatus.PENDING;
          finalOrderStatus = OrderStatus.CONFIRMED; // COD orders are confirmed immediately
          break;

        case PaymentMethod.ONLINE:
          // Full online payment
          if (walletTotalUsed > 0) {
            throw new AppError("Cannot use wallet with ONLINE payment method. Use WALLET_ONLINE instead", 400);
          }
          onlinePaid = totalAmount;
          needsRazorpayOrder = true;
          break;

        case PaymentMethod.COD:
          // Full COD payment
          if (walletTotalUsed > 0) {
            throw new AppError("Cannot use wallet with COD payment method. Use WALLET_COD instead", 400);
          }
          remainingCOD = totalAmount;
          finalPaymentStatus = PaymentStatus.PENDING;
          finalOrderStatus = OrderStatus.CONFIRMED; // COD orders are confirmed immediately
          break;

        default:
          throw new AppError("Invalid payment method", 400);
      }

      // Generate order number
      const orderNumber = await Order.generateOrderNumber();

      // Create order
      const order = new Order({
        userId,
        orderNumber,
        items: orderItems,
        subTotal: cart.subTotal,
        totalTax: cart.totalTax,
        handlingCharge: cart.handlingCharge,
        deliveryCharge: cart.deliveryCharge,
        appliedPromo: cart.appliedPromo,
        totalAmount,
        walletTotalUsed,
        onlinePaid,
        remainingCOD,
        shippingAddress: finalShippingAddress,
        billingAddress: finalBillingAddress,
        paymentMethod,
        paymentGateway: needsRazorpayOrder ? PaymentGateway.RAZORPAY : undefined,
        paymentStatus: finalPaymentStatus,
        status: finalOrderStatus,
        notes,
        tracking: [
          {
            status: finalOrderStatus,
            timestamp: new Date(),
            comment: "Order placed successfully",
          },
        ],
      });

      // Set expected delivery date
      const now = new Date();
      const istOffset = 5.5 * 60;
      const expectedDate = new Date(
        now.getTime() + istOffset * 60 * 1000 + 24 * 60 * 60 * 1000 // 1 day
      );
      order.expectedDeliveryDate = expectedDate;

      await order.save({ session });

      // Deduct wallet balance if used
      if (walletTotalUsed > 0) {
        const { promoUsed, balanceUsed } = await userWallet.useWalletFunds(walletTotalUsed);
        await userWallet.save({ session });

        order.promoUsed = promoUsed;
        order.walletUsed = balanceUsed;

        // Record transaction
        await Transaction.recordTransaction(
          (userWallet._id as mongoose.Types.ObjectId).toString(),
          "DEBIT",
          "ORDER",
          walletTotalUsed,
          userWallet.balance,
          "SUCCESS",
          `Order payment - ${orderNumber}`,
          (order._id as any).toString(),
          {
            orderNumber,
            paymentMethod,
            totalAmount,
            promoUsed, balanceUsed,
            onlinePaid,
            remainingCOD,
          }
        );
      }

      // For COD and WALLET payments, reduce stock immediately
      if (paymentMethod === PaymentMethod.COD || paymentMethod === PaymentMethod.WALLET || paymentMethod === PaymentMethod.WALLET_COD) {
        await Order.reduceStock(orderItems, session);
        // Clear cart
        cart.items = [];
        cart.appliedPromo = undefined;
        await cart.save({ session });

        await sendNotificationServerUtils.notify("order_placed", {
          ...order.toObject(),
          user: req.user,
        });
      }

      await session.commitTransaction();

      // Populate order details
      await order.populate([
        { path: "userId", select: "name email phone" },
        { path: "items.productId", select: "name slug mainImage" },
      ]);

      res.status(201).json({
        success: true,
        message: "Order created successfully",
        data: {
          order,
          requiresPayment: needsRazorpayOrder,
          onlineAmount: onlinePaid,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  // Create Razorpay order
  createRazorpayOrder: async (req: AuthRequest, res: Response) => {
    const userId = new mongoose.Types.ObjectId(req.user?._id);
    const { orderId } = req.body;

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    // Validate order status
    if (order.status !== OrderStatus.PENDING) {
      throw new AppError("Order cannot be paid at this stage", 400);
    }

    // Validate payment method requires online payment
    if (
      order.paymentMethod !== PaymentMethod.ONLINE &&
      order.paymentMethod !== PaymentMethod.WALLET_ONLINE
    ) {
      throw new AppError("Order does not require online payment", 400);
    }

    // Check if online amount is valid
    if (order.onlinePaid <= 0) {
      throw new AppError("No online payment required for this order", 400);
    }

    // Check if Razorpay order already exists
    if (order.razorpayDetails?.razorpay_order_id) {
      const existingRazorpayOrder = await razorpayUtils.fetchOrder(
        order.razorpayDetails.razorpay_order_id
      );

      return res.json({
        success: true,
        message: "Razorpay order already exists",
        data: {
          razorpay_order_id: existingRazorpayOrder.id,
          amount: existingRazorpayOrder.amount,
          currency: existingRazorpayOrder.currency,
          orderId: order._id,
          orderNumber: order.orderNumber,
          key: process.env.RAZORPAY_KEY_ID,
        },
      });
    }

    // Create Razorpay order for online payment amount
    const razorpayOrder = await razorpayUtils.createOrder({
      amount: order.onlinePaid,
      currency: "INR",
      receipt: order.orderNumber,
      notes: {
        orderId: orderId.toString(),
        orderNumber: order.orderNumber,
        userId: userId.toString(),
        walletUsed: order.walletUsed.toString(),
        onlinePaid: order.onlinePaid.toString(),
      },
    });

    // Save Razorpay order ID
    order.razorpayDetails = {
      razorpay_order_id: razorpayOrder.id,
    };
    order.paymentGateway = PaymentGateway.RAZORPAY;
    await order.save();

    res.json({
      success: true,
      message: "Razorpay order created successfully",
      data: {
        razorpay_order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        orderId: order._id,
        orderNumber: order.orderNumber,
        key: process.env.RAZORPAY_KEY_ID,
      },
    });
  },

  // Verify Razorpay payment
  verifyRazorpayPayment: async (req: AuthRequest, res: Response) => {
    const userId = new mongoose.Types.ObjectId(req.user?._id);
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    // Verify signature first
    const isValid = razorpayUtils.verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    // -------------------------------------------------------
    // ❌ INVALID SIGNATURE — FAILED PAYMENT
    // -------------------------------------------------------
    if (!isValid) {
      const session = await mongoose.startSession();

      await session.withTransaction(async () => {
        order.paymentStatus = PaymentStatus.FAILED;
        order.status = OrderStatus.FAILED;
        await order.save({ session });

        if (order.walletUsed && order.walletUsed > 0) {
          const userWallet = await Wallet.findOne({
            ownerId: userId,
            ownerModel: "USER",
          }).session(session);

          if (userWallet) {
            await userWallet.credit(order.walletUsed);
            await userWallet.save({ session });

            await Transaction.recordTransaction(
              (userWallet._id as mongoose.Types.ObjectId).toString(),
              "CREDIT",
              "REFUND",
              order.walletUsed,
              userWallet.balance,
              "SUCCESS",
              `Payment failed refund - ${order.orderNumber}`,
              orderId,
              {
                orderNumber: order.orderNumber,
                reason: "Payment signature verification failed",
              }
            );
          }
        }
      });

      session.endSession(); // 💚 SAFE - ends AFTER transaction fully resolves

      throw new AppError("Invalid payment signature", 400);
    }

    // -------------------------------------------------------
    // ✅ VALID SIGNATURE — SUCCESS PAYMENT
    // -------------------------------------------------------

    const paymentDetails = await razorpayUtils.fetchPayment(razorpay_payment_id);

    const session = await mongoose.startSession();

    await session.withTransaction(async () => {

      // Update payment details
      order.razorpayDetails = {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      };

      order.paymentId = razorpay_payment_id;
      order.transactionId = paymentDetails.id;
      order.paymentStatus = PaymentStatus.PAID;
      order.status = OrderStatus.CONFIRMED;

      // Reduce stock atomically
      await Order.reduceStock(order.items, session);

      await order.save({ session });

      // Clear cart atomically
      const cart = await Cart.findOne({ userId }).session(session);
      if (cart) {
        cart.items = [];
        cart.appliedPromo = undefined;
        await cart.save({ session });
      }
    });

    session.endSession(); // 💚 SAFE — outside transaction

    // Now populate AFTER transaction
    await order.populate([
      { path: "userId", select: "name email phone" },
      { path: "items.productId", select: "name slug mainImage" },
    ]);

    // Notify user
    await sendNotificationServerUtils.notify("payment_success", {
      ...order.toObject(),
      user: req.user,
    });

    return res.json({
      success: true,
      message: "Payment verified successfully",
      data: { order },
    });
  },

  // Refund order with wallet handling
  refundOrder: async (req: AuthRequest, res: Response) => {
    const { orderId } = req.params;
    const { amount, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.paymentStatus === PaymentStatus.REFUNDED) {
      throw new AppError("Order is already refunded", 400);
    }

    if (order.paymentStatus !== PaymentStatus.PAID) {
      throw new AppError("Order payment is not completed", 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      let razorpayRefund = null;
      let razorpayRefundAmount = 0;

      // Refund Razorpay payment if exists
      if (order.razorpayDetails?.razorpay_payment_id && order.onlinePaid > 0) {
        const refundAmount = amount && amount <= order.onlinePaid ? amount : order.onlinePaid;
        razorpayRefundAmount = refundAmount;

        razorpayRefund = await razorpayUtils.createRefund(
          order.razorpayDetails.razorpay_payment_id,
          refundAmount,
          {
            orderId: orderId.toString(),
            orderNumber: order.orderNumber,
            reason,
          }
        );

        order.razorpayDetails.refund_id = razorpayRefund.id;
        order.razorpayDetails.refund_status = razorpayRefund.status;
      }

      // Refund wallet amount
      if (order.walletUsed > 0) {
        const userWallet = await Wallet.findOne({
          ownerId: order.userId,
          ownerModel: "USER"
        }).session(session);

        if (userWallet) {
          await userWallet.credit(order.walletUsed);
          await userWallet.save({ session });

          // Record refund transaction
          await Transaction.recordTransaction(
            ((userWallet._id as mongoose.Types.ObjectId).toString()).toString(),
            "CREDIT",
            "REFUND",
            order.walletUsed,
            userWallet.balance,
            "SUCCESS",
            `Order refund - ${order.orderNumber}${reason ? ` - ${reason}` : ""}`,
            orderId as string,
            {
              orderNumber: order.orderNumber,
              reason,
              razorpayRefundAmount,
              totalRefunded: order.walletUsed + razorpayRefundAmount,
            }
          );
        }
      }

      // Update order
      order.paymentStatus = PaymentStatus.REFUNDED;
      order.status = OrderStatus.REFUNDED;

      // Restore stock
      await Order.restoreStock(order.items, session);

      await order.save({ session });
      await session.commitTransaction();

      res.json({
        success: true,
        message: "Refund initiated successfully",
        data: {
          refundId: razorpayRefund?.id,
          razorpayAmount: razorpayRefund ? (razorpayRefund.amount ?? 0) / 100 : 0,
          walletAmount: order.walletUsed,
          totalRefunded: order.walletUsed + razorpayRefundAmount,
          status: razorpayRefund?.status,
          order,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  // Webhook handler
  razorpayWebhook: async (req: AuthRequest, res: Response) => {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const webhookSignature = req.headers["x-razorpay-signature"] as string;
    const webhookBody = JSON.stringify(req.body);

    const isValid = razorpayUtils.validateWebhookSignature(
      webhookBody,
      webhookSignature,
      webhookSecret
    );

    if (!isValid) {
      throw new AppError("Invalid webhook signature", 400);
    }

    const event = req.body;

    try {
      switch (event.event) {
        case "payment.captured":
          await handlePaymentCaptured(event.payload.payment.entity);
          break;

        case "payment.failed":
          await handlePaymentFailed(event.payload.payment.entity);
          break;

        case "refund.created":
          await handleRefundCreated(event.payload.refund.entity);
          break;

        case "refund.processed":
          await handleRefundProcessed(event.payload.refund.entity);
          break;

        default:
          console.log(`Unhandled webhook event: ${event.event}`);
      }

      res.json({ success: true, message: "Webhook processed" });
    } catch (error) {
      console.error("Webhook processing error:", error);
      throw error;
    }
  },

  // Get user orders
  getUserOrders: async (req: AuthRequest, res: Response) => {
    const userId = new mongoose.Types.ObjectId(req.user?._id);

    const { filter, pagination, sort } =
      helperServerUtils.buildQuery<IOrderDocument>(
        req.query,
        ["status", "paymentMethod", "createdAt"],
        "createdAt",
        ["notes"]
      );

    filter.userId = userId;

    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .populate("userId", "name email phone")
        .populate("items.productId", "name slug mainImage")
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      Order.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / pagination.limit);

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: { orders },
      pagination: {
        currentPage: pagination.page,
        totalPages,
        limit: pagination.limit,
        totalCount,
        hasNextPage: pagination.page < totalPages,
        hasPrevPage: pagination.page > 1,
      },
    });
  },

  getOrderById: async (req: AuthRequest, res: Response) => {
    const userId = new mongoose.Types.ObjectId(req.user?._id);
    const { orderId } = req.params;

    const order = await Order.findOne({ _id: orderId, userId })
      .populate("userId", "name email phone")
      .populate("items.productId", "name slug mainImage")
      .populate("assignedDeliveryBoy", "name phone");

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    res.json({
      success: true,
      message: "Order fetched successfully",
      data: { order },
    });
  },

  getOrderByNumber: async (req: AuthRequest, res: Response) => {
    const userId = new mongoose.Types.ObjectId(req.user?._id);
    const { orderNumber } = req.params;

    const order = await Order.findOne({ orderNumber, userId })
      .populate("userId", "name email phone")
      .populate("items.productId", "name slug mainImage");

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    res.json({
      success: true,
      message: "Order fetched successfully",
      data: { order },
    });
  },

  cancelOrder: async (req: AuthRequest, res: Response) => {
    const userId = new mongoose.Types.ObjectId(req.user?._id);
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status)) {
      throw new AppError("Order cannot be cancelled at this stage", 400);
    }

    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product && !product.isCancelable) {
        throw new AppError(`${item.productName} cannot be cancelled`, 400);
      }
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      await Order.restoreStock(order.items, session);

      order.status = OrderStatus.CANCELLED;
      order.cancellationReason = reason || "Cancelled by user";
      order.cancelledBy = userId;
      order.cancelledAt = new Date();

      // Refund wallet if used
      if (order.walletUsed > 0) {
        const userWallet = await Wallet.findOne({
          ownerId: userId,
          ownerModel: "USER"
        }).session(session);

        if (userWallet) {
          await userWallet.credit(order.walletUsed);
          await userWallet.save({ session });

          await Transaction.recordTransaction(
            (userWallet._id as mongoose.Types.ObjectId).toString(),
            "CREDIT",
            "REFUND",
            order.walletUsed,
            userWallet.balance,
            "SUCCESS",
            `Order cancellation refund - ${order.orderNumber}`,
            orderId as string,
            {
              orderNumber: order.orderNumber,
              reason: reason || "Cancelled by user",
            }
          );
        }
      }

      if (order.paymentStatus === PaymentStatus.PAID) {
        order.paymentStatus = PaymentStatus.REFUNDED;
      }

      await order.save({ session });
      await session.commitTransaction();

      res.json({
        success: true,
        message: "Order cancelled successfully",
        data: { order },
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },

  updateOrderStatus: async (req: AuthRequest, res: Response) => {
    const { orderId } = req.params;
    const { status, comment } = req.body;
    const adminId = new mongoose.Types.ObjectId(req.user?._id);

    if (!Object.values(OrderStatus).includes(status)) {
      throw new AppError("Invalid order status", 400);
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [
        OrderStatus.CONFIRMED,
        OrderStatus.CANCELLED,
        OrderStatus.FAILED,
      ],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [
        OrderStatus.OUT_FOR_DELIVERY,
        OrderStatus.DELIVERED,
      ],
      [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED, OrderStatus.RETURNED],
      [OrderStatus.RETURNED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
      [OrderStatus.FAILED]: [],
      [OrderStatus.ACCEPTED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.REJECTED]: [],
    };

    if (!validTransitions[order.status].includes(status)) {
      throw new AppError(
        `Cannot transition from ${order.status} to ${status}`,
        400
      );
    }

    order.status = status;

    if (status === OrderStatus.DELIVERED) {
      order.deliveredAt = new Date();
      order.paymentStatus = PaymentStatus.PAID;
    }

    order.tracking.push({
      status,
      timestamp: new Date(),
      comment,
      updatedBy: adminId,
    });

    await order.save();

    res.json({
      success: true,
      message: "Order status updated successfully",
      data: { order },
    });
  },

  updatePaymentStatus: async (req: AuthRequest, res: Response) => {
    const { orderId } = req.params;
    const { paymentStatus, paymentId, transactionId } = req.body;

    if (!Object.values(PaymentStatus).includes(paymentStatus)) {
      throw new AppError("Invalid payment status", 400);
    }

    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    order.paymentStatus = paymentStatus;
    if (paymentId) order.paymentId = paymentId;
    if (transactionId) order.transactionId = transactionId;

    if (
      paymentStatus === PaymentStatus.PAID &&
      order.status === OrderStatus.PENDING
    ) {
      order.status = OrderStatus.CONFIRMED;
    }

    if (paymentStatus === PaymentStatus.FAILED) {
      order.status = OrderStatus.FAILED;

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        await Order.restoreStock(order.items, session);
        await order.save({ session });
        await session.commitTransaction();
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    } else {
      await order.save();
    }

    res.json({
      success: true,
      message: "Payment status updated successfully",
      data: { order },
    });
  },

  getAllOrders: async (req: AuthRequest, res: Response) => {
    const { filter, pagination, sort } =
      helperServerUtils.buildQuery<IOrderDocument>(
        req.query,
        [
          "status",
          "paymentMethod",
          "paymentStatus",
          "userId",
          "totalAmount",
          "createdAt",
          "expectedDeliveryDate",
        ],
        "createdAt",
        ["orderNumber", "notes"]
      );

    if (
      req.query.userId &&
      mongoose.Types.ObjectId.isValid(req.query.userId as string)
    ) {
      filter.userId = new mongoose.Types.ObjectId(req.query.userId as string);
    }

    const { startDate, endDate } = req.query;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate as string);
      if (endDate) filter.createdAt.$lte = new Date(endDate as string);
    }

    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .populate("userId", "name email phone")
        .populate("items.productId", "name slug mainImage")
        .sort(sort)
        .skip(pagination.skip)
        .limit(pagination.limit)
        .lean(),
      Order.countDocuments({ ...filter }),
    ]);

    const totalPages = Math.ceil(totalCount / pagination.limit);

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: { orders },
      pagination: {
        currentPage: pagination.page,
        totalPages,
        limit: pagination.limit,
        totalCount,
        hasNextPage: pagination.page < totalPages,
        hasPrevPage: pagination.page > 1,
      },
    });
  },

  getOrderByIdAdmin: async (req: AuthRequest, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("userId", "name email phone")
      .populate("items.productId", "name slug mainImage")
      .populate("tracking.updatedBy", "name email");

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    res.json({
      success: true,
      message: "Order fetched successfully",
      data: order,
    });
  },

  getOrderStats: async (req: AuthRequest, res: Response) => {
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate as string);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate as string);
    }

    const stats = await Order.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalOrders = await Order.countDocuments(dateFilter);
    const totalRevenue = await Order.aggregate([
      { $match: { ...dateFilter, status: OrderStatus.DELIVERED } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const pendingOrders = await Order.countDocuments({
      status: OrderStatus.PENDING,
    });
    const deliveredOrders = await Order.countDocuments({
      status: OrderStatus.DELIVERED,
    });
    const cancelledOrders = await Order.countDocuments({
      status: OrderStatus.CANCELLED,
    });

    const activeOrders = await Order.countDocuments({
      status: {
        $in: [
          OrderStatus.CONFIRMED,
          OrderStatus.PROCESSING,
          OrderStatus.ACCEPTED,
          OrderStatus.OUT_FOR_DELIVERY,
        ],
      },
    });

    res.json({
      success: true,
      counts: {
        totalOrders,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        activeOrders, // ✅ Added active orders
      },
      totalRevenue: totalRevenue[0]?.total || 0,
      statusWise: stats,
    });
  },

  // Admin cancel order
  adminCancelOrder: async (req: AuthRequest, res: Response) => {
    const adminId = new mongoose.Types.ObjectId(req.user?._id);
    const { orderId } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw new AppError("Delivered orders cannot be cancelled", 400);
    }

    if ([OrderStatus.CANCELLED, OrderStatus.REFUNDED].includes(order.status)) {
      throw new AppError("Order is already cancelled", 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Restore stock
      await Order.restoreStock(order.items, session);

      // Update order
      order.status = OrderStatus.CANCELLED;
      order.cancellationReason = reason || "Cancelled by admin";
      order.cancelledBy = adminId;
      order.cancelledAt = new Date();

      if (order.paymentStatus === PaymentStatus.PAID) {
        order.paymentStatus = PaymentStatus.REFUNDED;
      }

      await order.save({ session });
      await session.commitTransaction();

      res.json({
        success: true,
        message: "Order cancelled successfully",
        order,
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  },
};


// Webhook helper functions
async function handlePaymentCaptured(payment: any) {
  const order = await Order.findOne({
    "razorpayDetails.razorpay_order_id": payment.order_id,
  });

  if (order && order.paymentStatus !== PaymentStatus.PAID) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      order.paymentStatus = PaymentStatus.PAID;
      order.status = OrderStatus.CONFIRMED;
      order.razorpayDetails = {
        ...order.razorpayDetails,
        razorpay_payment_id: payment.id,
      };

      await Order.reduceStock(order.items, session);
      await order.save({ session });
      await session.commitTransaction();

      console.log(`Payment captured for order ${order.orderNumber}`);
    } catch (error) {
      await session.abortTransaction();
      console.error("Error handling payment captured:", error);
    } finally {
      session.endSession();
    }
  }
}

async function handlePaymentFailed(payment: any) {
  const order = await Order.findOne({
    "razorpayDetails.razorpay_order_id": payment.order_id,
  });

  if (order) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Refund wallet if used
      if (order.walletUsed > 0) {
        const userWallet = await Wallet.findOne({
          ownerId: order.userId,
          ownerModel: "USER"
        }).session(session);

        if (userWallet) {
          await userWallet.credit(order.walletUsed);
          await userWallet.save({ session });

          await Transaction.recordTransaction(
            (userWallet._id as mongoose.Types.ObjectId).toString(),
            "CREDIT",
            "REFUND",
            order.walletUsed,
            userWallet.balance,
            "SUCCESS",
            `Payment failed refund - ${order.orderNumber}`,
            (order._id as any).toString(),
            {
              orderNumber: order.orderNumber,
              reason: "Payment failed",
              paymentId: payment.id,
            }
          );
        }
      }

      order.paymentStatus = PaymentStatus.FAILED;
      order.status = OrderStatus.FAILED;
      await order.save({ session });

      await session.commitTransaction();
      console.log(`Payment failed for order ${order.orderNumber}`);
    } catch (error) {
      await session.abortTransaction();
      console.error("Error handling payment failed:", error);
    } finally {
      session.endSession();
    }
  }
}

async function handleRefundCreated(refund: any) {
  const order = await Order.findOne({
    "razorpayDetails.razorpay_payment_id": refund.payment_id,
  });

  if (order) {
    order.razorpayDetails = {
      ...order.razorpayDetails,
      refund_id: refund.id,
      refund_status: refund.status,
    };
    await order.save();

    console.log(`Refund created for order ${order.orderNumber}`);
  }
}

async function handleRefundProcessed(refund: any) {
  const order = await Order.findOne({
    "razorpayDetails.refund_id": refund.id,
  });

  if (order) {
    order.razorpayDetails = {
      ...order.razorpayDetails,
      refund_status: refund.status,
    };
    order.paymentStatus = PaymentStatus.REFUNDED;
    order.status = OrderStatus.REFUNDED;
    await order.save();

    console.log(`Refund processed for order ${order.orderNumber}`);
  }
}
