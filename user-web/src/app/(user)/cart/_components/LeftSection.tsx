import { useCart } from '@/hooks/entities/useCart'
import { CartType } from '@/lib/types/cart/cart.types'
import { Minus, Plus, Trash2 } from 'lucide-react'
import Image from 'next/image'
import React from 'react'

export default function LeftSection({ cart }: { cart: CartType }) {

    const { updateQuantity, removeItem } = useCart();

    return (
        <div>
            {cart?.items.map((item) => (
                <div
                    key={`${item.productId}-${item.variantId}`}
                    className="flex gap-4 bg-white border border-gray-200 p-4 rounded-xl hover:shadow-sm transition-shadow duration-200"
                >
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0">
                        <Image
                            src={item.productId.mainImage || "/placeholder.png"}
                            alt={item.productId.name || "Product Image"}
                            fill
                            className="rounded-lg object-cover"
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2 mb-1">
                            {item.product?.name || item.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3">
                            ₹{item.price} each
                        </p>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 bg-white rounded-lg p-1">
                                <button
                                    className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={() =>
                                        updateQuantity({
                                            productId: item.productId._id,
                                            variantId: item.variantId,
                                            quantity: Math.max(1, item.quantity - 1),
                                        })
                                    }
                                    disabled={item.quantity <= 1}
                                >
                                    <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-3 text-sm font-medium text-gray-900 min-w-8 text-center">
                                    {item.quantity}
                                </span>
                                <button
                                    className="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                                    onClick={() =>
                                        updateQuantity({
                                            productId: item.productId._id,
                                            variantId: item.variantId,
                                            quantity: item.quantity + 1,
                                        })
                                    }
                                >
                                    <Plus className="w-3 h-3" />
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <p className="font-bold text-gray-900 text-base sm:text-lg">
                                    ₹{(item.discountedPrice! * item.quantity).toFixed(2)}
                                </p>
                                <button
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    onClick={() =>
                                        removeItem({ variantId: item.variantId })
                                    }
                                    title="Remove item"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
