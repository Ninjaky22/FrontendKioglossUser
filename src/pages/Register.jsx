import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

export default function Register() {
    const navigate = useNavigate();
    const { register, isAuthenticated } = useAuth();
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [street, setStreet] = useState('');
    const [streetNumber, setStreetNumber] = useState('');
    const [distric, setDistric] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/;
    const LIMITS = {
        nameMin: 3,
        nameMax: 50,
        phoneMin: 10,
        phoneMax: 10,
        emailMax: 254,
        passwordMax: 20,
        streetMax: 60,
        streetNumberMax: 10,
        districMax: 50,
    };

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) navigate('/account');
    }, [isAuthenticated, navigate]);
    const [error, setError] = useState('');

    const toast = (icon, title, text = '') => Swal.fire({
        toast: true, position: 'top-end', icon, title,
        text: text || undefined,
        showConfirmButton: false, timer: 3000, timerProgressBar: true,
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const trimmedName = name.trim();
        const trimmedEmail = email.trim();
        const trimmedPassword = password.trim();

        if (!trimmedName || !trimmedEmail || !trimmedPassword) {
            toast('warning', 'Completa los campos obligatorios');
            return;
        }
        if (trimmedName.length < LIMITS.nameMin) {
            toast('warning', 'Nombre muy corto', `Minimo ${LIMITS.nameMin} caracteres`);
            return;
        }
        if (!emailRegex.test(trimmedEmail)) {
            toast('warning', 'Correo invalido', 'Revisa el formato del email');
            return;
        }
        if (!passwordRegex.test(trimmedPassword)) {
            toast('warning', 'Contrasena insegura', 'Usa una mayuscula, un numero y un caracter especial');
            return;
        }
        if (phoneNumber.trim() && phoneNumber.trim().length < LIMITS.phoneMin) {
            toast('warning', 'Telefono muy corto', `Minimo ${LIMITS.phoneMin} digitos`);
            return;
        }
        setLoading(true);
        try {
            await register({
                email: trimmedEmail, name: trimmedName, password, phoneNumber,
                address: { street, streetNumber, distric },
                account: { pointsPerPurchase: 0, isActive: true },
            });
            Swal.fire({
                toast: true, position: 'top-end', icon: 'success',
                title: '¡Cuenta creada exitosamente!',
                showConfirmButton: false, timer: 2500, timerProgressBar: true,
            });
            navigate('/account');
        } catch (err) {
            const msg = err.response?.data?.message || 'Error al registrarse';
            setError(msg);
            Swal.fire({
                toast: true, position: 'top-end', icon: 'error',
                title: 'Correo o Número ya registrado, intenta con otro.',
                showConfirmButton: false, timer: 3000, timerProgressBar: true,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Breadcrumb */}
            <div className="container py-4 flex items-center gap-3">
                <Link to="/" className="text-primary text-base">
                    <i className="fa-solid fa-house text-[#610361]"></i>
                </Link>
                <span className="text-sm text-gray-400"><i className="fa-solid fa-chevron-right"></i></span>
                <p className="text-gray-600 font-winkySans font-medium">Register</p>
            </div>

            {/* Main */}
            <div
                className="min-h-screen py-8 sm:py-10 flex items-center justify-center relative overflow-hidden font-winkySans"
                style={{ background: 'radial-gradient(1200px circle at 8% -10%, #ffffff 0%, #f6e8ff 42%, #fce7f3 100%)' }}
            >
                <div className="absolute -left-20 top-12 h-48 w-48 rounded-full bg-[#f3d7ff] opacity-70 blur-3xl"></div>
                <div className="absolute -right-16 bottom-8 h-44 w-44 rounded-full bg-[#ffe1f2] opacity-70 blur-3xl"></div>

                <div className="relative w-full max-w-[720px] mx-4">
                    {/* Card */}
                    <div className="bg-white/85 backdrop-blur rounded-3xl shadow-[0_28px_70px_rgba(97,3,97,0.22)] border border-white/70 overflow-hidden">
                        {/* Top accent bar */}
                        <div className="h-1.5 w-full" style={{ background: '#610361' }} />

                        <div className="px-6 py-6 sm:px-8 sm:py-7">
                            {/* Header */}
                            <div className="text-center mb-4">
                                <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg" style={{ background: '#610361' }}>
                                    <i className="fa-solid fa-user-plus text-white text-lg"></i>
                                </div>
                                <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#610361] font-winkySans leading-tight">Crear Cuenta</h2>
                                <p className="text-sm text-gray-400 font-winkySans sm:block hidden">Regístrate para comprar y ver tus pedidos.</p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit}>
                                <div className="grid gap-3 sm:grid-cols-2">
                                    {/* Nombre */}
                                    <div>
                                        <label className="text-xs uppercase tracking-widest font-semibold text-[#610361] mb-2 block font-winkySans">
                                            Nombre Completo
                                        </label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-purple-300 pointer-events-none">
                                                <i className="fa-solid fa-circle-user text-sm"></i>
                                            </span>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={(e) => {
                                                    setName(e.target.value.slice(0, LIMITS.nameMax));
                                                    if (error) setError('');
                                                }}
                                                required
                                                maxLength={LIMITS.nameMax}
                                                className="block w-full pl-11 pr-4 py-2.5 text-gray-700 bg-purple-50/50 rounded-2xl border border-purple-100 focus:ring-2 focus:ring-[#610361]/30 focus:border-[#610361] transition placeholder-gray-300 font-winkySans text-sm outline-none"
                                                placeholder="Tu nombre"
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="text-xs uppercase tracking-widest font-semibold text-[#610361] mb-2 block font-winkySans">
                                            Email
                                        </label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-purple-300 pointer-events-none">
                                                <i className="fa-solid fa-envelope text-sm"></i>
                                            </span>
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value.slice(0, LIMITS.emailMax));
                                                    if (error) setError('');
                                                }}
                                                required
                                                maxLength={LIMITS.emailMax}
                                                inputMode="email"
                                                autoComplete="email"
                                                className="block w-full pl-11 pr-4 py-2.5 text-gray-700 bg-purple-50/50 rounded-2xl border border-purple-100 focus:ring-2 focus:ring-[#610361]/30 focus:border-[#610361] transition placeholder-gray-300 font-winkySans text-sm outline-none"
                                                placeholder="tucorreo@dominio.com"
                                            />
                                        </div>
                                    </div>

                                    {/* Contraseña */}
                                    <div>
                                        <label className="text-xs uppercase tracking-widest font-semibold text-[#610361] mb-2 block font-winkySans">
                                            Contraseña
                                        </label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-purple-300 pointer-events-none">
                                                <i className="fa-solid fa-lock text-sm"></i>
                                            </span>
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                value={password}
                                                onChange={(e) => {
                                                    setPassword(e.target.value.slice(0, LIMITS.passwordMax));
                                                    if (error) setError('');
                                                }}
                                                required
                                                maxLength={LIMITS.passwordMax}
                                                autoComplete="new-password"
                                                className="block w-full pl-11 pr-12 py-2.5 text-gray-700 bg-purple-50/50 rounded-2xl border border-purple-100 focus:ring-2 focus:ring-[#610361]/30 focus:border-[#610361] transition placeholder-gray-300 font-winkySans text-sm outline-none"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-purple-300 hover:text-[#610361] transition-colors duration-200"
                                                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                            >
                                                <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                                            </button>
                                        </div>
                                        <p className="mt-2 text-[11px] text-gray-400">
                                            Debe incluir una mayuscula, un numero y un caracter especial.
                                        </p>
                                    </div>

                                    {/* Teléfono */}
                                    <div>
                                        <label className="text-xs uppercase tracking-widest font-semibold text-[#610361] mb-2 block font-winkySans">
                                            Teléfono
                                        </label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-purple-300 pointer-events-none">
                                                <i className="fa-solid fa-phone text-sm"></i>
                                            </span>
                                            <input
                                                type="tel"
                                                value={phoneNumber}
                                                onChange={(e) => {
                                                    setPhoneNumber(e.target.value.slice(0, LIMITS.phoneMax));
                                                    if (error) setError('');
                                                }}
                                                maxLength={LIMITS.phoneMax}
                                                inputMode="tel"
                                                autoComplete="tel"
                                                className="block w-full pl-11 pr-4 py-2.5 text-gray-700 bg-purple-50/50 rounded-2xl border border-purple-100 focus:ring-2 focus:ring-[#610361]/30 focus:border-[#610361] transition placeholder-gray-300 font-winkySans text-sm outline-none"
                                                placeholder="3001234567"
                                            />
                                        </div>
                                    </div>

                                    {/* Dirección */}
                                    <div className="sm:col-span-2">
                                        <label className="text-xs uppercase tracking-widest font-semibold text-[#610361] mb-2 block font-winkySans">
                                            Dirección de Envío
                                        </label>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <div className="relative sm:col-span-2">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-purple-300 pointer-events-none">
                                                    <i className="fa-solid fa-map-pin text-sm"></i>
                                                </span>
                                                <input
                                                    type="text"
                                                    value={street}
                                                    onChange={(e) => {
                                                        setStreet(e.target.value.slice(0, LIMITS.streetMax));
                                                        if (error) setError('');
                                                    }}
                                                    maxLength={LIMITS.streetMax}
                                                    className="block w-full pl-11 pr-4 py-2.5 text-gray-700 bg-purple-50/50 rounded-2xl border border-purple-100 focus:ring-2 focus:ring-[#610361]/30 focus:border-[#610361] transition placeholder-gray-300 font-winkySans text-sm outline-none"
                                                    placeholder="Calle"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                value={streetNumber}
                                                onChange={(e) => {
                                                    setStreetNumber(e.target.value.slice(0, LIMITS.streetNumberMax));
                                                    if (error) setError('');
                                                }}
                                                maxLength={LIMITS.streetNumberMax}
                                                className="block w-full px-4 py-2.5 text-gray-700 bg-purple-50/50 rounded-2xl border border-purple-100 focus:ring-2 focus:ring-[#610361]/30 focus:border-[#610361] transition placeholder-gray-300 font-winkySans text-sm outline-none"
                                                placeholder="Numero"
                                            />
                                            <input
                                                type="text"
                                                value={distric}
                                                onChange={(e) => {
                                                    setDistric(e.target.value.slice(0, LIMITS.districMax));
                                                    if (error) setError('');
                                                }}
                                                maxLength={LIMITS.districMax}
                                                className="block w-full px-4 py-2.5 text-gray-700 bg-purple-50/50 rounded-2xl border border-purple-100 focus:ring-2 focus:ring-[#610361]/30 focus:border-[#610361] transition placeholder-gray-300 font-winkySans text-sm outline-none"
                                                placeholder="Barrio"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="mt-5">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-2.5 rounded-2xl text-white font-winkySans font-bold tracking-widest uppercase text-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                                        style={{ background: '#610361' }}
                                    >
                                        {loading
                                            ? <><i className="fa-solid fa-spinner fa-spin mr-2"></i>Creando cuenta...</>
                                            : <><i className="fa-solid fa-user-plus mr-2"></i>Crear Cuenta</>
                                        }
                                    </button>
                                </div>
                            </form>

                            {/* Login link */}
                            <p className="mt-4 text-center text-xs text-gray-400 font-winkySans">
                                ¿Ya tienes una cuenta?{' '}
                                <Link to="/login" className="text-[#a21caf] font-bold hover:underline transition-colors duration-150">
                                    Inicia Sesión
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Subtle bottom note */}
                    <p className="hidden sm:block text-center text-[11px] text-gray-400 mt-4 font-winkySans tracking-wide">
                        Kio Gloss · Tu tienda de belleza ✦
                    </p>
                </div>
            </div>
        </>
    );
}