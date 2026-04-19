"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, MapPin, Wallet as WalletIcon, CreditCard } from "lucide-react";
import { Button } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { useOrder, useCart, useAddress, useWallet, useAuth } from '@/hooks';
import { PaymentMethod } from '@/lib/types/order/order.enums';
import toast from 'react-hot-toast';

declare global {
    interface Window {
        Razorpay: any;
    }
}

interface CheckoutDialogProps {
    dialogOpen: boolean;
    setDialogOpen: (x: boolean) => void;
}

export default function CheckoutDialog({ dialogOpen, setDialogOpen, }: CheckoutDialogProps) {
    const { user } = useAuth();
    const { defaultAddress, addresses } = useAddress();
    const { cart, clearCart } = useCart();
    const { createOrder, createRazorpayOrder, verifyRazorpayPayment } = useOrder();
    const { wallet } = useWallet();
    const router = useRouter();

    const [deliveryCharge, handlingCharge, subTotal, totalAmount, appliedPromo, discount, walletBalance] = useMemo(() => {
        const walletBalance = Number(wallet?.balance || 0) + Number(wallet?.promoCash || 0);

        if (!cart?.cart) return [0, 0, 0, 0, null, 0, walletBalance];
        const { deliveryCharge, handlingCharge, subTotal, totalAmount, appliedPromo, } = cart?.cart
        return [deliveryCharge, handlingCharge, subTotal, totalAmount, appliedPromo, appliedPromo?.discountAmount ?? 0, walletBalance];
    }, [cart?.cart])

    const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(PaymentMethod.COD);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState<string>("");
    const [useWalletAmount, setUseWalletAmount] = useState(false);
    const [walletAmountToUse, setWalletAmountToUse] = useState(0);

    const maxWalletUsage = Math.min(walletBalance, totalAmount);

   const totalAvailable =
  (wallet?.balance || 0) + (wallet?.promoCash || 0);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    // Calculate payment breakdown
    const calculatePaymentBreakdown = () => {
        let walletUsed = 0;
        let onlineAmount = 0;
        let codAmount = 0;

        if (useWalletAmount && walletAmountToUse > 0) {
            walletUsed = Math.min(walletAmountToUse, walletBalance, totalAmount);
        }

        const remainingAmount = totalAmount - walletUsed;

        if (selectedPayment === PaymentMethod.ONLINE) {
            onlineAmount = remainingAmount;
        } else if (selectedPayment === PaymentMethod.COD) {
            codAmount = remainingAmount;
        } else if (selectedPayment === PaymentMethod.WALLET) {
            // Full wallet payment
            walletUsed = Math.min(totalAmount, walletBalance);
        }

        return {
            walletUsed,
            onlineAmount,
            codAmount,
            remainingAmount,
            payableNow: onlineAmount,
            totalAmount: totalAmount,
        };
    };

    const breakdown = calculatePaymentBreakdown();

    // Determine actual payment method based on wallet usage
    const getActualPaymentMethod = (): PaymentMethod => {
        if (selectedPayment === PaymentMethod.WALLET) {
            return PaymentMethod.WALLET;
        }

        if (useWalletAmount && walletAmountToUse > 0) {
            if (selectedPayment === PaymentMethod.ONLINE) {
                return PaymentMethod.WALLET_ONLINE;
            }
            if (selectedPayment === PaymentMethod.COD) {
                return PaymentMethod.WALLET_COD;
            }
        }

        return selectedPayment;
    };

    // Handle Razorpay payment
    const initiateRazorpayPayment = async (orderId: string) => {
        try {
            // Load Razorpay script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                toast.error('Failed to load payment gateway');
                return false;
            }

            // Create Razorpay order
            const razorpayOrderResponse = await createRazorpayOrder({ orderId });

            if (!razorpayOrderResponse.success) {
                toast.error(razorpayOrderResponse.message || 'Failed to initialize payment');
                return false;
            }

            const razorpayData = razorpayOrderResponse.data;

            // Razorpay options
            const options = {
                key: razorpayData?.key,
                amount: razorpayData?.amount,
                currency: razorpayData?.currency,
                name: 'Your Store Name',
                description: `Order #${razorpayData?.orderNumber}`,
                order_id: razorpayData?.razorpay_order_id,
                handler: async function (response: any) {
                    try {
                        // Verify payment
                        const verifyResponse = await verifyRazorpayPayment({
                            orderId: razorpayData?.orderId ?? "",
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                        });

                        if (verifyResponse.success) {
                            toast.success('Payment successful!');
                            clearCart({ userId: user?._id ?? "" });
                            setDialogOpen(false);
                            router.push(`/profile/orders/track/${orderId}`);
                        } else {
                            toast.error('Payment verification failed');
                        }
                    } catch (error: any) {
                        console.error('Payment verification error:', error);
                        toast.error(error.message || 'Payment verification failed');
                    }
                },
                modal: {
                    ondismiss: function () {
                        toast.error('Payment cancelled');
                        setIsProcessing(false);
                    },
                },
                prefill: {
                    name: user?.fullName || '',
                    email: user?.email || '',
                    contact: user?.phone || '',
                },
                theme: {
                    color: '#16a34a', // green-600
                },
            };

            const paymentObject = new window.Razorpay(options);
            paymentObject.open();

            return true;
        } catch (error: any) {
            console.error('Razorpay payment error:', error);
            toast.error(error.message || 'Payment initialization failed');
            return false;
        }
    };

    // Confirm checkout
    const confirmCheckout = async () => {
        try {
            setIsProcessing(true);
            setDialogOpen(false)

            if (!cart || !cart.cart.items?.length) {
                toast.error("Your cart is empty");
                return;
            }

            if (!selectedAddressId) {
                toast.error("Please select a delivery address");
                return;
            }

            // Validate wallet usage
            if (useWalletAmount && walletAmountToUse > walletBalance) {
                toast.error("Insufficient wallet balance");
                return;
            }

            if (selectedPayment === PaymentMethod.WALLET && walletBalance < totalAmount) {
                toast.error("Insufficient wallet balance for full payment");
                return;
            }

            const actualPaymentMethod = getActualPaymentMethod();

            // Create order
            const orderPayload = {
                shippingAddressId: selectedAddressId,
                billingAddressId: selectedAddressId,
                paymentMethod: actualPaymentMethod,
                walletAmount: breakdown.walletUsed,
            };

            const orderResponse = await createOrder(orderPayload);

            if (!orderResponse.success) {
                toast.error(orderResponse.message || 'Failed to create order');
                return;
            }

            const orderData = orderResponse.data;
            const createdOrderId = orderData?.order._id;

            // Handle different payment scenarios
            if (orderData?.requiresPayment && orderData.onlineAmount > 0) {
                // Online payment required - initiate Razorpay
                const paymentInitiated = await initiateRazorpayPayment(createdOrderId ?? "");

                if (!paymentInitiated) {
                    setIsProcessing(false);
                    return;
                }
                // Keep processing state while Razorpay modal is open
            } else {
                // COD or Wallet payment - order is complete
                toast.success('Order placed successfully!');
                clearCart({ userId: user?._id ?? "" });
                setDialogOpen(false);
                router.push(`/profile/orders/track/${createdOrderId}`);
                setIsProcessing(false);
            }
        } catch (error: any) {
            console.error('Checkout error:', error);
            toast.error(error.message || 'Failed to place order');
        } finally{
            setIsProcessing(false);
        }
    };

    // Update wallet amount when checkbox changes
    useEffect(() => {
        if (useWalletAmount) {
            setWalletAmountToUse(maxWalletUsage);
        } else {
            setWalletAmountToUse(0);
        }
    }, [useWalletAmount, maxWalletUsage]);

    // Set default address
    useEffect(() => {
        if (dialogOpen) {
            setSelectedAddressId(defaultAddress?._id || "");
        }
    }, [dialogOpen, defaultAddress]);

    // Reset wallet usage when payment method changes to WALLET
    useEffect(() => {
        if (selectedPayment === PaymentMethod.WALLET) {
            setUseWalletAmount(false);
            setWalletAmountToUse(0);
        }
    }, [selectedPayment]);

    return (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="w-[95vw] md:max-w-5xl max-h-[80vh] md:rounded-xl p-0 overflow-hidden flex flex-col mt-6">
                {/* HEADER */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0 bg-white">
                    <DialogTitle className="text-xl font-bold text-gray-900">
                        Complete Your Order
                    </DialogTitle>
                </DialogHeader>

                {/* CONTENT GRID */}
                <div className="grid grid-cols-1 md:grid-cols-2 flex-1 divide-y md:divide-y-0 md:divide-x overflow-hidden bg-gray-50">
                    {/* LEFT: Addresses */}
                    <div className="p-6 overflow-y-auto bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-green-600" />
                                Delivery Address
                            </h3>
                        </div>

                        {addresses && addresses.length > 0 ? (
                            <RadioGroup
                                value={selectedAddressId}
                                onValueChange={setSelectedAddressId}
                                className="space-y-3"
                            >
                                {addresses.map((address) => (
                                    <div
                                        key={address._id}
                                        className={`border rounded-xl p-4 cursor-pointer transition-all ${selectedAddressId === address._id
                                            ? "border-green-500 bg-green-50 ring-2 ring-green-200"
                                            : "border-gray-200 hover:border-gray-300 bg-white"
                                            }`}
                                        onClick={() => setSelectedAddressId(address._id)}
                                    >
                                        <div className="flex items-start gap-3">
                                            <RadioGroupItem
                                                value={address._id}
                                                id={address._id}
                                                className="mt-1"
                                            />
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900">
                                                    {address.fullName}
                                                </p>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {address.addressLine1}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {address.city}, {address.state} - {address.pincode}
                                                </p>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    📞 {address.phone}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </RadioGroup>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                    <MapPin className="w-8 h-8 text-gray-400" />
                                </div>
                                <p className="text-gray-600 mb-4">No addresses found</p>
                                <Button
                                    onClick={() => {
                                        router.push("/profile/address");
                                        setDialogOpen(false);
                                    }}
                                    className="bg-green-600 hover:bg-green-700 text-white"
                                >
                                    Add Your First Address
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Payment & Summary */}
                    <div className="p-6 flex flex-col overflow-y-auto bg-gray-50">
                        {/* Wallet Usage Section */}
                        {walletBalance > 0 && selectedPayment !== PaymentMethod.WALLET && (
                            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <input
                                        type="checkbox"
                                        id="useWallet"
                                        checked={useWalletAmount}
                                        onChange={(e) => setUseWalletAmount(e.target.checked)}
                                        className="mt-1 w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                    />
                                    <div className="flex-1">
                                        <label htmlFor="useWallet" className="font-medium text-gray-900 cursor-pointer">
                                            Use Wallet Balance
                                        </label>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Available: ₹{walletBalance.toFixed(2)}
                                        </p>
                                        {useWalletAmount && (
                                            <div className="mt-3">
                                                <label className="text-sm text-gray-700 block mb-2">
                                                    Amount to use: ₹{walletAmountToUse.toFixed(2)}
                                                </label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max={maxWalletUsage}
                                                    step="1"
                                                    value={walletAmountToUse}
                                                    onChange={(e) => setWalletAmountToUse(Number(e.target.value))}
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                                />
                                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                    <span>₹0</span>
                                                    <span>₹{maxWalletUsage.toFixed(2)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment Method */}
                        <div className="mb-6">
                            <h3 className="font-bold text-gray-900 mb-3">Payment Method</h3>
                            <RadioGroup
                                value={selectedPayment}
                                onValueChange={(v: PaymentMethod) => setSelectedPayment(v)}
                                className="space-y-3"
                            >
                                {/* Full Wallet Payment */}
                                {walletBalance >= totalAmount && (
                                    <div
                                        className="flex items-center space-x-3 border border-gray-200 bg-white p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                                        onClick={() => setSelectedPayment(PaymentMethod.WALLET)}
                                    >
                                        <RadioGroupItem value={PaymentMethod.WALLET} id="wallet-full" />
                                        <WalletIcon className="w-5 h-5 text-green-600" />
                                        <div className="flex-1">
                                            <label htmlFor="wallet-full" className="text-gray-900 cursor-pointer font-medium block">
                                                Pay with Wallet
                                            </label>
                                            <p className="text-xs text-gray-500">
                                                Balance: ₹{walletBalance.toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Online Payment */}
                                <div
                                    className="flex items-center space-x-3 border border-gray-200 bg-white p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => setSelectedPayment(PaymentMethod.ONLINE)}
                                >
                                    <RadioGroupItem value={PaymentMethod.ONLINE} id="online" />
                                    <CreditCard className="w-5 h-5 text-blue-600" />
                                    <div className="flex-1">
                                        <label htmlFor="online" className="text-gray-900 cursor-pointer font-medium block">
                                            Card / UPI / Net Banking
                                        </label>
                                        <p className="text-xs text-gray-500">Pay securely via Razorpay</p>
                                    </div>
                                </div>

                                {/* COD */}
                                <div
                                    className="flex items-center space-x-3 border border-gray-200 bg-white p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => setSelectedPayment(PaymentMethod.COD)}
                                >
                                    <RadioGroupItem value={PaymentMethod.COD} id="cod" />
                                    <div className="flex-1">
                                        <label htmlFor="cod" className="text-gray-900 cursor-pointer font-medium block">
                                            Cash on Delivery
                                        </label>
                                        <p className="text-xs text-gray-500">Pay when you receive</p>
                                    </div>
                                </div>
                            </RadioGroup>
                        </div>

                        {/* Payment Breakdown */}
                        {(useWalletAmount || selectedPayment === PaymentMethod.WALLET) && breakdown.walletUsed > 0 && (
                            <div className="mb-4 p-4 bg-linear-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl">
                                <h4 className="font-semibold text-gray-900 mb-2">Payment Breakdown</h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between text-green-700">
                                        <span>Wallet Payment:</span>
                                        <span className="font-semibold">₹{breakdown.walletUsed.toFixed(2)}</span>
                                    </div>
                                    {breakdown.onlineAmount > 0 && (
                                        <div className="flex justify-between text-blue-700">
                                            <span>Online Payment:</span>
                                            <span className="font-semibold">₹{breakdown.onlineAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    {breakdown.codAmount > 0 && (
                                        <div className="flex justify-between text-gray-700">
                                            <span>Cash on Delivery:</span>
                                            <span className="font-semibold">₹{breakdown.codAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Order Summary */}
                        <div className="border-t pt-4 mt-auto">
                            <h3 className="font-semibold text-gray-800 mb-3">Order Summary</h3>
                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>₹{subTotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Handling Charges</span>
                                    <span>₹{handlingCharge.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Delivery Charges</span>
                                    <span>₹{deliveryCharge.toFixed(2)}</span>
                                </div>

                                {appliedPromo && discount > 0 && (
                                    <div className="flex justify-between text-green-600 font-medium">
                                        <span>Promo Discount ({appliedPromo.code})</span>
                                        <span>- ₹{discount.toFixed(2)}</span>
                                    </div>
                                )}

                                <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t">
                                    <span>Total Amount</span>
                                    <span>₹{totalAmount.toFixed(2)}</span>
                                </div>

                                {breakdown.walletUsed > 0 && (
                                    <div className="flex justify-between text-green-600 font-medium">
                                        <span>Wallet Used</span>
                                        <span>- ₹{breakdown.walletUsed.toFixed(2)}</span>
                                    </div>
                                )}

                                {breakdown.payableNow > 0 && (
                                    <div className="flex justify-between text-xl font-bold text-blue-600 pt-2 border-t">
                                        <span>Pay Now</span>
                                        <span>₹{breakdown.payableNow.toFixed(2)}</span>
                                    </div>
                                )}

                                {breakdown.codAmount > 0 && selectedPayment !== PaymentMethod.WALLET && (
                                    <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
                                        <span>Pay on Delivery</span>
                                        <span>₹{breakdown.codAmount.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Savings message */}
                            {appliedPromo && discount > 0 && (
                                <p className="text-green-600 text-sm mt-3 font-medium">
                                    🎉 You saved ₹{discount.toFixed(2)} on this order!
                                </p>
                            )}

                            <div className="flex gap-3 mt-6">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setDialogOpen(false)}
                                    disabled={isProcessing}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                    onClick={confirmCheckout}
                                    disabled={isProcessing || !selectedAddressId}
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                            Processing...
                                        </>
                                    ) : (
                                        `Place Order${breakdown.payableNow > 0 ? ` • ₹${breakdown.payableNow.toFixed(2)}` : ''}`
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}