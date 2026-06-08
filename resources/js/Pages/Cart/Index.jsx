import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ShoppingCart, Trash2, Plus, Minus, Package, ArrowRight, ShoppingBag, AlertCircle } from 'lucide-react';

export default function CartIndex({ items, total }) {
    const { auth, flash } = usePage().props;
    const [quantities, setQuantities] = useState(
        Object.fromEntries(items.map(item => [item.id, item.quantity]))
    );
    const [updatingId, setUpdatingId] = useState(null);

    const handleQuantityChange = (productId, newQty) => {
        if (newQty < 1) return;
        setQuantities(prev => ({ ...prev, [productId]: newQty }));
        setUpdatingId(productId);
        router.patch('/cart/update', { product_id: productId, quantity: newQty }, {
            preserveState: true,
            onFinish: () => setUpdatingId(null),
        });
    };

    const handleRemove = (productId) => {
        router.delete('/cart/remove', {
            data: { product_id: productId },
            preserveScroll: true,
        });
    };

    const handleCheckout = (e) => {
        e.preventDefault();
        router.post('/cart/checkout');
    };

    const displayTotal = items.reduce((sum, item) => sum + item.price * (quantities[item.id] ?? item.quantity), 0);

    return (
        <AppLayout>
            <Head title="My Cart" />

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-8">
                    <ShoppingCart size={28} className="text-primary-600" />
                    <h1 className="text-3xl font-bold text-gray-900">My Cart</h1>
                    {items.length > 0 && (
                        <span className="bg-primary-100 text-primary-700 text-sm font-semibold px-3 py-1 rounded-full">
                            {items.length} {items.length === 1 ? 'item' : 'items'}
                        </span>
                    )}
                </div>

                {flash?.success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl flex items-center gap-2">
                        <AlertCircle size={18} className="text-green-600 shrink-0" />
                        {flash.success}
                    </div>
                )}
                {flash?.error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl flex items-center gap-2">
                        <AlertCircle size={18} className="text-red-600 shrink-0" />
                        {flash.error}
                    </div>
                )}

                {items.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-16 text-center">
                        <ShoppingBag size={64} className="text-gray-200 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-gray-500 mb-8">Looks like you haven't added anything yet. Start shopping to fill it up!</p>
                        <Link href="/products" className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-3 rounded-xl transition-colors">
                            <ShoppingBag size={18} />
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Cart Items */}
                        <div className="flex-1 space-y-4">
                            {items.map(item => (
                                <div key={item.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 md:p-6 flex gap-4 items-start">
                                    {/* Product Image */}
                                    <Link href={`/products/${item.slug}`} className="shrink-0">
                                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                                            {item.image ? (
                                                <img src={`/storage/${item.image}`} alt={item.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package size={32} className="text-gray-300" />
                                                </div>
                                            )}
                                        </div>
                                    </Link>

                                    {/* Product Info */}
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/products/${item.slug}`} className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2">
                                            {item.name}
                                        </Link>
                                        {item.seller_name && (
                                            <p className="text-xs text-gray-500 mt-1">Sold by: {item.seller_name}</p>
                                        )}
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-lg font-bold text-primary-600">
                                                ${(item.price).toFixed(2)}
                                            </span>
                                            {item.sale_price && item.original_price && (
                                                <span className="text-sm text-gray-400 line-through">${item.original_price.toFixed(2)}</span>
                                            )}
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-3 mt-4">
                                            <div className="flex items-center gap-1 border border-gray-200 rounded-xl overflow-hidden">
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, (quantities[item.id] ?? item.quantity) - 1)}
                                                    disabled={updatingId === item.id || (quantities[item.id] ?? item.quantity) <= 1}
                                                    className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
                                                >
                                                    <Minus size={16} />
                                                </button>
                                                <span className="w-10 text-center font-semibold text-gray-900">
                                                    {updatingId === item.id ? '...' : (quantities[item.id] ?? item.quantity)}
                                                </span>
                                                <button
                                                    onClick={() => handleQuantityChange(item.id, (quantities[item.id] ?? item.quantity) + 1)}
                                                    disabled={updatingId === item.id || (quantities[item.id] ?? item.quantity) >= item.stock}
                                                    className="w-9 h-9 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors disabled:opacity-40"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => handleRemove(item.id)}
                                                className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={15} />
                                                Remove
                                            </button>
                                        </div>
                                    </div>

                                    {/* Subtotal */}
                                    <div className="hidden md:block text-right shrink-0">
                                        <p className="text-xs text-gray-500 mb-1">Subtotal</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            ${(item.price * (quantities[item.id] ?? item.quantity)).toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="w-full lg:w-80 shrink-0">
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-28">
                                <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal ({items.length} items)</span>
                                        <span className="font-medium">${displayTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping</span>
                                        <span className="text-green-600 font-medium">Free</span>
                                    </div>
                                    <div className="border-t border-gray-100 pt-3 flex justify-between font-bold text-lg text-gray-900">
                                        <span>Total</span>
                                        <span>${displayTotal.toFixed(2)}</span>
                                    </div>
                                </div>

                                {!auth?.user && (
                                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-sm">
                                        <strong>Sign in required</strong> to complete your order.
                                    </div>
                                )}

                                <form onSubmit={handleCheckout}>
                                    <button
                                        type="submit"
                                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg shadow-md"
                                    >
                                        {auth?.user ? (
                                            <>Confirm Order <ArrowRight size={20} /></>
                                        ) : (
                                            <>Sign In to Checkout <ArrowRight size={20} /></>
                                        )}
                                    </button>
                                </form>

                                <Link href="/products" className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors py-2">
                                    ← Continue Shopping
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
