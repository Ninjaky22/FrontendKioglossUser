import { useEffect, useRef, useState, useCallback } from 'react';

const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
const CONVERSION_RATE = parseFloat(import.meta.env.VITE_PAYPAL_CONVERSION_RATE || '4200');

export default function PayPalButton({ amount, onSuccess, onError, description = "Compra en Kiogloss" }) {
    const paypalRef = useRef();
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const buttonsRendered = useRef(false);
    
    //Guardar callbacks en refs para no recrear el botón cuando cambian
    const onSuccessRef = useRef(onSuccess);
    const onErrorRef = useRef(onError);
    
    useEffect(() => { onSuccessRef.current = onSuccess; }, [onSuccess]);
    useEffect(() => { onErrorRef.current = onError; }, [onError]);

    useEffect(() => {
        if (window.paypal) { setScriptLoaded(true); return; }

        const script = document.createElement("script");
        script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`;
        script.async = true;
        script.onload = () => setScriptLoaded(true);
        document.body.appendChild(script);
    }, []); //Solo se ejecuta una vez

    useEffect(() => {
        //No renderizar si ya están los botones o no hay condiciones
        if (!scriptLoaded || !paypalRef.current || buttonsRendered.current) return;

        buttonsRendered.current = true;

        window.paypal.Buttons({
            createOrder: (data, actions) => {
                const usdAmount = (amount / CONVERSION_RATE).toFixed(2);
                return actions.order.create({
                    purchase_units: [{
                        description: description,
                        amount: { currency_code: "USD", value: usdAmount }
                    }],
                    application_context: {
                        brand_name: "Kiogloss Ecommerce",
                        shipping_preference: "NO_SHIPPING"
                    }
                });
            },
            onApprove: async (data, actions) => {
                try {
                    const order = await actions.order.capture();
                    console.log("Pago capturado con éxito:", order);
                    //Esperar antes de llamar onSuccess para que PayPal cierre limpiamente
                    await new Promise(resolve => setTimeout(resolve, 300));
                    if (onSuccessRef.current) onSuccessRef.current(order);
                } catch (err) {
                    console.error("Error capturando el pago:", err);
                    if (onErrorRef.current) onErrorRef.current(err);
                }
            },
            onError: (err) => {
                console.error("Error en PayPal Button:", err);
                if (onErrorRef.current) onErrorRef.current(err);
            },
            style: {
                layout: 'vertical',
                color: 'blue',
                shape: 'rect',
                label: 'pay'
            }
        }).render(paypalRef.current);

    }, [scriptLoaded]); //Solo depende de scriptLoaded

    return (
        <div ref={paypalRef} className="w-full min-h-[120px] sm:min-h-[140px] lg:min-h-[150px] transition-all duration-300 relative z-0">
            {!scriptLoaded && (
                <div className="flex flex-col gap-3 sm:gap-4 w-full animate-pulse">
                    <div className="flex items-center justify-center w-full h-[45px] sm:h-[55px] bg-gray-100 rounded-md sm:rounded-lg border border-gray-200 shadow-xs">
                        <div className="flex items-center gap-2 text-gray-400">
                            <i className="fa-brands fa-paypal text-base sm:text-lg"></i>
                            <span className="text-xs sm:text-sm font-medium tracking-wide">Cargando PayPal...</span>
                        </div>
                    </div>
                    {/* Skeleton para el posible botón secundario (Tarjetas, Pay Later, etc.) que carga PayPal en vertical */}
                    <div className="w-full h-[45px] sm:h-[55px] bg-gray-100/70 rounded-md sm:rounded-lg border border-gray-200/70 shadow-xs"></div>
                </div>
            )}
        </div>
    );
}