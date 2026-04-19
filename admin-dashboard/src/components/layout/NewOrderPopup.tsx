"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Bell, X, ArrowRight, Package } from "lucide-react";

interface NotificationEvent extends CustomEvent {
    detail: any;
}

export const NewOrderPopup = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [orderData, setOrderData] = useState<any>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const router = useRouter();

    useEffect(() => {
        const handleNotification = (e: Event) => {
            const event = e as NotificationEvent;
            const notification = event.detail;

            // Check if notification is for new order
            // Assuming 'order_placed' is the type or checks logic
            if (
                notification?.meta?.type === "order_placed" ||
                notification?.title?.toLowerCase().includes("order") ||
                notification?.body?.toLowerCase().includes("order")
            ) {
                setOrderData(notification);
                setIsVisible(true);
                playAudio();
            }
        };

        window.addEventListener("new-notification", handleNotification);
        return () => window.removeEventListener("new-notification", handleNotification);
    }, []);

    const playAudio = () => {
        if (!audioRef.current) {
            audioRef.current = new Audio("/order-notification.mp3");
        }
        audioRef.current.play().catch((err) => console.log("Audio play error", err));
    };

    const handleGoToOrder = () => {
        setIsVisible(false);
        router.push("/admin/orders");
    };

    if (!isVisible) return null;

    return (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[9999] animate-bounce-in">
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-blue-100 w-[90vw] max-w-md">
                <div className="bg-blue-600 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-full animate-pulse">
                            <Package className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-white font-bold text-lg">New Order Incoming!</h3>
                            <p className="text-white/80 text-xs">Just received a new order</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-white/70 hover:text-white transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-gray-600">
                            <p className="text-sm">Amount</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {orderData?.meta?.totalAmount ? `₹${orderData.meta.totalAmount}` : "New Order"}
                            </p>
                        </div>
                        {orderData?.meta?.orderNumber && (
                            <div className="px-3 py-1 bg-gray-100 rounded-lg">
                                <span className="text-xs font-mono font-medium text-gray-500">#{orderData.meta.orderNumber}</span>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleGoToOrder}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200"
                    >
                        Go to Order Page <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <style jsx>{`
        @keyframes bounceIn {
            0% { opacity: 0; transform: translate(-50%, -20px); }
            60% { transform: translate(-50%, 10px); }
            100% { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-bounce-in {
            animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
        </div>
    );
};
