import { useEffect, useRef, useState } from "react";
import { Package, X, CheckCircle } from "lucide-react";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  orderId: string;
  amount: number;
  customerName?: string;
  phone?: string;
  items?: OrderItem[];
}

export const NewOrderModal = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const handleNewOrder = (e: CustomEvent<Order>) => {
      const order = e.detail;
      
      // Play sound
      playOrderSound();
      
      // Show browser notification
      showBrowserNotification(order);
      
      // Add to queue
      setOrders((prev) => [...prev, order]);
    };

    window.addEventListener("new-order", handleNewOrder as EventListener);
    return () => window.removeEventListener("new-order", handleNewOrder as EventListener);
  }, []);

  // Show next order from queue
  useEffect(() => {
    if (!currentOrder && orders.length > 0) {
      setCurrentOrder(orders[0]);
      setOrders((prev) => prev.slice(1));
    }
  }, [orders, currentOrder]);

  const playOrderSound = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/order-notification.mp3");
    }
    audioRef.current.play().catch(() => {});
  };

  const showBrowserNotification = (order: Order) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("🎉 New Order Received!", {
        body: `Order #${order?.orderId || "N/A"} - ₹${order?.amount || 0}`,
        icon: "/order-icon.png",
      });
    }
  };

  const closeModal = () => {
    setCurrentOrder(null);
  };

  if (!currentOrder) return null;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 animate-fadeIn">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-slideUp overflow-hidden">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full animate-bounce">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">New Order!</h3>
                <p className="text-white/90 text-sm">Just received</p>
              </div>
            </div>
            <button
              onClick={closeModal}
              className="text-white/80 hover:text-white transition p-1 hover:bg-white/10 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Order Details */}
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Order ID
                </p>
                <p className="text-lg font-bold text-gray-900">
                  #{currentOrder?.orderId || "N/A"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Amount
                </p>
                <p className="text-2xl font-bold text-green-600">
                  ₹{currentOrder?.amount?.toLocaleString('en-IN') || 0}
                </p>
              </div>
            </div>

            {/* Customer Info */}
            {currentOrder?.customerName && (
              <div className="p-4 bg-blue-50 rounded-xl">
                <p className="text-xs text-blue-600 uppercase tracking-wide mb-1">
                  Customer
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  {currentOrder.customerName}
                </p>
                {currentOrder?.phone && (
                  <p className="text-xs text-gray-600 mt-1">
                    📞 {currentOrder.phone}
                  </p>
                )}
              </div>
            )}

            {/* Items */}
            {currentOrder?.items && currentOrder.items.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase tracking-wide">
                  Items ({currentOrder.items.length})
                </p>
                <div className="max-h-32 overflow-y-auto space-y-2">
                  {currentOrder.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
                    >
                      <span className="text-sm text-gray-700">
                        {item.name} x{item.quantity}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        ₹{item.price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={closeModal}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              Got it!
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
      `}</style>
    </>
  );
};