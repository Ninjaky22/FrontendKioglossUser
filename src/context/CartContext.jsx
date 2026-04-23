import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import cartService from '../services/cartService';

const CartContext = createContext(null);

const PAGE_SIZE = 8;

export function CartProvider({ children }) {
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState([]);
    const [cartPage, setCartPage] = useState(0);
    const [cartTotalPages, setCartTotalPages] = useState(1);
    const [cartTotalItems, setCartTotalItems] = useState(0); // totalElements del backend
    const [cartGrandTotal, setCartGrandTotal] = useState(0); // suma real de TODOS los ítems

    // Carga una página del carrito desde el backend
    const loadDbCart = useCallback(async (page = 0) => {
        try {
            const data = await cartService.getCart(page, PAGE_SIZE);
            const items = (data.content || [])
                .map(i => ({
                    cartItemId: i.id,
                    id: i.productId,
                    variantId: i.variantId,
                    name: i.name,
                    price: i.price,
                    image: i.image,
                    slug: i.slug,
                    quantity: i.quantity,
                    variantDetails: i.variantDetails,
                    stock: i.stock
                }));
            setCart(items);
            setCartPage(data.number ?? page);
            setCartTotalPages(data.totalPages ?? 1);
            setCartTotalItems(data.totalElements ?? items.length);
            setCartGrandTotal(Number(data.grandTotal ?? 0));
        } catch (error) {
            console.error("Error cargando carrito", error);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
            if (localCart.length > 0) {
                Promise.all(localCart.map(item =>
                    cartService.addToCart({ variantId: item.variantId, quantity: item.quantity })
                )).then(() => {
                    localStorage.removeItem('cart');
                    loadDbCart(0);
                });
            } else {
                loadDbCart(0);
            }
        } else {
            const local = JSON.parse(localStorage.getItem('cart') || '[]');
            setCart(local);
            setCartTotalItems(local.reduce((s, i) => s + i.quantity, 0));
            setCartGrandTotal(local.reduce((s, i) => s + (i.price * i.quantity), 0));
        }
    }, [isAuthenticated, loadDbCart]);

    useEffect(() => {
        const handleCartChange = () => {
            if (!isAuthenticated) {
                const local = JSON.parse(localStorage.getItem('cart') || '[]');
                setCart(local);
                setCartTotalItems(local.reduce((s, i) => s + i.quantity, 0));
                setCartGrandTotal(local.reduce((s, i) => s + (i.price * i.quantity), 0));
            }
        };
        window.addEventListener('cart_changed', handleCartChange);
        return () => window.removeEventListener('cart_changed', handleCartChange);
    }, [isAuthenticated]);

    const addToCart = async (product, qty = 1) => {
        if (isAuthenticated) {
            await cartService.addToCart({ variantId: product.variantId, quantity: qty });
            await loadDbCart(cartPage);
        } else {
            const newCart = [...cart];
            const exists = newCart.find(i => i.variantId === product.variantId);
            if (exists) {
                exists.quantity += qty;
            } else {
                newCart.push({ ...product, quantity: qty, image: product.images?.[0] || product.image });
            }
            setCart(newCart);
            setCartTotalItems(newCart.reduce((s, i) => s + i.quantity, 0));
            localStorage.setItem('cart', JSON.stringify(newCart));
        }
    };

    const updateQty = async (cartItem, delta) => {
        const stock = cartItem.stock ?? Infinity;
        const newQty = Math.min(stock, Math.max(1, cartItem.quantity + delta));
        if (newQty === cartItem.quantity) return;
        if (isAuthenticated) {
            await cartService.updateQuantity(cartItem.cartItemId, newQty);
            await loadDbCart(cartPage);
        } else {
            const newCart = cart.map(i =>
                i.variantId === cartItem.variantId ? { ...i, quantity: newQty } : i
            );
            setCart(newCart);
            setCartTotalItems(newCart.reduce((s, i) => s + i.quantity, 0));
            localStorage.setItem('cart', JSON.stringify(newCart));
        }
    };

    const removeItem = async (cartItem) => {
        if (isAuthenticated) {
            await cartService.removeItem(cartItem.cartItemId);
            // Si eliminamos el último ítem de la página actual, retroceder
            const isLastOnPage = cart.length === 1 && cartPage > 0;
            await loadDbCart(isLastOnPage ? cartPage - 1 : cartPage);
        } else {
            const newCart = cart.filter(i => i.variantId !== cartItem.variantId);
            setCart(newCart);
            setCartTotalItems(newCart.reduce((s, i) => s + i.quantity, 0));
            localStorage.setItem('cart', JSON.stringify(newCart));
        }
    };

    const clearCart = async () => {
        if (isAuthenticated) await cartService.clearCart();
        setCart([]);
        setCartPage(0);
        setCartTotalPages(1);
        setCartTotalItems(0);
        setCartGrandTotal(0);
        localStorage.removeItem('cart');
    };

    const goToCartPage = (page) => {
        if (isAuthenticated) loadDbCart(page);
    };

    // cartCount usa totalElements del backend para el badge del navbar (refleja todo el carrito, no solo la página)
    const cartCount = isAuthenticated
        ? cartTotalItems
        : cart.reduce((s, i) => s + i.quantity, 0);

    return (
        <CartContext.Provider value={{
            cart,
            cartPage,
            cartTotalPages,
            cartTotalItems,
            cartGrandTotal,
            goToCartPage,
            addToCart,
            updateQty,
            removeItem,
            clearCart,
            cartCount,
        }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
