import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import productService from '../services/productService';
import cartService from '../services/cartService';
import Breadcrumb from '../components/Breadcrumb';
import PayPalButton from '../components/PayPalButton';
import Swal from 'sweetalert2';
 
export default function Checkout() {
    const navigate = useNavigate();
    const { isAuthenticated, user, accountId } = useAuth();
    const { cart, cartTotalItems, cartGrandTotal, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
 
    useEffect(() => {
        if (!isAuthenticated) { navigate('/login'); return; }
        if (cartTotalItems === 0 && cart.length === 0) { navigate('/cart'); return; }
    }, [isAuthenticated, cartTotalItems, cart.length, navigate]);
 
    const processOrder = async (orderStatus = 'PENDING', paypalData = null) => {
        if (!accountId) { setError('No se pudo obtener la cuenta. Inicia sesión de nuevo.'); return; }
        setLoading(true); setError('');
        try {
            const allItems = isAuthenticated ? await cartService.getAllCartItems() : cart;
            const shopping = allItems.map(item => ({
                product: item.variantId,
                quantity: item.quantity,
                price: item.price,
            }));
            await productService.createOrder({
                account: accountId,
                shopping,
                amount: cartGrandTotal,
                status: orderStatus,
            });
            await clearCart();
            await Swal.fire({
                title: '¡Enhorabuena!',
                text: orderStatus === 'PROCESSING' ? 'Tu pago fue procesado y el pedido ha sido creado.' : 'Pedido realizado correctamente.',
                icon: 'success',
                confirmButtonColor: '#610361',
            });
            navigate('/orders');
        } catch (err) {
            console.error('Error creating order', err);
            const msg = err?.response?.data?.message || err?.message || '';
            if (msg.includes('Stock insuficiente')) {
                setError(msg);
                Swal.fire('Error', msg, 'error');
            } else {
                setError('Error al procesar el pedido. Intenta de nuevo.');
                Swal.fire('Error', 'No se pudo crear el pedido.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };
 
    const handlePayPalSuccess = (paypalOrder) => processOrder('PROCESSING', paypalOrder);
    const handlePayPalError = (err) => setError('Hubo un error con el pago de PayPal. Por favor intenta de nuevo.');
 
    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@300;400;500;600&display=swap');
 
                .checkout-root {
                    --plum: #610361;
                    --plum-light: #7a1a7a;
                    --plum-pale: #f3e6f3;
                    --plum-mist: #faf0fa;
                    --rose-accent: #c2185b;
                    --gold: #b8860b;
                    --text-main: #1a1a2e;
                    --text-muted: #6b6b8a;
                    --border: #e8d5e8;
                    --white: #ffffff;
                    --radius: 16px;
                    --shadow-soft: 0 4px 24px rgba(97,3,97,0.08);
                    --shadow-card: 0 2px 12px rgba(97,3,97,0.06);
                    font-family: 'DM Sans', sans-serif;
                    background: linear-gradient(160deg, #fdf6ff 0%, #f8edf8 50%, #fff5fb 100%);
                    min-height: 100vh;
                }
 
                .checkout-root * { box-sizing: border-box; }
 
                .co-container {
                    max-width: 1160px;
                    margin: 0 auto;
                    padding: 32px 24px 64px;
                }
 
                /* Page title */
                .co-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 2rem;
                    font-weight: 600;
                    color: var(--plum);
                    margin: 0 0 28px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .co-title-icon {
                    width: 44px; height: 44px;
                    background: var(--plum);
                    border-radius: 12px;
                    display: flex; align-items: center; justify-content: center;
                    color: white;
                    font-size: 1.1rem;
                    flex-shrink: 0;
                }
 
                /* Error */
                .co-error {
                    background: #fff1f3;
                    border: 1px solid #fcc;
                    color: #c0392b;
                    padding: 12px 16px;
                    border-radius: 10px;
                    font-size: 0.875rem;
                    margin-bottom: 24px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
 
                /* Layout */
                .co-grid {
                    display: grid;
                    grid-template-columns: 1fr 380px;
                    gap: 28px;
                    align-items: start;
                }
                @media (max-width: 900px) {
                    .co-grid { grid-template-columns: 1fr; }
                }
 
                /* Cards */
                .co-card {
                    background: var(--white);
                    border-radius: var(--radius);
                    border: 1px solid var(--border);
                    box-shadow: var(--shadow-card);
                    overflow: hidden;
                }
                .co-card + .co-card { margin-top: 20px; }
 
                .co-card-header {
                    padding: 18px 24px 16px;
                    border-bottom: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .co-card-header-icon {
                    width: 32px; height: 32px;
                    border-radius: 8px;
                    background: var(--plum-pale);
                    display: flex; align-items: center; justify-content: center;
                    color: var(--plum);
                    font-size: 0.85rem;
                }
                .co-card-title {
                    font-family: 'Playfair Display', serif;
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--text-main);
                    margin: 0;
                }
 
                .co-card-body { padding: 24px; }
 
                /* Fields grid */
                .co-fields {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 16px;
                }
                @media (max-width: 600px) {
                    .co-fields { grid-template-columns: 1fr; }
                }
 
                .co-field label {
                    display: block;
                    font-size: 0.7rem;
                    font-weight: 600;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    color: var(--text-muted);
                    margin-bottom: 6px;
                }
                .co-field-wrap {
                    position: relative;
                }
                .co-field-wrap i {
                    position: absolute;
                    left: 12px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--plum);
                    opacity: 0.5;
                    font-size: 0.8rem;
                    pointer-events: none;
                }
                .co-field input {
                    width: 100%;
                    padding: 10px 12px 10px 32px;
                    border-radius: 10px;
                    border: 1.5px solid var(--border);
                    background: var(--plum-mist);
                    font-family: 'DM Sans', sans-serif;
                    font-size: 0.875rem;
                    color: var(--text-main);
                    outline: none;
                    transition: border-color 0.2s;
                }
                .co-field input:focus { border-color: var(--plum); }
 
                /* PayPal section */
                .co-paypal-wrap {
                    padding: 0 24px 20px;
                }
                .co-paypal-label {
                    font-size: 0.72rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: var(--text-muted);
                    margin-bottom: 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                .co-paypal-label::before,
                .co-paypal-label::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: var(--border);
                }
 
                .co-paypal-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 24px 20px;
                    border-top: 1px solid var(--border);
                    gap: 12px;
                    flex-wrap: wrap;
                }
                .co-paypal-note {
                    font-size: 0.72rem;
                    color: var(--text-muted);
                    font-style: italic;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .co-pay-later {
                    font-size: 0.72rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: var(--plum);
                    background: none;
                    border: 1.5px solid var(--plum);
                    border-radius: 8px;
                    padding: 6px 14px;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-family: 'DM Sans', sans-serif;
                    white-space: nowrap;
                }
                .co-pay-later:hover { background: var(--plum); color: white; }
                .co-pay-later:disabled { opacity: 0.4; cursor: not-allowed; }
 
                /* Summary card (right) */
                .co-summary { position: sticky; top: 24px; }
 
                .co-summary-items {
                    padding: 0 24px;
                    max-height: 280px;
                    overflow-y: auto;
                    scrollbar-width: thin;
                    scrollbar-color: var(--border) transparent;
                }
                .co-summary-item {
                    display: flex;
                    align-items: flex-start;
                    justify-content: space-between;
                    gap: 12px;
                    padding: 12px 0;
                    border-bottom: 1px dashed var(--border);
                }
                .co-summary-item:last-child { border-bottom: none; }
                .co-item-info { flex: 1; min-width: 0; }
                .co-item-name {
                    font-size: 0.82rem;
                    font-weight: 500;
                    color: var(--text-main);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    margin: 0 0 3px;
                }
                .co-item-meta {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                }
                .co-item-qty {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--plum-pale);
                    color: var(--plum);
                    font-size: 0.65rem;
                    font-weight: 700;
                    border-radius: 6px;
                    padding: 2px 6px;
                    margin-left: 4px;
                }
                .co-item-price {
                    font-size: 0.82rem;
                    font-weight: 600;
                    color: var(--plum);
                    white-space: nowrap;
                }
 
                /* Totals */
                .co-totals {
                    padding: 16px 24px 20px;
                    border-top: 1px solid var(--border);
                }
                .co-total-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                .co-total-label {
                    font-size: 0.78rem;
                    color: var(--text-muted);
                }
                .co-total-value {
                    font-size: 0.78rem;
                    color: var(--text-main);
                    font-weight: 500;
                }
                .co-total-row.grand {
                    border-top: 1.5px solid var(--border);
                    padding-top: 12px;
                    margin-top: 4px;
                    margin-bottom: 0;
                }
                .co-total-row.grand .co-total-label {
                    font-family: 'Playfair Display', serif;
                    font-size: 1rem;
                    color: var(--text-main);
                    font-weight: 600;
                }
                .co-total-row.grand .co-total-value {
                    font-family: 'Playfair Display', serif;
                    font-size: 1.15rem;
                    color: var(--plum);
                    font-weight: 600;
                }
                .co-free-badge {
                    background: #e8f5e9;
                    color: #388e3c;
                    font-size: 0.68rem;
                    font-weight: 700;
                    padding: 2px 8px;
                    border-radius: 20px;
                }
 
                /* Badge items count */
                .co-badge {
                    font-size: 0.65rem;
                    font-weight: 700;
                    background: var(--plum);
                    color: white;
                    border-radius: 20px;
                    padding: 2px 8px;
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                }
 
                /* Trust badge */
                .co-trust {
                    background: linear-gradient(135deg, var(--plum-pale), #fff);
                    border: 1px solid var(--border);
                    border-radius: var(--radius);
                    padding: 16px 20px;
                    margin-top: 16px;
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                }
                .co-trust-icon {
                    width: 36px; height: 36px;
                    border-radius: 10px;
                    background: var(--plum);
                    color: white;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 0.9rem;
                    flex-shrink: 0;
                    margin-top: 2px;
                }
                .co-trust-text {
                    font-size: 0.72rem;
                    color: var(--text-muted);
                    line-height: 1.6;
                    margin: 0;
                }
                .co-trust-text strong {
                    display: block;
                    font-size: 0.8rem;
                    color: var(--text-main);
                    margin-bottom: 2px;
                }
            `}</style>
 
            <div className="checkout-root">
                <Breadcrumb items={[
                    { label: 'Inicio', path: '/', icon: 'fa-solid fa-house' },
                    { label: 'Carrito', path: '/cart' },
                    { label: 'Checkout' },
                ]} />
 
                <div className="co-container">
                    <h1 className="co-title">
                        <span className="co-title-icon">
                            <i className="fa-solid fa-bag-shopping"></i>
                        </span>
                        Finalizar Compra
                    </h1>
 
                    {error && (
                        <div className="co-error">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            {error}
                        </div>
                    )}
 
                    <div className="co-grid">
                        {/* Columna izquierda */}
                        <div>
                            {/* Datos de envío */}
                            <div className="co-card">
                                <div className="co-card-header">
                                    <div className="co-card-header-icon">
                                        <i className="fa-solid fa-location-dot"></i>
                                    </div>
                                    <h3 className="co-card-title">Información de Envío</h3>
                                </div>
                                <div className="co-card-body">
                                    <div className="co-fields">
                                        <div className="co-field">
                                            <label>Nombre</label>
                                            <div className="co-field-wrap">
                                                <i className="fa-solid fa-user"></i>
                                                <input type="text" value={user?.name || ''} readOnly />
                                            </div>
                                        </div>
                                        <div className="co-field">
                                            <label>Email</label>
                                            <div className="co-field-wrap">
                                                <i className="fa-solid fa-envelope"></i>
                                                <input type="text" value={user?.email || ''} readOnly />
                                            </div>
                                        </div>
                                        <div className="co-field">
                                            <label>Teléfono</label>
                                            <div className="co-field-wrap">
                                                <i className="fa-solid fa-phone"></i>
                                                <input type="text" value={user?.phoneNumber || ''} readOnly />
                                            </div>
                                        </div>
                                        <div className="co-field">
                                            <label>Dirección</label>
                                            <div className="co-field-wrap">
                                                <i className="fa-solid fa-map-pin"></i>
                                                <input type="text" value={user?.account?.address || ''} readOnly />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
 
                            {/* Pago con PayPal */}
                            <div className="co-card" style={{ marginTop: 20 }}>
                                <div className="co-card-header">
                                    <div className="co-card-header-icon">
                                        <i className="fa-brands fa-paypal"></i>
                                    </div>
                                    <h3 className="co-card-title">Método de Pago</h3>
                                </div>
 
                                <div className="co-paypal-wrap" style={{ paddingTop: 20 }}>
                                    <div className="co-paypal-label">Pagar de forma segura con PayPal</div>
                                    <PayPalButton
                                        amount={cartGrandTotal}
                                        onSuccess={handlePayPalSuccess}
                                        onError={handlePayPalError}
                                        description={`Pedido de ${user?.name} - Kiogloss`}
                                    />
                                </div>
 
                                <div className="co-paypal-footer">
                                    <span className="co-paypal-note">
                                        <i className="fa-solid fa-circle-info"></i>
                                        El total se convertirá a USD para procesar con PayPal
                                    </span>
                                    <button
                                        onClick={() => processOrder('PENDING')}
                                        disabled={loading}
                                        className="co-pay-later">
                                        {loading ? 'Procesando...' : 'Pagar después'}
                                    </button>
                                </div>
                            </div>
                        </div>
 
                        {/* Columna derecha – Resumen */}
                        <div className="co-summary">
                            <div className="co-card">
                                <div className="co-card-header" style={{ justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <div className="co-card-header-icon">
                                            <i className="fa-solid fa-receipt"></i>
                                        </div>
                                        <h3 className="co-card-title">Resumen del Pedido</h3>
                                    </div>
                                    <span className="co-badge">{cartTotalItems} items</span>
                                </div>
 
                                <div className="co-summary-items">
                                    {cart.map(item => (
                                        <div key={item.variantId || item.id} className="co-summary-item">
                                            <div className="co-item-info">
                                                <p className="co-item-name">{item.name}</p>
                                                <span className="co-item-meta">
                                                    {item.variantDetails && `${item.variantDetails} · `}
                                                    <span className="co-item-qty">×{item.quantity}</span>
                                                </span>
                                            </div>
                                            <span className="co-item-price">
                                                COP {(item.price * item.quantity).toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
 
                                <div className="co-totals">
                                    <div className="co-total-row">
                                        <span className="co-total-label">Subtotal</span>
                                        <span className="co-total-value">COP {cartGrandTotal.toLocaleString()}</span>
                                    </div>
                                    <div className="co-total-row">
                                        <span className="co-total-label">Envío</span>
                                        <span className="co-free-badge">Gratis</span>
                                    </div>
                                    <div className="co-total-row grand">
                                        <span className="co-total-label">Total</span>
                                        <span className="co-total-value">COP {cartGrandTotal.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
 
                            <div className="co-trust">
                                <div className="co-trust-icon">
                                    <i className="fa-solid fa-shield-halved"></i>
                                </div>
                                <p className="co-trust-text">
                                    <strong>Compra 100% segura</strong>
                                    Tu información está protegida. Al realizar el pedido aceptas nuestros términos y condiciones de servicio.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}